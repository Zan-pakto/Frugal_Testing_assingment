const express = require('express');
const crypto = require('crypto');
const { generateHMAC } = require('../hmac');

const app = express();
app.use(express.json());

// In-memory store for active transaction sessions
// Format: { [transactionId]: { nonce, timestamp, used: false } }
const transactions = new Map();

// POST /transaction
// Initializes a transaction session, generating a unique ID, stateful nonce, and timestamp
app.post('/transaction', (req, res) => {
  const transactionId = crypto.randomUUID();
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();

  transactions.set(transactionId, {
    nonce,
    timestamp,
    used: false
  });

  console.log(`Initialized transaction ${transactionId} with nonce ${nonce}`);
  
  res.status(201).json({
    transactionId,
    nonce,
    timestamp
  });
});

// PUT /transaction/:id
// Processes and validates the transaction update. Rejects replay attacks and invalid signatures.
app.put('/transaction/:id', (req, res) => {
  const { id } = req.params;
  const transaction = transactions.get(id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction session not found'
    });
  }

  // 1. Replay Protection: Check if nonce was already consumed
  if (transaction.used) {
    console.warn(`Replay attack detected for transaction ${id}!`);
    return res.status(409).json({
      success: false,
      message: 'Transaction already processed. Replay attack detected.'
    });
  }

  const hmacHeader = req.headers['x-frugal-mac'];
  const reqTimestamp = req.headers['x-frugal-timestamp'] || req.body.timestamp;

  if (!hmacHeader) {
    return res.status(400).json({
      success: false,
      message: 'Missing X-Frugal-Mac header'
    });
  }

  if (!reqTimestamp) {
    return res.status(400).json({
      success: false,
      message: 'Missing transaction timestamp'
    });
  }

  // 2. Timestamp Validation (e.g. 5-minute tolerance window)
  const timeDifference = Math.abs(Date.now() - Number(reqTimestamp));
  if (timeDifference > 300000) { // 5 minutes
    return res.status(400).json({
      success: false,
      message: 'Request timestamp is out of the valid time window'
    });
  }

  // 3. Cryptographic Signature Validation
  // We exclude the timestamp from the body string to match the generation formula
  const bodyPayload = { ...req.body };
  delete bodyPayload.timestamp; // Ensure consistent body formatting

  const calculatedHmac = generateHMAC(bodyPayload, reqTimestamp, transaction.nonce);

  if (calculatedHmac !== hmacHeader) {
    console.warn(`Signature verification failed for transaction ${id}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid HMAC signature'
    });
  }

  // Success: Consume the nonce statefully
  transaction.used = true;
  console.log(`Transaction ${id} processed successfully.`);

  res.status(200).json({
    success: true,
    message: 'Transaction completed successfully'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Transaction Mock Server running on http://localhost:${PORT}`);
});
