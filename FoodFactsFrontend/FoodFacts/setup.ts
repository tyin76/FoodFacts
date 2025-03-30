if (typeof Blob !== 'undefined') {
    Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
      value: 'Blob',
      writable: false,
      enumerable: false,
      configurable: true,
    });
  }
  
  if (typeof File !== 'undefined') {
    Object.defineProperty(File.prototype, Symbol.toStringTag, {
      value: 'File',
      writable: false,
      enumerable: false,
      configurable: true,
    });
  }
  
  // You can add other global setup code here if needed.