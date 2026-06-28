# Q2: Cryptographic Replay Testing, Stateful Nonces & Hash Chain API Chaining

This directory contains the Express.js Mock Transaction Server and the Axios automation suite to test cryptographic integrity and replay protection.

## Features

1. **Stateful Nonce Generation**: When a transaction is initialized, the server generates a cryptographically secure random `nonce` (salt) and binds it to a `transactionId`.
2. **HMAC SHA512 Verification**: Transaction updates are verified using a Hash-based Message Authentication Code with SHA-512.
   - **Formula**: `HMAC_SHA512(body + timestamp + salt, key=salt)`
3. **Replay Protection**: The server keeps track of used nonces. Once a transaction is successfully updated, the associated nonce is consumed. Any subsequent request with the same transaction session is rejected with a `409 Conflict`.
4. **Vulnerability Detection**: The Axios-based automation script simulates a replay attack immediately after a successful transaction. If the server accepts the duplicate payload, the test throws a `"Critical Replay Vulnerability Detected"` error.

## Folder Structure

```
q2-api-replay-testing/
├── server/
│   ├── server.js           # Express mock API server
│   └── package.json
├── tests/
│   └── replay.test.js      # Axios replay attack test runner
├── hmac.js                 # Shared HMAC SHA512 utility
├── package.json
└── README.md
```

## How to Run

1. Install dependencies:
   ```bash
   cd q2-api-replay-testing
   npm install
   cd server
   npm install
   cd ..
   ```

2. Run the replay test:
   ```bash
   npm test
   ```
   *The test automatically starts the server in the background on port 4000, runs the transaction requests, executes the replay verification, and shuts down the server upon completion.*
