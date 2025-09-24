export const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://code.jquery.com", "https://cdn.jsdelivr.net/npm/sweetalert2@11"],
  styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:"],
  connectSrc: ["'self'", "ws:", "wss:"],
};
