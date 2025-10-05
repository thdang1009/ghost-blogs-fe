import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Client-Side Code Validation Service
 *
 * Provides comprehensive security validation for user-provided JavaScript code
 * before execution in the isolated Web Worker environment.
 */
@Injectable({
  providedIn: 'root',
})
export class CodeValidatorService {
  private readonly DANGEROUS_PATTERNS = [
    /eval\s*\(/gi, // eval() calls
    /Function\s*\(/gi, // Function constructor
    /setTimeout\s*\(/gi, // setTimeout (can be used for infinite loops)
    /setInterval\s*\(/gi, // setInterval
    /while\s*\(\s*true\s*\)/gi, // while(true) loops
    /for\s*\(\s*;;\s*\)/gi, // for(;;) infinite loops
    /import\s+/gi, // ES6 imports
    /require\s*\(/gi, // CommonJS requires
    /fetch\s*\(/gi, // Network requests
    /XMLHttpRequest/gi, // AJAX requests
    /localStorage/gi, // Local storage access
    /sessionStorage/gi, // Session storage access
    /document\./gi, // DOM manipulation
    /window\./gi, // Window object access
    /location\./gi, // Location manipulation
    /navigator\./gi, // Navigator object
    /alert\s*\(/gi, // Browser alerts
    /confirm\s*\(/gi, // Browser confirms
    /prompt\s*\(/gi, // Browser prompts
    /history\./gi, // Browser history
    /cookie/gi, // Cookie access
  ];

  private readonly MAX_CODE_LENGTH = 5000; // 5KB limit (reduced for client-side)
  private readonly MAX_LINES = 500; // 200 lines max
  private readonly MAX_EXECUTION_TIME = 3000; // 3 seconds max

  /**
   * Validates JavaScript code for security and safety
   */
  validateCode(code: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Basic validation
    if (!code || typeof code !== 'string') {
      result.isValid = false;
      result.errors.push('Code must be a non-empty string');
      return result;
    }

    // Length validation
    if (code.length > this.MAX_CODE_LENGTH) {
      result.isValid = false;
      result.errors.push(
        `Code exceeds maximum length of ${this.MAX_CODE_LENGTH} characters`
      );
    }

    // Line count validation
    const lineCount = code.split('\n').length;
    if (lineCount > this.MAX_LINES) {
      result.isValid = false;
      result.errors.push(`Code exceeds maximum of ${this.MAX_LINES} lines`);
    }

    // Dangerous pattern detection
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(code)) {
        result.isValid = false;
        result.errors.push(
          `Dangerous code pattern detected: ${this.getPatternDescription(pattern)}`
        );
      }
    }

    // Check for excessive nesting (potential complexity issues)
    if (this.hasExcessiveNesting(code)) {
      result.warnings.push(
        'Code has deep nesting levels - may impact performance'
      );
    }

    // Check for potential infinite recursion
    if (this.hasPotentialInfiniteRecursion(code)) {
      result.warnings.push(
        'Code may contain recursive functions - ensure proper base cases'
      );
    }

    // Syntax validation (basic)
    try {
      new Function(code); // Test if code is syntactically valid
    } catch (error: any) {
      result.warnings.push(`Syntax warning: ${error.message}`);
    }

    return result;
  }

  /**
   * Sanitizes code by removing potentially dangerous content
   */
  sanitizeCode(code: string): string {
    if (!code) return '';

    return code
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .trim();
  }

  /**
   * Checks if code is suitable for interactive execution
   */
  isCodeSuitableForExecution(code: string): boolean {
    if (!code || code.length < 10) return false;

    // Auto-detect if regular JavaScript code should be made interactive
    const indicators = [
      /console\.log\s*\(/i, // Has console.log
      /return\s+/i, // Has return statements
      /function\s+\w+\s*\(/i, // Defines functions
      /const\s+\w+\s*=/i, // Variable declarations
      /let\s+\w+\s*=/i, // Variable declarations
      /var\s+\w+\s*=/i, // Variable declarations
      /\.map\s*\(/i, // Array methods
      /\.filter\s*\(/i, // Array methods
      /\.reduce\s*\(/i, // Array methods
      /\.forEach\s*\(/i, // Array methods
      /if\s*\(/i, // Conditional statements
      /for\s*\(/i, // Loop statements
    ];

    const hasIndicators = indicators.some(pattern => pattern.test(code));
    const isSafe = !this.hasDangerousPatterns(code);
    const isReasonableLength =
      code.length < 800 && code.split('\n').length < 30;

    return hasIndicators && isSafe && isReasonableLength;
  }

  private hasDangerousPatterns(code: string): boolean {
    return this.DANGEROUS_PATTERNS.some(pattern => pattern.test(code));
  }

  private hasExcessiveNesting(code: string): boolean {
    const lines = code.split('\n');
    let maxNesting = 0;
    let currentNesting = 0;

    for (const line of lines) {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      currentNesting += openBraces - closeBraces;
      maxNesting = Math.max(maxNesting, currentNesting);
    }

    return maxNesting > 6; // More than 6 levels of nesting
  }

  private hasPotentialInfiniteRecursion(code: string): boolean {
    // Simple check for recursive function calls
    const functionNames = code.match(/function\s+(\w+)/g);
    if (!functionNames) return false;

    for (const funcDecl of functionNames) {
      const funcName = funcDecl.replace('function ', '');
      const funcNameRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
      const calls = code.match(funcNameRegex);
      if (calls && calls.length > 1) {
        return true; // Function calls itself
      }
    }

    return false;
  }

  private getPatternDescription(pattern: RegExp): string {
    const patternMap: { [key: string]: string } = {
      'eval\\s*\\(': 'eval() function (security risk)',
      'Function\\s*\\(': 'Function constructor (security risk)',
      'setTimeout\\s*\\(': 'setTimeout() (potential infinite loops)',
      'setInterval\\s*\\(': 'setInterval() (potential infinite loops)',
      'while\\s*\\(\\s*true\\s*\\)': 'infinite while loop',
      'for\\s*\\(\\s*;;\\s*\\)': 'infinite for loop',
      'import\\s+': 'ES6 import statement',
      'require\\s*\\(': 'require() statement',
      'fetch\\s*\\(': 'fetch() network request',
      XMLHttpRequest: 'XMLHttpRequest (network access)',
      localStorage: 'localStorage access',
      sessionStorage: 'sessionStorage access',
      'document\\.': 'DOM manipulation',
      'window\\.': 'window object access',
      'location\\.': 'location object access',
      'navigator\\.': 'navigator object access',
      'alert\\s*\\(': 'alert() dialog',
      'confirm\\s*\\(': 'confirm() dialog',
      'prompt\\s*\\(': 'prompt() dialog',
    };

    const source = pattern.source.toLowerCase();
    return patternMap[source] || 'potentially dangerous code';
  }

  /**
   * Gets validation limits for display to users
   */
  getValidationLimits() {
    return {
      maxCodeLength: this.MAX_CODE_LENGTH,
      maxLines: this.MAX_LINES,
      maxExecutionTime: this.MAX_EXECUTION_TIME,
    };
  }
}
