# Q1: Dynamic HTML5 Canvas State Drift & Asynchronous Race Interception

This directory contains the local HTML5 Canvas application and its corresponding Playwright automation tests.

## Features

1. **Canvas-based UI**: Built with pure HTML5 Canvas and JavaScript rendering a target circle that shifts dynamically over a background grid.
2. **WebSocket-powered Updates**: State (loading vs active) and target coordinates are updated via standard WebSockets.
3. **Canvas Monitoring**: Automation uses `requestAnimationFrame` and pixel color analysis (`getImageData`) to detect when the canvas target shifts from the gray loading state to the green active state.
4. **Dynamic Coordinate Engine**: Real-time canvas pixel polling calculating the exact center of the moving target to handle drift.
5. **Race Condition Handling & Circuit Breaker**: Performs high-speed mouse operations (Hover → Drag 15px → Click) within the 30ms–100ms window, supported by a retry loop (circuit breaker) to handle movement drift.
6. **WebSocket Interception & Latency Simulation**: Intercepts WebSocket communication using Playwright's `page.routeWebSocket` API to inject incremental delays (1000ms × Fibonacci sequence, capped at 8000ms).
7. **Corrupted State Injection**: Injects floating point and extreme scientific notation (`1e+7`) values via WebSockets. The frontend validates and sanitizes these values safely, clamping them to safe defaults to prevent runtime crashes.

## Folder Structure

```
q1-canvas-automation/
├── canvas-app/
│   ├── public/
│   │   └── index.html      # Frontend HTML5 canvas & interaction logger
│   ├── server.js           # Express & WebSocket state server
│   └── package.json
├── tests/
│   └── canvas.test.js      # Playwright test suite
├── playwright.config.js    # Playwright runner configuration
└── README.md
```

## How to Run

1. Install dependencies:
   ```bash
   cd q1-canvas-automation
   npm install
   ```

2. Install Playwright browsers (if not already installed):
   ```bash
   npx playwright install chromium
   ```

3. Run the automation tests:
   ```bash
   npx playwright test
   ```
