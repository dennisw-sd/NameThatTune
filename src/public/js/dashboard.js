// Control for Dashboard

let ws;
const statusEl = document.getElementById("status");

function connect() {
    ws = new WebSocket("ws://localhost:888");

    ws.onopen = function () {
        statusEl.textContent = "✅ Connected to server";
        statusEl.className = "status connected";
    };

    ws.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.type === "update") {
            updateDisplay(message.data);
        }
    };

    ws.onclose = function () {
        statusEl.textContent = "❌ Disconnected from server";
        statusEl.className = "status disconnected";
        // Try to reconnect after 3 seconds
        setTimeout(connect, 3000);
    };

    ws.onerror = function (error) {
        console.error("WebSocket error:", error);
        statusEl.textContent = "⚠️ Connection error";
        statusEl.className = "status disconnected";
    };
}

function updateDisplay(gameState) {
    document.getElementById("team1Score").textContent = gameState.team1.score;
    document.getElementById("team2Score").textContent = gameState.team2.score;
    document.getElementById("team1Name").value = gameState.team1.name;
    document.getElementById("team2Name").value = gameState.team2.name;
}

function changeScore(team, change) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
            JSON.stringify({
                type: "score",
                team: team,
                change: change,
            })
        );
    }
}

function resetScores() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "reset" }));
    }
}

function updateTeamName(team) {
    const nameInput = document.getElementById(team + "Name");
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
            JSON.stringify({
                type: "setName",
                team: team,
                name: nameInput.value,
            })
        );
    }
}

// Connect when page loads
connect();
