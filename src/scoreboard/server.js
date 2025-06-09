// server.js - WebSocket Server (Node.js)
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('public'));

// Game state
let gameState = {
    team1: { name: 'Team 1', score: 0 },
    team2: { name: 'Team 2', score: 0 }
};

// WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send current state to new client
    ws.send(JSON.stringify({ type: 'update', data: gameState }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch(data.type) {
                case 'score':
                    if (data.team === 'team1') {
                        gameState.team1.score += data.change;
                    } else if (data.team === 'team2') {
                        gameState.team2.score += data.change;
                    }
                    break;
                    
                case 'reset':
                    gameState.team1.score = 0;
                    gameState.team2.score = 0;
                    break;
                    
                case 'setName':
                    if (data.team === 'team1') {
                        gameState.team1.name = data.name;
                    } else if (data.team === 'team2') {
                        gameState.team2.name = data.name;
                    }
                    break;
            }
            
            // Broadcast update to all clients
            const update = JSON.stringify({ type: 'update', data: gameState });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(update);
                }
            });
            
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Port number for the laughs.
server.listen(888, () => {
	console.log("Server running on http://127.0.0.1:888 ")
	console.log("Control panel: http://127.0.0.1:888/dashboard.html")
	console.log("Scoreboard for OBS: http://127.0.0.1:888/scoreboard.html")
})