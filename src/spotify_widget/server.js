const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);

// Serve static files from public directory
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Technically, this is not okay to hard code a port number.
// For the sake of simplicity, we are.
const PORT = 3030;
server.listen(PORT, () => {
    console.log(`Spotify Widget running on http://127.0.0.1:${PORT}`);
});