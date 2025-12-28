const ytDlp = require('yt-dlp-exec');
const { spawn } = require('child_process');

const ffmpegPath = 'ffmpeg';
const binaryPath = 'yt-dlp';

const downloadMedia = async (url, format, res) => {
    try {
        console.log(`[DOWNLOAD] Initiating: ${url} (${format})`);

        // Obtener metadatos para el nombre del archivo
        const metadata = await ytDlp(url, {
            dumpJson: true,
            noWarnings: true,
        });

        const title = metadata.title.replace(/[^\w\s-]/gi, '').trim() || 'media';
        const filename = `${title}.${format === 'mp3' ? 'mp3' : 'mp4'}`;

        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.header('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

        if (format === 'mp3') {
            console.log(`[MP3] Spawning yt-dlp + ffmpeg pipeline`);
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

            ytProcess.stderr.on('data', (d) => console.log(`[yt-dlp stderr]: ${d}`));
            ffmpegProcess.stderr.on('data', (d) => console.log(`[ffmpeg stderr]: ${d}`));

            res.on('close', () => {
                console.log(`[MP3] Client closed connection, killing processes`);
                ytProcess.kill();
                ffmpegProcess.kill();
            });

        } else {
            console.log(`[MP4] Spawning yt-dlp direct stream`);
            // Nota: Para streaming directo por stdout, usamos 'best' para evitar problemas de merging
            const ytProcess = spawn(binaryPath, [
                url,
                '-f', 'best[ext=mp4]/best',
                '--no-check-certificates',
                '--no-warnings',
                '-o', '-'
            ]);

            ytProcess.stdout.pipe(res);

            ytProcess.stderr.on('data', (d) => console.log(`[yt-dlp stderr]: ${d}`));

            res.on('close', () => {
                console.log(`[MP4] Client closed connection, killing process`);
                ytProcess.kill();
            });
        }

    } catch (error) {
        console.error('[DOWNLOAD ERROR]:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process download. Please try again.' });
        }
    }
};

const getInfo = async (url) => {
    try {
        const metadata = await ytDlp(url, {
            dumpJson: true,
            noWarnings: true,
        });

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
        console.error('[INFO ERROR]:', error);
        throw new Error('Invalid URL or platform not supported');
    }
};

module.exports = { downloadMedia, getInfo };
