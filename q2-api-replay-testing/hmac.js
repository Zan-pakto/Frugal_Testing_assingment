const crypto = require('crypto');

/**
 * Generates an HMAC SHA512 signature.
 * Formula: HMAC_SHA512(body + timestamp + salt, key=salt)
 * 
 * @param {object|string} body - The request body payload.
 * @param {string|number} timestamp - The timestamp of the transaction.
 * @param {string} salt - The unique nonce/salt from the transaction init.
 * @returns {string} The hex encoded HMAC.
 */
function generateHMAC(body, timestamp, salt) {
  const bodyStr = typeof body === 'object' ? JSON.stringify(body) : body;
  const message = bodyStr + timestamp + salt;
  
  // We use the salt as the HMAC secret key
  return crypto.createHmac('sha512', salt)
    .update(message)
    .digest('hex');
}

module.exports = { generateHMAC };
