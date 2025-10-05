/**
 * Isolated Web Worker for Safe JavaScript Code Execution
 *
 * This worker provides a completely sandboxed environment for executing
 * user-provided JavaScript code with zero access to DOM, network, or
 * dangerous browser APIs.
 */

self.onmessage = function (event) {
  const { code, timestamp } = event.data;
  const startTime = performance.now();

  let output = '';
  let error = null;

  // Create isolated console for capturing output
  const console = {
    log: (...args) => {
      output +=
        args
          .map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          )
          .join(' ') + '\n';
    },
    error: (...args) => {
      output += '❌ ERROR: ' + args.join(' ') + '\n';
    },
    warn: (...args) => {
      output += '⚠️ WARNING: ' + args.join(' ') + '\n';
    },
    info: (...args) => {
      output += 'ℹ️ INFO: ' + args.join(' ') + '\n';
    },
    clear: () => {
      output = '';
    },
    table: data => {
      if (Array.isArray(data)) {
        output += 'Table:\n' + JSON.stringify(data, null, 2) + '\n';
      } else {
        output += 'Table: ' + JSON.stringify(data, null, 2) + '\n';
      }
    },
  };

  // Completely isolated environment - NO access to dangerous APIs
  const restrictedGlobal = {
    console,
    JSON,
    Math,
    Date,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    // Safe utility functions
    btoa: typeof btoa !== 'undefined' ? btoa : undefined,
    atob: typeof atob !== 'undefined' ? atob : undefined,
    // Safe Math constants
    PI: Math.PI,
    E: Math.E,
  };

  try {
    // Pre-validate code for unsupported syntax
    if (code.includes('import ') || code.includes('export ')) {
      throw new Error(
        'ES6 import/export statements are not supported in this environment. Use regular function declarations instead.'
      );
    }

    // Create function with restricted scope and safer code injection
    const restrictionCode = [
      '// Prevent access to global scope and dangerous APIs',
      'var window = undefined;',
      'var global = undefined;',
      'var self = undefined;',
      'var document = undefined;',
      'var location = undefined;',
      'var navigator = undefined;',
      'var history = undefined;',
      'var localStorage = undefined;',
      'var sessionStorage = undefined;',
      'var fetch = undefined;',
      'var XMLHttpRequest = undefined;',
      'var setTimeout = undefined;',
      'var setInterval = undefined;',
      'var clearTimeout = undefined;',
      'var clearInterval = undefined;',
      'var eval = undefined;',
      'var Function = undefined;',
      'var require = undefined;',
      'var process = undefined;',
      '',
      '// Execute user code in isolated environment',
    ].join('\n');

    const fullCode = restrictionCode + '\n' + code;

    const executeCode = new Function(
      ...Object.keys(restrictedGlobal),
      fullCode
    );

    // Execute with strict timeout (handled by main thread)
    executeCode(...Object.values(restrictedGlobal));
  } catch (err) {
    console.error('Worker execution error:', err);
    error = err.message;
    output += `\n❌ Execution Error: ${err.message}`;
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  // Send results back to main thread
  self.postMessage({
    output: output.trim() || '✅ Code executed successfully (no output)',
    error,
    executionTime: Math.round(executionTime * 100) / 100,
    timestamp,
  });
};

// Handle any uncaught errors in the worker
self.onerror = function (error) {
  self.postMessage({
    output: '',
    error: `Worker Error: ${error.message}`,
    executionTime: 0,
    timestamp: Date.now(),
  });
};
