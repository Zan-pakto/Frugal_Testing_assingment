const { test, expect } = require('@playwright/test');

// Helper to analyze canvas pixels in the browser context without using IDs/classes
async function getTargetCoordinates(page) {
  return await page.evaluate(() => {
    // Find the first canvas on the page
    const canvas = document.getElementsByTagName('canvas')[0];
    if (!canvas) return { found: false, x: 0, y: 0 };

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    // Search for active green pixels: RGB(0, 255, 0)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (r === 0 && g === 255 && b === 0) {
        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);
        sumX += x;
        sumY += y;
        count++;
      }
    }

    if (count > 0) {
      return {
        found: true,
        x: sumX / count,
        y: sumY / count
      };
    }

    return { found: false, x: 0, y: 0 };
  });
}

// Helper to monitor canvas state transition from Gray loading to Green active
async function waitForActiveStateTransition(page, timeoutMs = 15000) {
  const startTime = Date.now();
  
  // Verify initial state is gray or loading (canvas has gray pixels)
  const initialCheck = await page.evaluate(() => {
    const canvas = document.getElementsByTagName('canvas')[0];
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Check for gray pixels: RGB(128, 128, 128)
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === 128 && data[i + 1] === 128 && data[i + 2] === 128) {
        return true;
      }
    }
    return false;
  });

  if (!initialCheck) {
    console.log("Warning: Could not confirm initial gray loading state; might have already transitioned.");
  } else {
    console.log("Verified initial loading state (gray pixels found).");
  }

  // Use requestAnimationFrame loop inside page context to wait for active state (green pixel)
  return await page.evaluate((timeout) => {
    return new Promise((resolve, reject) => {
      const canvas = document.getElementsByTagName('canvas')[0];
      if (!canvas) {
        reject(new Error('Canvas not found on page'));
        return;
      }
      const ctx = canvas.getContext('2d');
      const start = Date.now();

      function check() {
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for active state transition'));
          return;
        }

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Search for active green color RGB(0, 255, 0)
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
            resolve(true);
            return;
          }
        }
        requestAnimationFrame(check);
      }
      requestAnimationFrame(check);
    });
  }, timeoutMs);
}

// Helper to get text values from UI labels using text content and DOM relationships (no IDs or classes)
async function getLabelValue(page, labelText) {
  return await page.evaluate((text) => {
    const spans = Array.from(document.getElementsByTagName('span'));
    const labelSpan = spans.find(el => el.textContent.trim() === text);
    if (labelSpan && labelSpan.nextElementSibling) {
      return labelSpan.nextElementSibling.textContent.trim();
    }
    return '';
  }, labelText);
}

test.describe('Q1: Canvas Automation & WebSocket Interception', () => {

  test('Test 1: Canvas monitoring, dynamic coordinates calculation, and race handling with circuit breaker', async ({ page }) => {
    await page.goto('/');

    console.log('Monitoring canvas for loading -> active state transition...');
    await waitForActiveStateTransition(page);
    console.log('Active state transition detected!');

    // Verify state label is active
    let stateVal = await getLabelValue(page, 'State:');
    expect(stateVal).toBe('ACTIVE');

    // Circuit Breaker (Retry loop) for the interaction sequence
    const maxRetries = 10;
    let succeeded = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`\n--- Attempt ${attempt} to interact with moving target ---`);

      // Read target coordinates dynamically using the pixel coordinate engine
      const coords = await getTargetCoordinates(page);
      if (!coords.found) {
        console.log('Target not found in this frame, retrying...');
        await page.waitForTimeout(50);
        continue;
      }

      console.log(`Target found at: x=${coords.x}, y=${coords.y}`);

      // Locate canvas using its tag name and fetch the bounding box
      const canvasHandle = page.locator('canvas').first();
      const canvasBoundingBox = await canvasHandle.boundingBox();
      if (!canvasBoundingBox) {
        throw new Error('Canvas bounding box not found');
      }

      // Convert local canvas coordinates to viewport coordinates
      const targetX = canvasBoundingBox.x + coords.x;
      const targetY = canvasBoundingBox.y + coords.y;

      const startTime = Date.now();

      // Perform sequence: Hover -> Drag 15px -> Click
      // Must be fast: 30ms - 100ms total
      try {
        // 1. Hover
        await page.mouse.move(targetX, targetY);

        // 2. Drag 15px (down, move, up)
        await page.mouse.down();
        await page.mouse.move(targetX + 15, targetY);
        await page.mouse.up();

        // 3. Click
        await page.mouse.click(targetX + 15, targetY);

        const duration = Date.now() - startTime;
        console.log(`Action sequence completed in ${duration}ms`);

        // Wait a short time for UI logs to update
        await page.waitForTimeout(100);

        // Check if click and drag were registered
        const clickText = await getLabelValue(page, 'Click Event:');
        const dragText = await getLabelValue(page, 'Drag Event (15px):');

        if (clickText.includes('Yes') && dragText.includes('Yes')) {
          console.log('Success! Click and Drag registered successfully.');
          succeeded = true;
          break;
        } else {
          console.log(`Attempt ${attempt} failed. Click: ${clickText}, Drag: ${dragText}`);
        }
      } catch (err) {
        console.log(`Attempt ${attempt} error:`, err.message);
      }

      // Small delay before retrying
      await page.waitForTimeout(100);
    }

    expect(succeeded).toBe(true);
  });

  test('Test 2: WebSocket interception & artificial Fibonacci latency', async ({ page }) => {
    let fibPrev = 0;
    let fibCurr = 1;

    // Setup WebSocket routing before navigation
    await page.routeWebSocket(/.*localhost:3000.*/, (ws) => {
      const server = ws.connectToServer();
      
      ws.onMessage((message) => {
        server.send(message);
      });

      server.onMessage((message) => {
        // Calculate next Fibonacci delay
        const fibNext = fibPrev + fibCurr;
        fibPrev = fibCurr;
        fibCurr = fibNext;

        let delayMs = fibPrev * 1000;
        if (delayMs > 8000) {
          delayMs = 8000;
        }

        console.log(`Intercepted WS message. Delaying by ${delayMs}ms (Fibonacci)`);
        
        setTimeout(() => {
          ws.send(message);
        }, delayMs);
      });
    });

    const startTime = Date.now();
    await page.goto('/');

    // Wait for active state transition under latency simulation
    await waitForActiveStateTransition(page, 15000);
    const duration = Date.now() - startTime;
    console.log(`Transition took ${duration}ms under latency simulation`);
    
    // Assert the state eventually becomes active
    let stateVal = await getLabelValue(page, 'State:');
    expect(stateVal).toBe('ACTIVE');
  });

  test('Test 3: Corrupted state injection (float values & scientific notation 1e+7)', async ({ page }) => {
    // Setup WebSocket routing to inject corrupted values
    await page.routeWebSocket(/.*localhost:3000.*/, (ws) => {
      const server = ws.connectToServer();
      
      ws.onMessage((message) => {
        server.send(message);
      });

      server.onMessage((message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'state-update') {
            // Inject float coordinates and scientific notation like 1e+7
            data.x = 1e7;      // Scientific notation value
            data.y = 250.789;  // Floating point value
            ws.send(JSON.stringify(data));
          } else {
            ws.send(message);
          }
        } catch (e) {
          ws.send(message);
        }
      });
    });

    await page.goto('/');

    // Wait a bit to receive corrupted updates
    await page.waitForTimeout(1000);

    // Validate the frontend is handling the corrupted data safely
    let corruptVal = await getLabelValue(page, 'Corrupted Data:');
    expect(corruptVal).toBe('Safe (Corrupted Data Handled)');

    // Ensure the page coordinates are sanitized/clamped safely
    let coordsVal = await getLabelValue(page, 'Target Coords:');
    console.log(`Sanitized coordinates on UI: ${coordsVal}`);
    
    // Expected coordinate for corrupted scientific notation is safe center: x: 250.00, y: 250.00
    expect(coordsVal).toContain('x: 250.00, y: 250.00');
  });
});
