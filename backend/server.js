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

app.post('/api/info', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const info = await getInfo(url);
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    await downloadMedia(url, format || 'mp4', res);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
