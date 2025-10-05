import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { CodeValidatorService } from '../code-validator/code-validator.service';

export interface CodeRunResult {
  output: string;
  error?: string;
  executionTime: number;
}

/**
 * Simple Code Runner Service
 *
 * Adds run buttons to existing code blocks without changing the DOM structure.
 * Uses the existing Web Worker for safe execution.
 */
@Injectable({
  providedIn: 'root',
})
export class SimpleCodeRunnerService {
  private renderer: Renderer2;
  private activeOverlay: HTMLElement | null = null;

  constructor(
    private rendererFactory: RendererFactory2,
    private validator: CodeValidatorService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Initialize run buttons for JavaScript code blocks in the given container
   */
  initializeRunButtons(container: HTMLElement): void {
    // Find all pre > code elements with JavaScript
    const codeBlocks = container.querySelectorAll(
      'pre code.language-javascript, pre code.language-js'
    );

    codeBlocks.forEach((codeBlock: Element) => {
      const codeElement = codeBlock as HTMLElement;
      const preElement = codeElement.parentElement;

      if (preElement && !preElement.querySelector('.run-button')) {
        this.addRunButtonToCodeBlock(preElement, codeElement);
      }
    });
  }

  private addRunButtonToCodeBlock(
    preElement: HTMLElement,
    codeElement: HTMLElement
  ): void {
    // Get the code content
    const code = codeElement.textContent || '';

    // Check if code is suitable for execution
    if (!this.isCodeRunnable(code)) {
      return;
    }

    // Create run button container
    const buttonContainer = this.renderer.createElement('div');
    this.renderer.addClass(buttonContainer, 'code-run-container');

    // Create run button
    const runButton = this.renderer.createElement('button');
    this.renderer.addClass(runButton, 'run-button');
    this.renderer.setProperty(runButton, 'innerHTML', '▶️ Run');
    this.renderer.setAttribute(runButton, 'title', 'Run this JavaScript code');

    // Add click event
    this.renderer.listen(runButton, 'click', () => {
      this.executeCode(code, runButton, preElement);
    });

    // Position the button container (left bottom)
    this.renderer.setStyle(buttonContainer, 'position', 'absolute');
    this.renderer.setStyle(buttonContainer, 'bottom', '8px');
    this.renderer.setStyle(buttonContainer, 'left', '8px');
    this.renderer.setStyle(buttonContainer, 'z-index', '10');

    // Style the run button
    this.styleRunButton(runButton);

    // Add button to container
    this.renderer.appendChild(buttonContainer, runButton);

    // Make pre element relative positioned
    this.renderer.setStyle(preElement, 'position', 'relative');

    // Add button container to pre element
    this.renderer.appendChild(preElement, buttonContainer);
  }

  private styleRunButton(button: HTMLElement): void {
    this.renderer.setStyle(
      button,
      'background',
      'linear-gradient(135deg, #4CAF50, #45a049)'
    );
    this.renderer.setStyle(button, 'color', 'white');
    this.renderer.setStyle(button, 'border', 'none');
    this.renderer.setStyle(button, 'padding', '6px 12px');
    this.renderer.setStyle(button, 'border-radius', '4px');
    this.renderer.setStyle(button, 'cursor', 'pointer');
    this.renderer.setStyle(button, 'font-size', '12px');
    this.renderer.setStyle(button, 'font-weight', '600');
    this.renderer.setStyle(button, 'transition', 'all 0.2s ease');
    this.renderer.setStyle(button, 'box-shadow', '0 2px 4px rgba(0,0,0,0.2)');

    // Hover effects
    this.renderer.listen(button, 'mouseenter', () => {
      this.renderer.setStyle(button, 'transform', 'translateY(-1px)');
      this.renderer.setStyle(button, 'box-shadow', '0 4px 8px rgba(0,0,0,0.3)');
    });

    this.renderer.listen(button, 'mouseleave', () => {
      this.renderer.setStyle(button, 'transform', 'translateY(0)');
      this.renderer.setStyle(button, 'box-shadow', '0 2px 4px rgba(0,0,0,0.2)');
    });
  }

  private isCodeRunnable(code: string): boolean {
    // Simple checks for runnable JavaScript
    const indicators = [
      /console\.log/i,
      /function\s+\w+/i,
      /const\s+\w+/i,
      /let\s+\w+/i,
      /var\s+\w+/i,
      /=>/i, // Arrow functions
      /\.map\(/i,
      /\.filter\(/i,
      /\.reduce\(/i,
      /for\s*\(/i,
      /if\s*\(/i,
    ];

    const hasIndicators = indicators.some(pattern => pattern.test(code));
    const validation = this.validator.validateCode(code);

    return hasIndicators && validation.isValid && code.length > 20;
  }

  private async executeCode(
    code: string,
    button: HTMLElement,
    preElement: HTMLElement
  ): Promise<void> {
    // Update button state
    this.renderer.setProperty(button, 'innerHTML', '⏳ Running...');
    this.renderer.setAttribute(button, 'disabled', 'true');
    this.renderer.setStyle(button, 'opacity', '0.7');

    try {
      const result = await this.runCodeInWorker(code);
      this.showResultOverlay(result, preElement);
    } catch (error: any) {
      this.showResultOverlay(
        {
          output: '',
          error: error.message || 'Execution failed',
          executionTime: 0,
        },
        preElement
      );
    } finally {
      // Reset button state
      this.renderer.setProperty(button, 'innerHTML', '▶️ Run');
      this.renderer.removeAttribute(button, 'disabled');
      this.renderer.setStyle(button, 'opacity', '1');
    }
  }

  private runCodeInWorker(code: string): Promise<CodeRunResult> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('/assets/js/code-executor.worker.js');
      const startTime = performance.now();

      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Code execution timed out'));
      }, 3000);

      worker.onmessage = event => {
        clearTimeout(timeout);
        const result = event.data;
        worker.terminate();
        resolve({
          output: result.output || 'No output',
          error: result.error,
          executionTime: performance.now() - startTime,
        });
      };

      worker.onerror = error => {
        clearTimeout(timeout);
        worker.terminate();
        reject(new Error(`Worker error: ${error.message || 'Unknown error'}`));
      };

      worker.postMessage({
        code: code,
        timestamp: Date.now(),
      });
    });
  }

  private showResultOverlay(
    result: CodeRunResult,
    preElement: HTMLElement
  ): void {
    // Remove any existing overlay
    this.hideResultOverlay();

    // Create overlay
    const overlay = this.renderer.createElement('div');
    this.renderer.addClass(overlay, 'code-result-overlay');
    this.styleResultOverlay(overlay);

    // Create header
    const header = this.renderer.createElement('div');
    this.renderer.addClass(header, 'overlay-header');
    this.renderer.setStyle(header, 'display', 'flex');
    this.renderer.setStyle(header, 'justify-content', 'space-between');
    this.renderer.setStyle(header, 'align-items', 'center');
    this.renderer.setStyle(header, 'margin-bottom', '8px');

    const title = this.renderer.createElement('span');
    this.renderer.setProperty(
      title,
      'textContent',
      result.error ? '❌ Error' : '✅ Output'
    );
    this.renderer.setStyle(title, 'font-weight', '600');
    this.renderer.setStyle(
      title,
      'color',
      result.error ? '#dc3545' : '#28a745'
    );

    const closeButton = this.renderer.createElement('button');
    this.renderer.setProperty(closeButton, 'innerHTML', '×');
    this.renderer.setStyle(closeButton, 'background', 'none');
    this.renderer.setStyle(closeButton, 'border', 'none');
    this.renderer.setStyle(closeButton, 'font-size', '20px');
    this.renderer.setStyle(closeButton, 'cursor', 'pointer');
    this.renderer.setStyle(closeButton, 'color', '#666');

    this.renderer.listen(closeButton, 'click', () => this.hideResultOverlay());

    this.renderer.appendChild(header, title);
    this.renderer.appendChild(header, closeButton);

    // Create content
    const content = this.renderer.createElement('pre');
    this.renderer.setProperty(
      content,
      'textContent',
      result.output || result.error || 'No output'
    );
    this.renderer.setStyle(content, 'margin', '0');
    this.renderer.setStyle(content, 'font-family', 'monospace');
    this.renderer.setStyle(content, 'font-size', '13px');
    this.renderer.setStyle(content, 'line-height', '1.4');
    this.renderer.setStyle(content, 'white-space', 'pre-wrap');
    this.renderer.setStyle(content, 'word-break', 'break-word');
    this.renderer.setStyle(content, 'max-height', '200px');
    this.renderer.setStyle(content, 'overflow-y', 'auto');
    this.renderer.setStyle(content, 'color', result.error ? '#dc3545' : '#333');

    // Create footer with execution time
    const footer = this.renderer.createElement('div');
    this.renderer.setStyle(footer, 'margin-top', '8px');
    this.renderer.setStyle(footer, 'font-size', '11px');
    this.renderer.setStyle(footer, 'color', '#666');
    this.renderer.setProperty(
      footer,
      'textContent',
      `Executed in ${result.executionTime.toFixed(2)}ms`
    );

    // Assemble overlay
    this.renderer.appendChild(overlay, header);
    this.renderer.appendChild(overlay, content);
    this.renderer.appendChild(overlay, footer);

    // Position overlay after the code block (outside of it)
    this.renderer.setStyle(overlay, 'position', 'relative');
    this.renderer.setStyle(overlay, 'z-index', '1000');
    this.renderer.setStyle(overlay, 'width', '100%');

    // Insert overlay after the pre element instead of inside it
    const parentElement = preElement.parentElement;
    if (parentElement) {
      const nextSibling = preElement.nextSibling;
      if (nextSibling) {
        this.renderer.insertBefore(parentElement, overlay, nextSibling);
      } else {
        this.renderer.appendChild(parentElement, overlay);
      }
    } else {
      // Fallback: add after pre element if no parent
      this.renderer.appendChild(preElement.parentNode, overlay);
    }

    this.activeOverlay = overlay;

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (this.activeOverlay === overlay) {
        this.hideResultOverlay();
      }
    }, 10000);
  }

  private styleResultOverlay(overlay: HTMLElement): void {
    this.renderer.setStyle(
      overlay,
      'background',
      'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    );
    this.renderer.setStyle(overlay, 'border', '2px solid #28a745');
    this.renderer.setStyle(overlay, 'border-radius', '8px');
    this.renderer.setStyle(overlay, 'padding', '16px');
    this.renderer.setStyle(overlay, 'margin', '12px 0');
    this.renderer.setStyle(
      overlay,
      'box-shadow',
      '0 4px 16px rgba(40, 167, 69, 0.2)'
    );
    this.renderer.setStyle(
      overlay,
      'font-family',
      'system-ui, -apple-system, sans-serif'
    );
    this.renderer.setStyle(overlay, 'animation', 'slideDown 0.3s ease-out');

    // Add slide down animation
    const style = this.renderer.createElement('style');
    this.renderer.setProperty(
      style,
      'textContent',
      `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
    );
    this.renderer.appendChild(document.head, style);
  }

  private hideResultOverlay(): void {
    if (this.activeOverlay) {
      this.renderer.removeChild(
        this.activeOverlay.parentNode,
        this.activeOverlay
      );
      this.activeOverlay = null;
    }
  }

  /**
   * Clean up - remove all run buttons and overlays
   */
  cleanup(container: HTMLElement): void {
    this.hideResultOverlay();
    const runContainers = container.querySelectorAll('.code-run-container');
    runContainers.forEach(container => {
      this.renderer.removeChild(container.parentNode, container);
    });
  }
}
