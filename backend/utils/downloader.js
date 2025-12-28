const ytDlp = require('yt-dlp-exec');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');

const binaryPath = null;

const downloadMedia = async (url, format, res) => {
    try {
        console.log(`Starting download for: ${url} [${format}]`);

        // Get metadata first
        const metadata = await ytDlp(url, {
            dumpJson: true,
            noWarnings: true,
            ffmpegLocation: ffmpegPath,
        }, { ytDlpBinary: binaryPath });

        if (!metadata || !metadata.title) {
            throw new Error('Could not find media content for this link.');
        }

        const title = metadata.title.replace(/[^\w\s-]/gi, '').trim() || 'audio';
        const filename = `${title}.${format === 'mp3' ? 'mp3' : 'mp4'}`;

        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.header('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

        if (format === 'mp3') {
            const ytProcess = spawn(binaryPath, [
                url,
                '-f', 'bestaudio/best',
                '--no-check-certificates',
                '--no-warnings',
                '-o', '-'
            ]);

            const ffmpegProcess = spawn(ffmpegPath, [
                '-i', 'pipe:0',
                '-f', 'mp3',
                '-acodec', 'libmp3lame',
                '-ab', '192k',
                'pipe:1'
            ]);

            ytProcess.stdout.pipe(ffmpegProcess.stdin);
            ffmpegProcess.stdout.pipe(res);

            res.on('close', () => {
                ytProcess.kill();
                ffmpegProcess.kill();
            });

        } else {
            const ytProcess = spawn(binaryPath, [
                url,
                '-f', 'best[ext=mp4]/best',
                '--no-check-certificates',
                '--no-warnings',
                '-o', '-'
            ]);

            ytProcess.stdout.pipe(res);
            res.on('close', () => ytProcess.kill());
        }

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

        if (!metadata || !metadata.title) {
            throw new Error('Media details not found');
        }

        let thumb = metadata.thumbnail;
        if (metadata.thumbnails && metadata.thumbnails.length > 0) {
            thumb = metadata.thumbnails[metadata.thumbnails.length - 1].url;
        }

        return {
            title: metadata.title,
            thumbnail: thumb,
            duration: metadata.duration_string || (metadata.duration ? `${Math.floor(metadata.duration / 60)}:${String(Math.floor(metadata.duration % 60)).padStart(2, '0')}` : 'N/A'),
            platform: metadata.extractor_key ? metadata.extractor_key.charAt(0).toUpperCase() + metadata.extractor_key.slice(1) : 'Video'
        };
    } catch (error) {
        console.error('GetInfo error:', error);
        throw new Error('This platform is not supported or link is invalid.');
    }
};

module.exports = { downloadMedia, getInfo };
