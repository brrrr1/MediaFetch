import { useState } from 'react'
import { Download, Link2, Loader2, CheckCircle, AlertCircle, Music, Video, Zap, Shield, Sparkles } from 'lucide-react'

function App() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [metadata, setMetadata] = useState(null)
    const [format, setFormat] = useState('mp4')

    const fetchInfo = async () => {
        if (!url) return
        setLoading(true)
        setError('')
        setMetadata(null)

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
            console.error(err)
            // Silent fail on blur unless it's a manual download click
        } finally {
            setLoading(false)
        }
    }

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

        window.location.href = `/api/download?url=${encodeURIComponent(url)}&format=${format}&t=${Date.now()}`
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-slate-50">
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -z-10 opacity-60"></div>

            <main className="w-full max-w-xl relative z-10 space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 rounded-full shadow-sm mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                        <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">Universal Downloader</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                        Media<span className="text-indigo-600">Fetch</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-md mx-auto">
                        High-quality media downloads from YouTube, TikTok, Instagram, and more.
                    </p>
                </div>

                {/* Main Card */}
                <div className="card-panel p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 bg-white border border-slate-200 shadow-xl rounded-2xl">

                    <form onSubmit={handleDownload} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">Media URL</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Link2 className="w-5 h-5" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="Paste video URL from TikTok, YouTube or Instagram..."
                                    className="input-field pl-12"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onBlur={fetchInfo}
                                    required
                                />
                            </div>
                        </div>

                        {metadata && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                                {metadata.thumbnail && (
                                    <img
                                        src={metadata.thumbnail}
                                        alt="Thumbnail"
                                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="flex-1 min-w-0 py-1">
                                    <h3 className="font-semibold text-slate-900 truncate leading-tight">{metadata.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md capitalize font-medium">{metadata.platform}</span>
                                        <span>{metadata.duration}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700 ml-1">Output Format</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormat('mp4')}
                                    className={`btn-secondary flex items-center justify-center gap-2 ${format === 'mp4' ? 'active' : ''}`}
                                >
                                    <Video className={`w-4 h-4 ${format === 'mp4' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span>MP4 Video</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormat('mp3')}
                                    className={`btn-secondary flex items-center justify-center gap-2 ${format === 'mp3' ? 'active' : ''}`}
                                >
                                    <Music className={`w-4 h-4 ${format === 'mp3' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span>MP3 Audio</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !url}
                            className="w-full btn-primary h-14 text-lg flex items-center justify-center gap-2.5 group hover:shadow-lg hover:shadow-indigo-500/30"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Download Media</span>
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100/50 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="leading-relaxed">{error}</p>
                        </div>
                    )}
                </div>

                {/* Features / Footer */}
                <div className="grid grid-cols-3 gap-4 text-center px-4">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-medium">Lightning Fast</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Shield className="w-5 h-5" />
                        <span className="text-xs font-medium">Secure & Safe</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-xs font-medium">Best Quality</span>
                    </div>
                </div>

            </main>

            <footer className="absolute bottom-6 text-slate-400 text-sm z-10 font-medium tracking-tight">
                © {new Date().getFullYear()} MediaFetch Inc.
            </footer>
        </div>
    )
}

export default App
