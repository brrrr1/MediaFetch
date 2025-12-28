const ytDlp = require('yt-dlp-exec');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');

const binaryPath = path.resolve(__dirname, '../yt-dlp.exe');

const downloadMedia = async (url, format, res) => {
    try {
        console.log(`Starting download for: ${url} [${format}]`);
        console.log(`Using binary at: ${binaryPath}`);
        console.log(`Using ffmpeg at: ${ffmpegPath}`);

        // Get metadata first
        const metadata = await ytDlp(url, {
            dumpJson: true,
            noWarnings: true,
        }, { ytDlpBinary: binaryPath });

        const title = metadata.title.replace(/[^\w\s-]/gi, '').trim() || 'video';
        const filename = `${title}.${format === 'mp3' ? 'mp3' : 'mp4'}`;

        // Set headers for download
        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.header('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

        // Flags for yt-dlp
        const flags = {
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            quiet: true, // IMPORTANT: Suppress progress to stdout
            ffmpegLocation: ffmpegPath, // Use local ffmpeg binary
            output: '-', // Output to stdout
        };

        if (format === 'mp3') {
            flags.extractAudio = true;
            flags.audioFormat = 'mp3';
            flags.format = 'bestaudio/best';
        } else {
            // With ffmpeg available, we can safely request bestvideo+bestaudio and merge
            flags.format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        }

        // Process execution
        const subprocess = ytDlp.exec(url, flags, { ytDlpBinary: binaryPath });

        // Pipe stdout to response
        subprocess.stdout.pipe(res);

        subprocess.stderr.on('data', (data) => {
            // Log errors but don't send to client (unless it's a fatal error logic)
            console.error(`yt-dlp stderr: ${data}`);
        });

        subprocess.on('close', (code) => {
            console.log(`yt-dlp process exited with code ${code}`);
            if (code !== 0) {
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Download failed' });
                }
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
};

const getInfo = async (url) => {
    try {
        const metadata = await ytDlp(url, {
            dumpJson: true,
            noWarnings: true,
        }, { ytDlpBinary: binaryPath });
        return {
            title: metadata.title,
            thumbnail: metadata.thumbnail,
            duration: metadata.duration_string,
            platform: metadata.extractor_key
        };
    } catch (error) {
        console.error('GetInfo error:', error);
        throw new Error('Failed to get video info');
    }
};

module.exports = { downloadMedia, getInfo };
