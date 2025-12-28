import { useState, useEffect, useRef } from 'react'
import { Download, Link2, Loader2, CheckCircle, AlertCircle, Music, Video, Zap, Shield, Sparkles, Clipboard } from 'lucide-react'

const THEMES = {
    DEFAULT: {
        primary: '#4f46e5',
        bg: '#f8fafc',
        text: '#0f172a',
        card: '#ffffff',
        border: 'rgba(0, 0, 0, 0.05)',
        input: '#ffffff',
        gradient: 'none'
    },
    YOUTUBE: {
        primary: '#FF0000',
        bg: '#0F0F0F',
        text: '#ffffff',
        card: '#1A1A1A',
        border: 'rgba(255, 255, 255, 0.05)',
        input: '#242424',
        gradient: 'none'
    },
    TWITTER: {
        primary: '#1DA1F2',
        bg: '#000000',
        text: '#ffffff',
        card: '#121212',
        border: 'rgba(255, 255, 255, 0.1)',
        input: '#1A1A1A',
        gradient: 'none'
    },
    INSTAGRAM: {
        primary: '#bc1888',
        bg: '#ffffff',
        text: '#0f172a',
        card: '#ffffff',
        border: 'rgba(0, 0, 0, 0.05)',
        input: '#f9fafb',
        gradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
    },
    TIKTOK: {
        primary: '#25F4EE',
        bg: '#010101',
        text: '#ffffff',
        card: '#121212',
        border: 'rgba(255, 255, 255, 0.08)',
        input: '#1A1A1A',
        gradient: 'linear-gradient(90deg, #FE2C55 0%, #25F4EE 100%)'
    }
}

function App() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [metadata, setMetadata] = useState(null)
    const [format, setFormat] = useState('mp4')
    const [activeTheme, setActiveTheme] = useState('DEFAULT')
    const rotationIndex = useRef(0)
    const abortControllerRef = useRef(null)

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text) {
                setUrl(text)
                // fetchInfo se disparará automáticamente por el useEffect de [url]
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err)
        }
    }

    // Apply theme to document root
    useEffect(() => {
        const theme = THEMES[activeTheme] || THEMES.DEFAULT
        const root = document.documentElement
        root.style.setProperty('--brand-primary', theme.primary)
        root.style.setProperty('--brand-bg', theme.bg)
        root.style.setProperty('--brand-text', theme.text)
        root.style.setProperty('--brand-card', theme.card)
        root.style.setProperty('--brand-border', theme.border)
        root.style.setProperty('--brand-input', theme.input)
        root.style.setProperty('--brand-gradient', theme.gradient)
    }, [activeTheme])

    // Detect platform from URL
    useEffect(() => {
        if (!url) return

        const lowerUrl = url.toLowerCase()
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
            setActiveTheme('YOUTUBE')
        } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
            setActiveTheme('TWITTER')
        } else if (lowerUrl.includes('instagram.com')) {
            setActiveTheme('INSTAGRAM')
        } else if (lowerUrl.includes('tiktok.com')) {
            setActiveTheme('TIKTOK')
        } else {
            setActiveTheme('DEFAULT')
        }
    }, [url])

    // Rotate themes when idle
    useEffect(() => {
        if (url) return

        const themes = Object.keys(THEMES)
        const interval = setInterval(() => {
            rotationIndex.current = (rotationIndex.current + 1) % themes.length
            setActiveTheme(themes[rotationIndex.current])
        }, 5000)

        return () => clearInterval(interval)
    }, [url])

    const fetchInfo = async (targetUrl) => {
        const urlToFetch = targetUrl || url
        if (!urlToFetch) return

        // Cancel previous request if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        // Create new controller
        const controller = new AbortController()
        abortControllerRef.current = controller

        setLoading(true)
        setError('')
        setMetadata(null)

        try {
            const res = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlToFetch }),
                signal: controller.signal
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch info')

            setMetadata(data)
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Fetch aborted')
                return
            }
            console.error(err)
            if (urlToFetch.length > 15) setError(err.message)
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false)
            }
        }
    }

    // Auto-fetch info when URL changes (Debounced)
    useEffect(() => {
        if (!url) return

        const lowerUrl = url.toLowerCase()
        const isPlatformUrl = lowerUrl.includes('youtube.com') ||
            lowerUrl.includes('youtu.be') ||
            lowerUrl.includes('instagram.com') ||
            lowerUrl.includes('tiktok.com') ||
            lowerUrl.includes('twitter.com') ||
            lowerUrl.includes('x.com')

        if (isPlatformUrl || (url.startsWith('http') && url.length > 15)) {
            const timer = setTimeout(() => {
                fetchInfo(url)
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [url])

    const handleDownload = async (e) => {
        e.preventDefault()
        if (!url) return

        if (!metadata) {
            setLoading(true)
            try {
                const res = await fetch('/api/info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to fetch info')
                setMetadata(data)
            } catch (err) {
                setError(err.message)
                setLoading(false)
                return
            }
        }

        const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format=${format}&t=${Date.now()}`
        window.location.href = downloadUrl
        setLoading(false)
    }

    const currentThemeData = THEMES[activeTheme] || THEMES.DEFAULT

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-1000">

            {/* Liquid Background Glow */}
            <div
                className="absolute top-1/2 left-1/2 w-[100vw] h-[80vh] rounded-full blur-[160px] -z-10 animate-glow transition-all duration-[1200ms] ease-in-out"
                style={{
                    background: currentThemeData.gradient !== 'none' ? currentThemeData.gradient : currentThemeData.primary,
                    backgroundColor: currentThemeData.primary
                }}
            ></div>

            <main className="w-full max-w-xl relative z-10 space-y-6 md:space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-[1000ms]">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                        Media<span className="text-brand">Fetch</span>
                    </h1>
                    <p className="opacity-50 text-sm md:text-base max-w-xs mx-auto font-medium leading-relaxed">
                        High-quality media preservation.
                    </p>
                </div>

                {/* Main Card */}
                <div className="card-panel p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-[1000ms] delay-200">

                    <form onSubmit={handleDownload} className="space-y-6">
                        <div className="space-y-3">
                            <div className="px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Source URL</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-100 group-focus-within:text-brand transition-all duration-500">
                                    <Link2 className="w-5 h-5" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="Paste URL..."
                                    className="input-field pl-14 pr-24 py-4 text-base shadow-sm"
                                    value={url}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setUrl(val);
                                        if (!val) {
                                            setMetadata(null);
                                            setError('');
                                            setLoading(false);
                                            if (abortControllerRef.current) {
                                                abortControllerRef.current.abort();
                                            }
                                        }
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handlePaste}
                                    className="absolute inset-y-2 right-2 px-4 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-xl transition-all flex items-center gap-2 group/paste"
                                >
                                    <Clipboard className="w-4 h-4 transition-transform group-hover/paste:scale-110" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Paste</span>
                                </button>
                            </div>
                        </div>

                        {metadata && (
                            <div className="bg-brand/5 backdrop-blur-md p-4 rounded-3xl border border-brand/10 flex items-center gap-4 animate-in slide-in-from-right-8 duration-700">
                                {metadata.thumbnail && (
                                    <img
                                        src={metadata.thumbnail}
                                        alt="Thumbnail"
                                        className="w-16 h-16 object-cover rounded-2xl shadow-xl"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black truncate text-base leading-tight mb-1">{metadata.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-brand text-white px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg shadow-brand/20 transition-all duration-700">
                                            {metadata.platform}
                                        </span>
                                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{metadata.duration}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Output Format</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormat('mp4')}
                                    className={`btn-secondary h-14 flex items-center justify-center gap-2.5 group ${format === 'mp4' ? 'active shadow-xl' : ''}`}
                                >
                                    <Video className={`w-4 h-4 transition-all duration-700 ${format === 'mp4' ? 'scale-110' : 'opacity-40'}`} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">Video</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormat('mp3')}
                                    className={`btn-secondary h-14 flex items-center justify-center gap-2.5 group ${format === 'mp3' ? 'active shadow-xl' : ''}`}
                                >
                                    <Music className={`w-4 h-4 transition-all duration-700 ${format === 'mp3' ? 'scale-110' : 'opacity-40'}`} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">Audio</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !url || !metadata}
                            className="w-full btn-primary h-16 text-lg font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3.5 group shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-6 h-6 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500" />
                                    <span>Download</span>
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in-95">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    )
}

export default App
