const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

// State variables
let state = 'loading'; // 'loading' or 'active'
let x = 200;
let y = 200;
let angle = 0;

// Reset state when server starts/restart
function resetState() {
  state = 'loading';
  x = 200;
  y = 200;
  angle = 0;
  
  // Transition to active after 2 seconds
  setTimeout(() => {
    state = 'active';
    console.log('Server state transitioned to active');
  }, 2000);
}

resetState();

// Broadcast state updates to all clients
setInterval(() => {
  if (state === 'active') {
    // Make the target move in a circular drift pattern
    angle += 0.05;
    x = Math.round(250 + 120 * Math.cos(angle));
    y = Math.round(250 + 120 * Math.sin(angle));
  }
  
  const payload = JSON.stringify({
    type: 'state-update',
    state: state,
    x: x,
    y: y,
    color: state === 'loading' ? '#808080' : '#00FF00' // Gray vs Green
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}, 50); // 20 updates per second

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send immediate current state
  ws.send(JSON.stringify({
    type: 'state-update',
    state: state,
    x: x,
    y: y,
    color: state === 'loading' ? '#808080' : '#00FF00'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message from client:', data);
      
      // Handlers for client messages if needed
      if (data.type === 'click-target') {
        ws.send(JSON.stringify({
          type: 'action-feedback',
          success: true,
          message: 'Target click registered!'
        }));
      }
    } catch (e) {
      console.error('Failed to parse client message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Canvas App server listening on http://localhost:${PORT}`);
});
