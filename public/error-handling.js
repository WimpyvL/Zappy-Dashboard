// Error handling script for Tempo
window.addEventListener('error', function (event) {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(
      {
        type: 'TEMPO_ERROR',
        error: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error ? event.error.stack : null,
        },
      },
      '*'
    );
  }
});

window.addEventListener('unhandledrejection', function (event) {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(
      {
        type: 'TEMPO_ERROR',
        error: {
          message: event.reason
            ? event.reason.message || String(event.reason)
            : 'Unhandled Promise Rejection',
          stack: event.reason && event.reason.stack ? event.reason.stack : null,
        },
      },
      '*'
    );
  }
});
