const { fork } = require('child_process');
const path = require('path');
const axios = require('axios');
const { generateHMAC } = require('../hmac');

// Start the Express server as a background process
const serverPath = path.join(__dirname, '../server/server.js');
const serverProcess = fork(serverPath, [], { silent: true });

// Listen to server output to log it
serverProcess.stdout.on('data', (data) => {
  console.log(`[Server]: ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[Server Error]: ${data.toString().trim()}`);
});

// Wait 1.5 seconds to ensure server has started
setTimeout(runTests, 1500);

async function runTests() {
  const baseURL = 'http://localhost:4000';
  let exitCode = 0;

  try {
    console.log('\n--- Step 1: Initializing Transaction ---');
    const postRes = await axios.post(`${baseURL}/transaction`);
    const { transactionId, nonce, timestamp } = postRes.data;
    console.log(`Transaction initialized. ID: ${transactionId}, Nonce: ${nonce}, Timestamp: ${timestamp}`);

    console.log('\n--- Step 2: Preparing and Signing Transaction Update ---');
    const payload = {
      amount: 1500.50,
      currency: 'INR',
      recipient: 'Frugal Testing QA'
    };

    // Generate HMAC SHA512 signature using the formula: HMAC(body + timestamp + salt)
    // Note: body is stringified, salt is the nonce
    const signature = generateHMAC(payload, timestamp, nonce);
    console.log(`Generated HMAC SHA512: ${signature}`);

    console.log('\n--- Step 3: Sending Valid Transaction Update ---');
    const putRes = await axios.put(`${baseURL}/transaction/${transactionId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Frugal-Mac': signature,
        'X-Frugal-Timestamp': timestamp
      }
    });

    console.log(`First Request Success Status: ${putRes.status}`);
    console.log('Response body:', putRes.data);

    console.log('\n--- Step 4: Attempting Replay Attack ---');
    console.log('Immediately sending identical payload, timestamp, and HMAC signature...');
    
    try {
      const replayRes = await axios.put(`${baseURL}/transaction/${transactionId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Frugal-Mac': signature,
          'X-Frugal-Timestamp': timestamp
        }
      });

      // If we reach here, it returned 2xx success!
      console.error(`Replay attack succeeded! Status: ${replayRes.status}`);
      throw new Error("Critical Replay Vulnerability Detected");
      
    } catch (err) {
      if (err.message === "Critical Replay Vulnerability Detected") {
        throw err;
      }
      
      // Axios throws when response status is outside 2xx range
      if (err.response) {
        console.log(`Replay Request Rejected as Expected.`);
        console.log(`Status Code received: ${err.response.status}`);
        console.log(`Response message:`, err.response.data);

        if (err.response.status === 409 || err.response.status === 422) {
          console.log('\n[TEST PASSED] Stateful nonce replay protection successfully verified.');
        } else {
          console.error(`Unexpected reject status code: ${err.response.status}`);
          exitCode = 1;
        }
      } else {
        console.error('Connection error during replay attack:', err.message);
        exitCode = 1;
      }
    }

  } catch (err) {
    console.error('\n[TEST FAILED]:', err.message);
    exitCode = 1;
  } finally {
    // Terminate the background server process
    console.log('\nStopping the mock API server...');
    serverProcess.kill();
    process.exit(exitCode);
  }
}
