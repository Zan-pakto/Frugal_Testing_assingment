# Frugal Testing - AI-Native Software Engineer Intern Assignment
## Section A Submission

This repository contains the completed tasks for Section A (Q1, Q2, Q3) of the Frugal Testing AI-Native Software Engineer Intern assignment.

## Project Structure

```
frugal-testing-assignment/
├── .gitignore
├── README.md                           # Root documentation & execution guides
│
├── q1-canvas-automation/               # Q1: Dynamic Canvas & WebSocket Automation
│   ├── canvas-app/
│   │   ├── public/
│   │   │   └── index.html              # Frontend canvas app & event logger
│   │   ├── server.js                   # Node Express & WebSocket state server
│   │   └── package.json
│   ├── tests/
│   │   └── canvas.test.js              # Playwright automation test suite
│   ├── playwright.config.js            # Playwright browser automation config
│   └── README.md                       # Q1 specific setup instructions
│
├── q2-api-replay-testing/              # Q2: HMAC Chaining & Replay Vulnerability Testing
│   ├── server/
│   │   └── server.js                   # Express mock transaction server
│   ├── tests/
│   │   └── replay.test.js              # Axios automated replay testing script
│   ├── hmac.js                         # SHA-512 cryptographic HMAC utility
│   ├── package.json
│   └── README.md                       # Q2 specific setup instructions
│
└── q3-shadow-dom-accessibility/        # Q3: Shadow DOM Traverse & Accessibility Prompt
    ├── shadowTraversal.js              # Recursive shadow DOM traverse & role locator
    ├── test.js                         # JSDOM-based unit test suite
    ├── accessibilityPrompt.md          # Expert AI system prompt for LLMs
    ├── package.json
    └── README.md                       # Q3 specific setup instructions
```

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v16+) installed.

### 1. Clone the repository
```bash
git clone https://github.com/Zan-pakto/Frugal_Testing_assingment.git frugal-testing-assignment
cd frugal-testing-assignment
```

### 2. Install Project Dependencies
You can install dependencies for each task separately:

* **Q1 Canvas Automation**:
  ```bash
  cd q1-canvas-automation
  npm install
  cd canvas-app
  npm install
  cd ../..
  ```
  *(Note: Playwright will run using your system's Google Chrome browser, so no additional browser downloads are required).*

* **Q2 Cryptographic Replay Testing**:
  ```bash
  cd q2-api-replay-testing
  npm install
  cd server
  npm install
  cd ../..
  ```

* **Q3 Shadow DOM Accessibility Traversal**:
  ```bash
  cd q3-shadow-dom-accessibility
  npm install
  cd ..
  ```

---

## 🚀 Running the Tests & Expected Output Logs

Below are the commands to execute the tests for each question along with actual execution outputs.

### Q1: Dynamic HTML5 Canvas State Drift & Asynchronous Race Interception
Runs Playwright tests that spin up the canvas server, check loading-to-active transition, interact with the moving target using a pixel color search and hover-drag-click chain, simulate Fibonacci latency interception, and inject corrupted state payloads.

**Command:**
```bash
cd q1-canvas-automation
npx playwright test
```

**Actual Output Log:**
```text
Running 3 tests using 1 worker

Monitoring canvas for loading -> active state transition...
Verified initial loading state (gray pixels found).
Active state transition detected!
--- Attempt 1 to interact with moving target ---
Target found at: x=348.6166666666667, y=181.75833333333333
Action sequence completed in 68ms
Success! Click and Drag registered successfully.
  ok 1 [chromium] › tests\canvas.test.js:102:3 › Q1: Canvas Automation & WebSocket Interception › Test 1: Canvas monitoring, dynamic coordinates calculation, and race handling with circuit breaker (1.9s)

Intercepted WS message. Delaying by 1000ms (Fibonacci)
Verified initial loading state (gray pixels found).
Intercepted WS message. Delaying by 1000ms (Fibonacci)
Intercepted WS message. Delaying by 2000ms (Fibonacci)
Intercepted WS message. Delaying by 3000ms (Fibonacci)
Intercepted WS message. Delaying by 5000ms (Fibonacci)
Intercepted WS message. Delaying by 8000ms (Fibonacci)
...
Transition took 1123ms under latency simulation
  ok 2 [chromium] › tests\canvas.test.js:204:3 › Q1: Canvas Automation & WebSocket Interception › Test 2: WebSocket interception & artificial Fibonacci latency (1.7s)

Sanitized coordinates on UI: x: 250.00, y: 250.00
  ok 3 [chromium] › tests\canvas.test.js:248:3 › Q1: Canvas Automation & WebSocket Interception › Test 3: Corrupted state injection (float values & scientific notation 1e+7) (1.8s)

  3 passed (11.7s)
```

---

### Q2: Cryptographic Replay Testing, Stateful Nonces & Hash Chain API Chaining
Runs a Node script that starts the mock transaction server, initiates a transaction, signs the payload using `HMAC-SHA512`, updates the transaction, and verifies that immediate replay attacks are blocked with a `409 Conflict`.

**Command:**
```bash
cd q2-api-replay-testing
npm test
```

**Actual Output Log:**
```text
> q2-api-replay-testing@1.0.0 test
> node tests/replay.test.js

[Server]: Transaction Mock Server running on http://localhost:4000

--- Step 1: Initializing Transaction ---
[Server]: Initialized transaction eea48cca-caa1-4be9-9521-40fae8839560 with nonce 5f75707f58d7175882bde7a658f1c746
Transaction initialized. ID: eea48cca-caa1-4be9-9521-40fae8839560, Nonce: 5f75707f58d7175882bde7a658f1c746, Timestamp: 1782655442229

--- Step 2: Preparing and Signing Transaction Update ---
Generated HMAC SHA512: 27f63de2465b5cca071b4013c3a2d266c812637f8f87dc5d91e76161c78427c30556f28c6eb4e427a13eb803ac8d2bc0581eb0b435cb35c88b22e366bb601b89

--- Step 3: Sending Valid Transaction Update ---
[Server]: Transaction eea48cca-caa1-4be9-9521-40fae8839560 processed successfully.
First Request Success Status: 200
Response body: { success: true, message: 'Transaction completed successfully' }

--- Step 4: Attempting Replay Attack ---
Immediately sending identical payload, timestamp, and HMAC signature...
[Server Error]: Replay attack detected for transaction eea48cca-caa1-4be9-9521-40fae8839560!
Replay Request Rejected as Expected.
Status Code received: 409
Response message: {
  success: false,
  message: 'Transaction already processed. Replay attack detected.'
}

[TEST PASSED] Stateful nonce replay protection successfully verified.

Stopping the mock API server...
```

---

### Q3: Shadow DOM Pathfinding & Accessibility Tree Refactoring
Runs unit tests validating the shadow DOM traversal utility against deep nested custom elements, implicit/explicit roles, and state-based accessibility conditions.

**Command:**
```bash
cd q3-shadow-dom-accessibility
npm test
```

**Actual Output Log:**
```text
> q3-shadow-dom-accessibility@1.0.0 test
> node test.js

--- Initializing Mock Nested Shadow DOM Tree ---
DOM Tree initialized successfully.

--- Running Assertions ---
✓ Found banner in Light DOM.
✓ Found navigation inside custom-navbar shadow root.
✓ Found button "Menu Options" in nested shadow root.
✓ Found button matching state filter { expanded: false }.
✓ Found checked checkbox input in nested shadow root.
✓ Found textbox input using placeholder name in nested shadow root.
✓ Found custom div button with aria-label in nested shadow root.

[TEST PASSED] All shadow DOM accessibility traversal tests passed successfully!
```

---

## 🎨 Architectural and Design Decisions

### Q1 Canvas Automation
* **Pixel Coordinate Engine**: The test uses a fast `page.evaluate()` block calling `requestAnimationFrame` to scan pixel values on the Canvas bitmap. Active pixels (color value `#00FF00`) are grouped, and their centroid is computed as the interaction coordinates. This avoids the need for DOM selectors, which are not present for canvas drawing.
* **Race Condition Control**: Hover, drag, and click actions are fired programmatically. The canvas app listens to these mouse events and logs them in real-time.
* **Circuit Breaker Pattern**: If the target drifts out of coordinates before mouse actions complete, the click is logged as a "miss". The automation intercepts this and retries up to 10 times, dynamically re-calculating target positions.

### Q2 API Replay protection
* **Stateful Nonces**: When a transaction starts, the server creates a unique one-time nonce. Once the transaction completes, this nonce is updated to a `used: true` state in an in-memory database map, preventing reuse.
* **HMAC Verification**: Standardized body parsing removes transient fields like timestamps from the hashed payload, guaranteeing stable signatures. The secret key is the transaction's unique cryptographic salt/nonce.

### Q3 Shadow DOM Pathfinding
* **Generic Traversal**: Avoids CSS selectors, class checks, and XPath by recursively searching an element's children and crossing the `.shadowRoot` boundary if it is open.
* **Implicit WAI-ARIA role mapper**: Resolves native elements (like `<input type="checkbox">` and `<nav>`) to their standardized ARAI role tags, ensuring tests mirror authentic accessibility representations.
* **Accessible Name Resolver**: Computes the WAI-ARIA name by checking `aria-label`, then tracking `aria-labelledby` IDs, and falling back to titles, input placeholders, or text content.
