// Main Express Server
// Note: This will host both the Scoreboard WebSocket and Spotify Widget

const WebSocket = require("ws");
const express = require("express");
const path = require("path");
const os = require("os");
const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

// Port number for the laughs.
const PORT = 888;
const LOCAL_IP = getLocalIP();

// ANSI Color Ref
const ansi = {
    bold: "\x1b[1m",
    italic: "\x1b[3m",
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    textGreen: "\x1b[32m",
    textWhite: "\x1b[37m",
    textBlack: "\x1b[30m",
    bgCyan: "\x1b[46m",
    bgMagenta: "\x1b[45m",
    bgBlack: "\x1b[40m",
    bgWhite: "\x1b[47m",
    bgGray: "\x1b[100m",
};

// Get Local IP Address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === "IPv4" && !interface.internal) {
                return interface.address;
            }
        }
    }
    return `127.0.0.1`;
}
// Serve static files for all
app.use(express.static("public"));

// WebSocket for Scoreboard
let gameState = {
    team1: { name: "Team 1", score: 0 },
    team2: { name: "Team 2", score: 0 },
};

// WebSocket connections for Scoreboard
wss.on("connection", (ws, req) => {
    console.log(`Client connected from: ${req.socket.remoteAddress}`);

    // Send current state to new client
    ws.send(JSON.stringify({ type: "update", data: gameState }));

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case "score":
                    if (data.team === "team1") {
                        gameState.team1.score += data.change;
                    } else if (data.team === "team2") {
                        gameState.team2.score += data.change;
                    }
                    break;

                case "reset":
                    gameState.team1.score = 0;
                    gameState.team2.score = 0;
                    break;

                case "setName":
                    if (data.team === "team1") {
                        gameState.team1.name = data.name;
                    } else if (data.team === "team2") {
                        gameState.team2.name = data.name;
                    }
                    break;
            }

            // Broadcast update to all clients
            const update = JSON.stringify({ type: "update", data: gameState });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(update);
                }
            });
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        console.log(`Client ${req.socket.remoteAddress} disconnected`);
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dash", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/scores", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "scoreboard.html"));
});

// Start the server...
server.listen(PORT, "0.0.0.0", () => {
    console.log(`   🍦 Server is running!
    Your computer's IP: ${LOCAL_IP}

    ${ansi.bgMagenta} 🎧 SPOTIFY OBS API ${ansi.reset}: http://127.0.0.1:${PORT}/spotify.html
        
        ${ansi.italic}Notes:${ansi.reset}
        ${ansi.italic}Recommended to use the localhost IP for Spotify's URI redirect${ansi.reset}


    ${ansi.bgMagenta} 🏠 LOCALHOST URI ${ansi.reset}: http://127.0.0.1:${PORT}
        
        ${ansi.italic}Notes:${ansi.reset}
        ${ansi.italic}- WebSocket/Scoreboard only connects to localhost${ansi.reset}
        ${ansi.italic}- Use LOCALHOST IP in OBS if you want to control the scores locally${ansi.reset}


    ${ansi.bgMagenta} 🌐 NETWORK URI ${ansi.reset}: http://${LOCAL_IP}:${PORT}

        ${ansi.italic}Notes:${ansi.reset}
        ${ansi.italic}- Used to control scoreboard from another source${ansi.reset}
        ${ansi.italic}- OBS Browser source must use the URI below if controlling from another source${ansi.reset}

        For OBS Browser source:
        - http://${LOCAL_IP}:${PORT}/scores


🪝 WEBHOOK STATUS:
        `);
});
