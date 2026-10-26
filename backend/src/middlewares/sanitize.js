/**
 * Sanitizes input to prevent NoSQL query injection and XSS
 * Recursively strips keys starting with '$' or containing '.' from objects
 */
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prohibit keys starting with $ (MongoDB query operators) or containing .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'string') {
      // Basic XSS mitigation by escaping raw script tags
      clean[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export function noSqlSanitizer(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}
