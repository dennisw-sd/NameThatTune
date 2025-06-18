let ws;
let previousScores = { team1: 0, team2: 0 };

function getWebSocketURL() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const hostName = window.location.hostname;

    const port = 888;

    return `${protocol}//${hostName}:${port}`;
}

function connect() {
    const socketURL = getWebSocketURL();
    console.log(`Attempting to connect to: ${socketURL}`);

    ws = new WebSocket(socketURL);

    ws.onopen = function () {
        console.log("Connected to WebSocket server");
        document.getElementById("statusIndicator").classList.add("connected");
    };

    ws.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.type === "update") {
            updateScoreboard(message.data);
        }
    };

    ws.onclose = function () {
        console.log("Disconnected from WebSocket server");
        document
            .getElementById("statusIndicator")
            .classList.remove("connected");
        // Try to reconnect after 3 seconds
        setTimeout(connect, 3000);
    };

    ws.onerror = function (error) {
        console.error("WebSocket error:", error);
        document
            .getElementById("statusIndicator")
            .classList.remove("connected");
    };
}

function updateScoreboard(gameState) {
    // Update team names
    document.getElementById("team1Name").textContent =
        gameState.team1.name.toUpperCase();
    document.getElementById("team2Name").textContent =
        gameState.team2.name.toUpperCase();

    // Update scores with animation if they changed
    const team1ScoreEl = document.getElementById("team1Score");
    const team2ScoreEl = document.getElementById("team2Score");

    if (gameState.team1.score !== previousScores.team1) {
        team1ScoreEl.textContent = gameState.team1.score;
        team1ScoreEl.classList.add("score-change");
        setTimeout(() => {
            team1ScoreEl.classList.remove("score-change");
        }, 600);
    }

    if (gameState.team2.score !== previousScores.team2) {
        team2ScoreEl.textContent = gameState.team2.score;
        team2ScoreEl.classList.add("score-change");
        setTimeout(() => {
            team2ScoreEl.classList.remove("score-change");
        }, 600);
    }

    // Update previous scores for next comparison
    previousScores.team1 = gameState.team1.score;
    previousScores.team2 = gameState.team2.score;
}

// Connect when page loads
connect();
