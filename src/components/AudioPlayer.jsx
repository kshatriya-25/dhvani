import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import client from '../api/client'

export default function AudioPlayer({ callId }) {
  const [audioUrl, setAudioUrl] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const loadAudio = async () => {
    if (audioUrl) {
      togglePlay()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get(`/api/calls/${callId}/recording`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(data)
      setAudioUrl(url)
      setTimeout(() => {
        audioRef.current?.play()
        setPlaying(true)
      }, 0)
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={loadAudio}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="animate-spin h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        ) : playing ? (
          <Pause size={14} />
        ) : (
          <Play size={14} />
        )}
        {loading ? 'Loading...' : playing ? 'Pause' : audioUrl ? 'Play' : 'Load'}
      </button>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
