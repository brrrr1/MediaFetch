const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { downloadMedia, getInfo } = require('./utils/downloader');

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'MediaFetch Backend is running' });
});

app.post('/api/info', async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const info = await getInfo(url);
        res.json(info);
    } catch (error) {
        next(error);
    }
});

app.get('/api/download', async (req, res, next) => {
    try {
        const { url, format } = req.query;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        await downloadMedia(url, format || 'mp4', res);
    } catch (error) {
        next(error);
    }
});

// Serve static files from the frontend/dist folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
});

// Catch-all route to serve the frontend for any non-API requests (must be LAST)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built yet. Please run build.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
