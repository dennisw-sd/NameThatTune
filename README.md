<div align="center">
    <a id="readme-top"></a>
    <h1>Name That Tune</h1>
    <p>Small web app to enhance the game with OBS</p>
</div>

### 

### Built With...

* Node (v22.14.0), Express, and WebSocket
* Vanilla JavaScript, HTML, and CSS (no frameworks)

<div align="center">
    <h2>Getting Started</h2>
</div>


### Prerequisites

This guide will assume you have [Node.js](https://nodejs.org/en) installed, are familiar with the CLI, and can pull the repo where needed.

### Installation

1. Navigate into the `src` directory and install dependencies from `package.json`

```shell
# Will install Express and WebSocket
npm install 
```

2. Inside the `src` folder, run the following `node` command:

```shell
node server.js
```

3. Go to `http://127.0.0.1:888` to access the home page, or you can follow the terminal output.

<div><br /> <br /> </div>

<div align="center">
    <h1>⚙️ Scoreboard and Dashboard</h1>
</div>

The scoreboard has two parts:

* Dashboard to control the Scoreboard

* Scoreboard view for OBS

This component utilizes the WebSocket dependency with status indicators noting the connection. The scoreboard indicator is a dot in the top-right hand corner of the view, whereas the dashboard has a painfully obvious status indicator at the top.

> Additionally, the terminal will also not connections and disconnects.

Dashboard Controls:

* Enter in individual team names with an update button.

* Shows the current score per team.

* -1, +1, and +3 buttons for score control.

* Reset Scores button to wipe all scores.

### Usage

Create an OBS Studio `Browser` instance in your scene, and enter the following URL into the URL Field:

```url
http://127.0.0.1:888/scoreboard.html
```

Recommended Dimensions for OBS:

> 880 x 250

<div>
<p align="right">(<a href="#readme-top">back to top</a>)</p>
</div>

<div><br /></div>

<div align="center">
    <h1>⚙️ Spotify Widget</h1>
</div>

A widget made specifically to display on an OBS Studio instance.

Displays album artwork, song title, and artist from the currently played song on your connected Spotify account.

### Requirements

* Spotify Account (either free or premium)

* Access to Spotify Developer account (https://developer.spotify.com/)

* Created App with `Client ID`

<div><br /></div>

### Spotify Developer Account and the Client ID

If you're no stranger to APIs, this should be a breeze, however, I'll go through the steps just in case:

1. Go to [https://developer.spotify.com/](https://developer.spotify.com/)

2. Either create or log in to the account you want to utilize.

3. Enter the Dashboard

4. Select `Create App`
   
   1. **App Name:** Name That Tune (or anything you want)
   
   2. **App Description:** Name That Tune (or anything you want)
   
   3. **Redirect URIs:** `http://127.0.0.1:888/spotify.html` (Required to redirect you back to the Spotify Widget)
   
   4. **APIs used:** Web API (select only this option)

5. Finalize creating the app, and you should have a `Client ID`available to you at the top. Refer to this ID for the next section. \

<div><br /></div>

### Widget Guide

1. Access the Spotify Widget URL from `http://127.0.0.1:888` or directly from the terminal.

2. You'll be greeted to enter in your Spotify Client ID. Paste that bad boy into the field and click `Connect to Spotify`

3. This will redirect you to Spotify itself to ask permission for this app to use your Spotify account.

4. Click on `Agree`
   If you do not agree, we don't get the song information, capiche?

5. Once you agree, you'll be rerouted back to the Spotify page

6. An OBS Studio `URL` will be generated for you on the webpage to place into a `Browser` Source within OBS Studio.

Recommended Dimensions for OBS:

> 800 x 400

<div><br /></div>

**Notes:**

* Tokens for the Spotify API only last an hour, but should refresh.

* Everything is stored in a session, so once you close the browser, you gotta redo everything again.

* The Spotify widget page will show you what you're account is currently playing. If you have not played anything yet, it will have a continuous loader active.

* The API is pulled every 2 seconds.

<div>
<p align="right">(<a href="#readme-top">back to top</a>)</p>
</div>
