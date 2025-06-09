// NOTES:
// This uses the authorization code flow with PKCE
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

// Global Variables
let accessToken = null;
let clientId = null;
let currentTrackData = null;
let pollInterval = null;

/**
 * Helper function for the Spotify PKCE authorization.
 * Generates a random string to be hashed later.
 * @param {*} length: number
 * @return {*} string
 */
function generateRandomString(length) {
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

/**
 * Helper function for the Spotify PKCE authorization.
 * Encodes the random string received by `generateRandomString`
 * @param {*} plain: string
 * @return {*} Promise (ArrayBuffer?)
 */
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
}

/**
 * Helper function for the Spotify PCKE authorization.
 * Encodes the string input from hashed input.
 * @param {*} input
 * @return {*} String
 */
function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

/**
 * Initializes the authorization process. Obtains client ID from input form.
 *
 * Generates code challenge, send GET query params to Spotify's auth API end point.
 * @return {*}
 */
async function startAuth() {
    clientId = document.getElementById("clientId").value.trim();

    if (!clientId) {
        showError("Please enter your Spotify Client ID");
        return;
    }

    try {
        showStatus("Initializing authentication...", "login-status");

        const codeVerifier = generateRandomString(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);

        // Store Client ID and Coder Verifier to Session Storage.
        sessionStorage.setItem("code_verifier", codeVerifier);
        sessionStorage.setItem("client_id", clientId);

        // Assemble GET request, and then milk a film franchise about this get request for far too long.
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: "code",
            redirect_uri: window.location.origin + window.location.pathname,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            scope: "user-read-currently-playing user-read-playback-state",
        });

        // Send user to Spotify's auth page.
        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (error) {
        showError("Authentication setup failed: " + error.message);
    }
}

/**
 * When the user accepts the permissions, handle the response from Spotify.
 *
 * Initialize the `Now Playing` screen, and save auth state for OBS use.
 * @return {*}
 */
async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
        showError("Spotify authorization failed: " + error);
        return;
    }

    // Code is required to obtain the access token.
    if (code) {
        try {
            showStatus("Exchanging authorization code...", "login-status");

            const codeVerifier = sessionStorage.getItem("code_verifier");
            clientId = sessionStorage.getItem("client_id");

            // Send Spotify auth
            const response = await fetch(
                "https://accounts.spotify.com/api/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },

                    // redirect_uri hints back to the home.html file location.
                    body: new URLSearchParams({
                        client_id: clientId,
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri:
                            window.location.origin + window.location.pathname,
                        code_verifier: codeVerifier,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Token exchange failed");
            }

            const data = await response.json();
            accessToken = data.access_token;

            // Save auth state for OBS use
            saveAuthState();

            // Clear URL parameters in browser
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );

            // Switch to now playing screen
            switchToNowPlaying();

            // Generate OBS URL after a short delay to ensure UI is ready
            setTimeout(generateOBSUrl, 1000);
        } catch (error) {
            showError("Token exchange failed: " + error.message);
        }
    }
}

function switchToNowPlaying() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("now-playing-screen").style.display = "block";

    // Initialize polling for current track
    getCurrentTrack();

    // Poll track data every 2 seconds
    pollInterval = setInterval(getCurrentTrack, 2000);
}

async function getCurrentTrack() {
    // Maybe we should handle this better, but not sure. Haven't run into issues yet...
    if (!accessToken) return;

    try {
        const response = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (response.status === 204) {
            // No content - nothing is playing
            updatePlaybackStatus("No music playing");
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch current track");
        }

        const data = await response.json();

        if (data && data.item) {
            // Update current track data only if it's a new song
            if (!currentTrackData || currentTrackData.id !== data.item.id) {
                currentTrackData = {
                    id: data.item.id,
                    name: data.item.name,
                    artist: data.item.artists.map((a) => a.name).join(", "),
                    albumArt: data.item.album.images[0]?.url || "",
                };
                displayCurrentTrack();
            }
        }
    } catch (error) {
        console.error("Error fetching current track:", error);
    }
}

function displayCurrentTrack() {
    if (!currentTrackData) return;

    const trackDisplay = document.getElementById("track-display");
    trackDisplay.innerHTML = `
			<img src="${currentTrackData.albumArt}" alt="Album Art" class="album-art" />
			<div class="track-info">
				<h2>${currentTrackData.name}</h2>
				<p>${currentTrackData.artist}</p>
			</div>
	`;
}

function showStatus(message, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="loading"></div> ${message}`;
    element.style.color = "#1DB954";
}

function showError(message) {
    const statusElement = document.getElementById("login-status");
    statusElement.innerHTML = `<div class="error">${message}</div>`;
}

// Save authentication state
function saveAuthState() {
    if (accessToken && clientId) {
        // Store in memory for current session
        window.spotifyAuth = {
            token: accessToken,
            clientId: clientId,
            timestamp: Date.now(),
        };
    }
}

function loadAuthState() {
    // Check URL parameters for token (for OBS workflow)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    const urlClientId = urlParams.get("client_id");

    if (urlToken && urlClientId) {
        accessToken = urlToken;
        clientId = urlClientId;
        return true;
    }

    // Check in-memory storage
    if (window.spotifyAuth) {
        const tokenAge = Date.now() - window.spotifyAuth.timestamp;

        // Less than 1 hour
        if (tokenAge < 3600000) {
            accessToken = window.spotifyAuth.token;
            clientId = window.spotifyAuth.clientId;
            return true;
        }
    }
    return false;
}

// Generate OBS URL with embedded token
function generateOBSUrl() {
    if (accessToken && clientId) {
        const baseUrl = window.location.origin + window.location.pathname;
        const obsUrl = `${baseUrl}?token=${encodeURIComponent(
            accessToken
        )}&client_id=${encodeURIComponent(clientId)}`;

        // Show the URL to user
        const obsUrlDiv = document.createElement("div");
        obsUrlDiv.innerHTML = `
				<div style="background: rgb(43, 43, 43); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
					<h3>🎯 For OBS:</strong></h3>
					<p>Copy this URL and use it as your Browser Source in OBS:</p>
					<input type="text" value="${obsUrl}" readonly style="width: 100%; margin: 0.5rem 0; background: rgba(255,255,255,0.1);" onclick="this.select();">
					<p style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">This URL contains your authentication and will work directly in OBS!</p>
				</div>
			`;

        document.getElementById("now-playing-screen").appendChild(obsUrlDiv);
    }
}

// Initialize the app
window.addEventListener("load", () => {
    // First try to load saved auth state
    if (loadAuthState()) {
        switchToNowPlaying();
        return;
    }

    // Check if we're returning from Spotify auth
    if (window.location.search.includes("code=")) {
        handleCallback();
    }
});

// Cleanup interval on page unload
window.addEventListener("beforeunload", () => {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
});

// Globally available for the button
window.startAuth = startAuth;
