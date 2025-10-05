import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  CodeValidatorService,
  ValidationResult,
} from '../code-validator/code-validator.service';

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
  warnings?: string[];
}

export interface CodeBlock {
  id: string;
  code: string;
  language: string;
  isExecutable: boolean;
  title?: string;
  description?: string;
}

/**
 * Client-Side Code Runner Service
 *
 * Orchestrates the execution of JavaScript code in isolated Web Workers
 * with comprehensive security validation and rate limiting.
 */
@Injectable({
  providedIn: 'root',
})
export class CodeRunnerService {
  private workers = new Map<string, Worker>();
  private executionCount = new Map<string, number>(); // Rate limiting per session
  private readonly RATE_LIMIT = 20; // Max 20 executions per minute (more generous since no server load)
  private readonly WORKER_PATH = '/assets/js/code-executor.worker.js';

  private executionResults$ = new Subject<{
    blockId: string;
    result: ExecutionResult;
  }>();

  constructor(private validator: CodeValidatorService) {}

  /**
   * Executes JavaScript code in an isolated Web Worker
   */
  async executeCode(
    codeBlockId: string,
    code: string
  ): Promise<ExecutionResult> {
    // Rate limiting check (client-side only)
    if (this.isRateLimited(codeBlockId)) {
      throw new Error(
        'Too many executions. Please wait before running code again.'
      );
    }

    // Validate and sanitize code
    const sanitizedCode = this.validator.sanitizeCode(code);
    const validation = this.validator.validateCode(sanitizedCode);

    if (!validation.isValid) {
      throw new Error(
        `Code validation failed: ${validation.errors.join(', ')}`
      );
    }

    // Track execution for rate limiting
    this.trackExecution(codeBlockId);

    return new Promise((resolve, reject) => {
      // Create isolated Web Worker for code execution
      const worker = new Worker(this.WORKER_PATH);
      this.workers.set(codeBlockId, worker);

      const timeout = setTimeout(() => {
        worker.terminate();
        this.workers.delete(codeBlockId);
        reject(new Error('Code execution timed out (3 seconds)'));
      }, 3000); // 3 seconds timeout for better UX

      worker.onmessage = event => {
        clearTimeout(timeout);
        const result = event.data as ExecutionResult;
        worker.terminate();
        this.workers.delete(codeBlockId);

        // Add validation warnings to result
        if (validation.warnings.length > 0) {
          result.warnings = validation.warnings;
        }

        // Emit result for any subscribers
        this.executionResults$.next({ blockId: codeBlockId, result });

        resolve(result);
      };

      worker.onerror = error => {
        clearTimeout(timeout);
        worker.terminate();
        this.workers.delete(codeBlockId);
        reject(new Error(`Worker error: ${error.message || 'Unknown error'}`));
      };

      // Send sanitized code to worker
      worker.postMessage({
        code: sanitizedCode,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Stops execution of a specific code block
   */
  stopExecution(codeBlockId: string): void {
    const worker = this.workers.get(codeBlockId);
    if (worker) {
      worker.terminate();
      this.workers.delete(codeBlockId);
    }
  }

  /**
   * Generates a shareable URL with base64 encoded code (no server required)
   */
  shareCode(codeBlockId: string, code: string): string {
    try {
      const encodedCode = btoa(encodeURIComponent(code));
      return `${window.location.origin}${window.location.pathname}#code=${encodedCode}`;
    } catch (error) {
      console.error('Failed to encode code for sharing:', error);
      return window.location.href;
    }
  }

  /**
   * Copies code to clipboard
   */
  async copyToClipboard(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Loads shared code from URL fragment
   */
  loadSharedCode(): string | null {
    try {
      const hash = window.location.hash;
      const codeMatch = hash.match(/#code=([^&]+)/);

      if (codeMatch) {
        const encodedCode = codeMatch[1];
        return decodeURIComponent(atob(encodedCode));
      }
    } catch (error) {
      console.error('Failed to decode shared code:', error);
    }

    return null;
  }

  /**
   * Gets execution results observable for real-time updates
   */
  getExecutionResults(): Observable<{
    blockId: string;
    result: ExecutionResult;
  }> {
    return this.executionResults$.asObservable();
  }

  /**
   * Checks if code execution is currently rate limited
   */
  private isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const key = `${identifier}-${Math.floor(now / 60000)}`; // Per minute window
    const count = this.executionCount.get(key) || 0;
    return count >= this.RATE_LIMIT;
  }

  /**
   * Tracks execution for rate limiting
   */
  private trackExecution(identifier: string): void {
    const now = Date.now();
    const key = `${identifier}-${Math.floor(now / 60000)}`;
    const count = this.executionCount.get(key) || 0;
    this.executionCount.set(key, count + 1);

    // Cleanup old entries (client-side memory management)
    this.cleanupOldExecutionRecords();
  }

  /**
   * Cleans up old execution records to prevent memory leaks
   */
  private cleanupOldExecutionRecords(): void {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);

    for (const [key] of this.executionCount) {
      const keyMinute = parseInt(key.split('-').pop() || '0');
      if (currentMinute - keyMinute > 5) {
        // Keep last 5 minutes
        this.executionCount.delete(key);
      }
    }
  }

  /**
   * Gets current rate limiting status
   */
  getRateLimitStatus(identifier: string): {
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const key = `${identifier}-${Math.floor(now / 60000)}`;
    const count = this.executionCount.get(key) || 0;
    const remaining = Math.max(0, this.RATE_LIMIT - count);
    const resetTime = (Math.floor(now / 60000) + 1) * 60000; // Next minute

    return { remaining, resetTime };
  }

  /**
   * Validates if code is suitable for execution
   */
  validateCode(code: string): ValidationResult {
    return this.validator.validateCode(code);
  }

  /**
   * Checks if code is automatically suitable for interactive execution
   */
  isCodeSuitableForExecution(code: string): boolean {
    return this.validator.isCodeSuitableForExecution(code);
  }

  /**
   * Gets validation limits for display
   */
  getValidationLimits() {
    return this.validator.getValidationLimits();
  }

  /**
   * Cleanup method to terminate all workers
   */
  cleanup(): void {
    for (const [id, worker] of this.workers) {
      worker.terminate();
    }
    this.workers.clear();
    this.executionCount.clear();
  }
}
