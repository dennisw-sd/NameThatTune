# Name That Tune
Web components to use in Open Broadcast Software (OBS) for the `Name That Tune` game utilized at Sound Devices functions.

## Components
### Technical Information

**Backend**:
	`Node.js` (v22.14.0 or later) with `Express` web server and `WebSocket`

**Frontend**:
	Vanilla HTML, CSS, and JavaScript (no frameworks)


# Scoreboard and Dashboard
A real-time scoreboard system designed to display scores to an OBS `browser` source instance.
Control scores from any web browser whilst displaying a clean scoreboard overlay in OBS Studio or other streaming software.

Dashboard
- Update team names in real-time
- Adjust scores with [+1, -1, +3] buttons.
- Reset all scores to zero
- Check WebSocket connection at a glance

Scoreboard Display
- Team names and current score
- Smooth animations when scores change
- Automatic reconnection if connection were to drop

Both the scoreboard and dashboard sync through a WebSocket.

### Quick Start

1. Install Dependencies via the terminal:
``` bash
npm install ws express
```

2. Start the Server
``` bash
node server.js
```

Once you start the scoreboard server, the terminal should provide the labeled addresses for you to connect to.
Server will run specifically on `PORT 888` unless changed in `server.js`

``` bash
"Server running on http://127.0.0.1:888"
"Dashboard: http://127.0.0.1:888/dashboard.html"
"Scoreboard for OBS: http://127.0.0.1:888/scoreboard.html"
```

3. Open or Navigate to the Dashboard page: 
   `http://127.0.0.1:888/dashboard.html`
   
4. Create a Browser source pointing to the Scoreboard:
   `http://127.0.0.1:888/scoreboard.html`
   
	*Recommended dimensions: 840 x 190 pixels*



---

# Spotify Widget
A transparent, OBS-ready web app that display the currently playing Spotify track with album art, song name, and artist information.

### Quick Start

##### Prerequisites:
Spotify Developer Account
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Note or copy your `Client ID`
4. Add the redirect URI to `http://127.0.0.1:3030/`

### Instructions

### Step 1: Start the web server in a different terminal
``` bash
node server.js
```

### Step 2: Connect to the URL noted in the terminal
``` bash
"Spotify Widget running on http://127.0.0.1:3030"
```

### Step 3: Use Spotify Client ID and authenticate it

Copy the client ID you made in the Spotify Developer dashboard.

![[auth_clientID 1.png]](img/auth_clientID.png)

#### Step 4: Authenticate with Spotify

If you do not agree, the widget will not work.

![[auth_on_spotify.png]](img/auth_on_spotify.png)

### Step 5: Copy OBS link

Once you authenticate with Spotify, you will be redirected to the Spotify Widget page with an OBS link.

![[OBS_link.png]](img/OBS_link.png)

### Step 6: Make a new `Browser Source` in OBS

### Step 7: Paste the OBS link in the `Browser Source`

### Step 8: Dimensions
Recommended dimensions of the browser source `800 x 400`
