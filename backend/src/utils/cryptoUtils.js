import crypto from 'crypto';

const API_KEY_PREFIX = 'dm_live_';

/**
 * Generates a cryptographically secure API key
 * Returns the plain key (shown only once to user) and the SHA-256 hash (stored in DB)
 */
export function generateApiKey() {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const plainKey = `${API_KEY_PREFIX}${randomBytes}`;
  const keyHash = hashApiKey(plainKey);
  const keyPrefix = `${API_KEY_PREFIX}${plainKey.slice(-6)}`; // Last 6 chars for identifying in UI

  return {
    plainKey,
    keyHash,
    keyPrefix,
  };
}

/**
 * Computes SHA-256 hash of an API key
 */
export function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqualStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Masks an API key for safe UI display
 * e.g., dm_live_••••••••••••••••••••••••••••••••••••••••••••••••5a9f
 */
export function maskApiKey(keyPrefix) {
  return `dm_live_••••••••••••••••••••${keyPrefix || '••••'}`;
}
