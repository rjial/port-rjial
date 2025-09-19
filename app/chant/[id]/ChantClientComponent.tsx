'use client'

import { useState, useEffect, useRef } from 'react'

// Data structure for song information
interface Lyric {
  time: number
  text: string
}

interface SongData {
  title: string
  author: string
  youtubeId: string
  lyrics: Lyric[]
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface ChantClientComponentProps {
  params: { id: string }
  initialData: SongData | null
}

export default function ChantClientComponent({ params, initialData }: ChantClientComponentProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [player, setPlayer] = useState<any>(null)
  const [isYouTubeReady, setIsYouTubeReady] = useState(false)
  const [songData, setSongData] = useState<SongData>(
    initialData || {
      title: `Song ${params.id}`,
      author: "Unknown Artist",
      youtubeId: params.id,
      lyrics: []
    }
  )
  const [isEditorMode, setIsEditorMode] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load song data from localStorage or initial data
  useEffect(() => {
    if (initialData) {
      // If we have server-side data, use it and sync to localStorage
      setSongData(initialData)
      const storageKey = `songData-${params.id}`
      localStorage.setItem(storageKey, JSON.stringify(initialData))
    } else {
      // Fallback to localStorage
      const storageKey = `songData-${params.id}`
      const savedData = localStorage.getItem(storageKey)
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setSongData(parsedData)
        } catch (error) {
          console.error('Error parsing saved data:', error)
          const newSongData: SongData = {
            title: `Song ${params.id}`,
            author: "Unknown Artist",
            youtubeId: params.id,
            lyrics: []
          }
          setSongData(newSongData)
          localStorage.setItem(storageKey, JSON.stringify(newSongData))
        }
      }
    }
  }, [params.id, initialData])

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsYouTubeReady(true)
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeReady(true)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Initialize player when YouTube API is ready and songData is available
  useEffect(() => {
    if (isYouTubeReady && songData.youtubeId && !isEditorMode) {
      // Clear any existing player first
      if (player) {
        try {
          player.destroy()
        } catch (error) {
          console.log('Player destroy error (expected):', error)
        }
      }
      
      // Small delay to ensure DOM is ready after mode switch
      const timer = setTimeout(() => {
        initializePlayer()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isYouTubeReady, songData.youtubeId, isEditorMode])

  // Clean up player state when switching to editor mode
  useEffect(() => {
    if (isEditorMode && player) {
      // Pause the main player when switching to editor mode
      try {
        player.pauseVideo()
        setIsPlaying(false)
      } catch (error) {
        console.log('Player pause error:', error)
      }
      
      // Clear the time tracking interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isEditorMode, player])

  // Save songData to localStorage and API whenever it changes
  useEffect(() => {
    if (songData.youtubeId) {
      const storageKey = `songData-${params.id}`
      localStorage.setItem(storageKey, JSON.stringify(songData))
      
      // Also save to API (but don't await to avoid blocking UI)
      saveToAPI(songData).catch(console.error)
    }
  }, [songData, params.id])

  const saveToAPI = async (data: SongData) => {
    try {
      const response = await fetch(`/api/lyrics/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save to API')
      }
    } catch (error) {
      console.error('Error saving to API:', error)
    }
  }

  const initializePlayer = () => {
    if (!playerRef.current || !window.YT || isEditorMode) return

    // Clear the container first to avoid duplicate players
    if (playerRef.current) {
      playerRef.current.innerHTML = ''
    }

    const newPlayer = new window.YT.Player(playerRef.current, {
      height: '100%',
      width: '100%',
      videoId: songData.youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: any) => {
          setPlayer(event.target)
          setDuration(event.target.getDuration() * 1000)
          startTimeTracking(event.target)
        },
        onStateChange: (event: any) => {
          const playerState = event.data
          if (playerState === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true)
          } else if (playerState === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false)
          }
        }
      }
    })
  }

  const startTimeTracking = (ytPlayer: any) => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    const updateTime = () => {
      if (ytPlayer && ytPlayer.getCurrentTime) {
        const timeInMs = ytPlayer.getCurrentTime() * 1000
        setCurrentTime(timeInMs)
      }
    }
    intervalRef.current = setInterval(updateTime, 100)
  }

  const togglePlayPause = () => {
    if (!player) {
      console.log('Player not available, trying to reinitialize...')
      if (!isEditorMode && isYouTubeReady && songData.youtubeId) {
        initializePlayer()
      }
      return
    }
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) {
      console.log('Player not available for seeking')
      return
    }
    const newTimeMs = parseInt(e.target.value)
    const newTimeSeconds = newTimeMs / 1000
    player.seekTo(newTimeSeconds, true)
    setCurrentTime(newTimeMs)
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  const getCurrentLyric = () => {
    for (let i = songData.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= songData.lyrics[i].time) {
        return i
      }
    }
    return -1
  }

  const goToPreviousLyric = () => {
    if (!player) {
      console.log('Player not available for navigation')
      return
    }
    const currentLyricIndex = getCurrentLyric()
    const previousIndex = Math.max(0, currentLyricIndex - 1)
    const previousTime = songData.lyrics[previousIndex].time / 1000
    player.seekTo(previousTime, true)
    setCurrentTime(songData.lyrics[previousIndex].time)
  }

  const goToNextLyric = () => {
    if (!player) {
      console.log('Player not available for navigation')
      return
    }
    const currentLyricIndex = getCurrentLyric()
    const nextIndex = Math.min(songData.lyrics.length - 1, currentLyricIndex + 1)
    const nextTime = songData.lyrics[nextIndex].time / 1000
    player.seekTo(nextTime, true)
    setCurrentTime(songData.lyrics[nextIndex].time)
  }

  const exportJSON = () => {
    const dataStr = JSON.stringify(songData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `${songData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lyrics.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.title && importedData.author && importedData.youtubeId && importedData.lyrics) {
          // Preserve YouTube ID from URL
          const updatedData = { ...importedData, youtubeId: params.id }
          setSongData(updatedData)
          setCurrentTime(0)
        } else {
          alert('Invalid JSON structure. Please ensure the file contains title, author, youtubeId, and lyrics.')
        }
      } catch (error) {
        alert('Error parsing JSON file. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <main className="h-screen bg-primary p-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">{songData.title}</h1>
          <p className="text-gray-600">by {songData.author}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={importJSON}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary/80 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
          >
            📁 Import
          </button>
          <button
            onClick={exportJSON}
            className="bg-primary hover:bg-primary/80 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
          >
            💾 Export
          </button>
          <button
            onClick={async () => {
              try {
                await saveToAPI(songData)
                alert('Saved to API successfully!')
              } catch (error) {
                alert('Failed to save to API')
              }
            }}
            className="bg-primary hover:bg-primary/80 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
          >
            🌐 Save to API
          </button>
          
          <button
            onClick={() => setIsEditorMode(!isEditorMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
              isEditorMode 
                ? 'bg-primary hover:bg-primary/80 text-gray-800 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-md'
            }`}
          >
            {isEditorMode ? '🎵 Player' : '✏️ Editor'}
          </button>
        </div>
      </div>

      {isEditorMode ? (
        <EditorMode songData={songData} setSongData={setSongData} params={params} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          <div className="flex flex-col justify-center items-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">YouTube Chantmix Tracker</h2>
            
            <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden relative">
              <div ref={playerRef} className="w-full h-full" />
              {!player && !isEditorMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔄</div>
                    <div className="text-sm">Loading player...</div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={goToPreviousLyric}
                  className="bg-primary hover:bg-primary/80 text-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
                  disabled={getCurrentLyric() <= 0}
                >
                  ⏮️ Prev
                </button>
                <button
                  onClick={togglePlayPause}
                  className="bg-primary hover:bg-primary/80 text-gray-800 px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 border-2 border-primary/30 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/30 shadow-lg"
                  disabled={!player}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                <button
                  onClick={goToNextLyric}
                  className="bg-primary hover:bg-primary/80 text-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
                  disabled={getCurrentLyric() >= songData.lyrics.length - 1}
                >
                  Next ⏭️
                </button>
              </div>
              
              {!player && !isEditorMode && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      console.log('Manual player initialization')
                      initializePlayer()
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    🔄 Reload Player
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 180000}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                />
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || 180000)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-full px-4 overflow-x-hidden">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lyrics</h2>
            
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-h-96 overflow-y-auto overflow-x-hidden w-full max-w-2xl">
              {songData.lyrics.map((lyric: Lyric, index: number) => {
                const currentLyricIndex = getCurrentLyric()
                const isActive = currentLyricIndex === index
                const isNear = Math.abs(currentLyricIndex - index) <= 2
                
                if (!isNear && songData.lyrics.length > 10) return null
                
                return (
                  <div
                    key={index}
                    className={`transition-all duration-300 w-full px-4 ${
                      isActive
                        ? 'text-gray-800 text-2xl font-bold scale-110'
                        : 'text-gray-500 text-lg'
                    }`}
                    ref={isActive ? (el) => {
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    } : null}
                  >
                    <p className="break-words leading-relaxed">{lyric.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1f2937;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1f2937;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </main>
  )
}

// Editor Mode Component
function EditorMode({ songData, setSongData, params }: { songData: SongData, setSongData: (data: SongData) => void, params: { id: string } }) {
  const [editData, setEditData] = useState<SongData>({
    ...songData,
    youtubeId: params.id
  })
  const [editorPlayer, setEditorPlayer] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [currentLyricText, setCurrentLyricText] = useState('')
  const [lyricStartTime, setLyricStartTime] = useState<number | null>(null)
  const [editingLyric, setEditingLyric] = useState<Lyric | null>(null)
  const [isKaraokeMode, setIsKaraokeMode] = useState(false)
  const editorPlayerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setEditData({
      ...songData,
      youtubeId: params.id
    })
  }, [songData, params.id])

  useEffect(() => {
    if (window.YT && window.YT.Player && editorPlayerRef.current && editData.youtubeId) {
      const player = new window.YT.Player(editorPlayerRef.current, {
        height: '100%',
        width: '100%',
        videoId: editData.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 0,
          fs: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 1,
        },
        events: {
          onReady: (event: any) => {
            setEditorPlayer(event.target)
            setIsReady(true)
            setDuration(event.target.getDuration() * 1000)
            startTimeTracking(event.target)
          },
          onStateChange: (event: any) => {
            const playerState = event.data
            if (playerState === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (playerState === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            }
          }
        }
      })
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [editData.youtubeId])

  const startTimeTracking = (ytPlayer: any) => {
    const updateTime = () => {
      if (ytPlayer && ytPlayer.getCurrentTime) {
        const timeInMs = ytPlayer.getCurrentTime() * 1000
        setCurrentTime(timeInMs)
      }
    }
    intervalRef.current = setInterval(updateTime, 100)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          jumpBackward()
          break
        case 'ArrowRight':
          event.preventDefault()
          jumpForward()
          break
        case ' ':
          event.preventDefault()
          togglePlayPause()
          break
        case 's':
        case 'S':
          event.preventDefault()
          markStartTime()
          break
        case 'Enter':
          event.preventDefault()
          if (editingLyric) {
            updateLyric()
          } else {
            addLyric()
          }
          break
        case 'Escape':
          event.preventDefault()
          cancelEdit()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentLyricText, editingLyric, lyricStartTime])

  const formatTimeWithMilliseconds = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = ms % 1000
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }

  const updateSongData = () => {
    const updatedData = {
      ...editData,
      youtubeId: params.id
    }
    setSongData(updatedData)
    alert('Song data updated successfully!')
  }

  const getCurrentLyric = () => {
    for (let i = editData.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= editData.lyrics[i].time) {
        return editData.lyrics[i]
      }
    }
    return null
  }

  const addLyric = () => {
    if (currentLyricText.trim()) {
      const startTime = lyricStartTime !== null ? lyricStartTime : currentTime
      const newLyric: Lyric = {
        time: Math.round(startTime),
        text: currentLyricText.trim()
      }
      setEditData({
        ...editData,
        lyrics: [...editData.lyrics, newLyric].sort((a, b) => a.time - b.time)
      })
      setCurrentLyricText('')
      setLyricStartTime(null)
    }
  }

  const markStartTime = () => {
    setLyricStartTime(currentTime)
  }

  const editLyric = (lyric: Lyric) => {
    setEditingLyric(lyric)
    setCurrentLyricText(lyric.text)
    setLyricStartTime(lyric.time)
  }

  const updateLyric = () => {
    if (editingLyric && currentLyricText.trim()) {
      const startTime = lyricStartTime !== null ? lyricStartTime : editingLyric.time
      const updatedLyric: Lyric = {
        ...editingLyric,
        text: currentLyricText.trim(),
        time: Math.round(startTime)
      }
      setEditData({
        ...editData,
        lyrics: editData.lyrics.map(lyric => 
          lyric.time === editingLyric.time && lyric.text === editingLyric.text 
            ? updatedLyric 
            : lyric
        ).sort((a, b) => a.time - b.time)
      })
      setCurrentLyricText('')
      setEditingLyric(null)
      setLyricStartTime(null)
    }
  }

  const cancelEdit = () => {
    setEditingLyric(null)
    setCurrentLyricText('')
    setLyricStartTime(null)
  }

  const jumpToLyric = (startTime: number) => {
    if (editorPlayer) {
      editorPlayer.seekTo(startTime / 1000, true)
    }
  }

  const jumpBackward = () => {
    if (editorPlayer) {
      const newTime = Math.max(0, currentTime - 100)
      editorPlayer.seekTo(newTime / 1000, true)
    }
  }

  const jumpForward = () => {
    if (editorPlayer) {
      const newTime = currentTime + 100
      editorPlayer.seekTo(newTime / 1000, true)
    }
  }

  const togglePlayPause = () => {
    if (!editorPlayer) return
    if (isPlaying) {
      editorPlayer.pauseVideo()
    } else {
      editorPlayer.playVideo()
    }
  }

  const jumpToPreviousLyric = () => {
    const currentLyric = getCurrentLyric()
    let targetLyric
    
    if (currentLyric) {
      const currentIndex = editData.lyrics.findIndex(lyric => lyric.time === currentLyric.time)
      targetLyric = editData.lyrics[currentIndex - 1]
    } else {
      targetLyric = editData.lyrics
        .filter(lyric => lyric.time < currentTime)
        .sort((a, b) => b.time - a.time)[0]
    }
    
    if (targetLyric) {
      jumpToLyric(targetLyric.time)
    }
  }

  const jumpToNextLyric = () => {
    const currentLyric = getCurrentLyric()
    let targetLyric
    
    if (currentLyric) {
      const currentIndex = editData.lyrics.findIndex(lyric => lyric.time === currentLyric.time)
      targetLyric = editData.lyrics[currentIndex + 1]
    } else {
      targetLyric = editData.lyrics
        .filter(lyric => lyric.time > currentTime)
        .sort((a, b) => a.time - b.time)[0]
    }
    
    if (targetLyric) {
      jumpToLyric(targetLyric.time)
    }
  }

  const currentLyric = getCurrentLyric()

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Song Title"
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none border border-gray-600 hover:border-gray-500 transition-all duration-200"
          />
          <input
            type="text"
            value={editData.author}
            onChange={(e) => setEditData({ ...editData, author: e.target.value })}
            placeholder="Artist"
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none border border-gray-600 hover:border-gray-500 transition-all duration-200"
          />
          <div className="flex-2 p-3 bg-gray-600 text-gray-300 rounded-lg border-2 border-gray-500 flex items-center">
            <span className="text-sm mr-2">🎵</span>
            <span className="text-sm">YouTube ID: {editData.youtubeId}</span>
            <span className="text-xs text-gray-400 ml-2">(from URL)</span>
          </div>
                      <button
            onClick={updateSongData}
            className="bg-primary hover:bg-primary/80 text-gray-800 px-6 py-3 rounded-lg transition-all duration-200 font-medium border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
          >
            Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-gray-800 rounded-lg p-4 sticky top-4 self-start">
          {editData.youtubeId ? (
            <div className="space-y-4">
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <div ref={editorPlayerRef} className="w-full h-full" />
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-mono text-gray-300">{formatTimeWithMilliseconds(currentTime)}</span>
                <div className="flex-1 bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-200"
                    style={{
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-300">{formatTimeWithMilliseconds(duration)}</span>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={jumpToPreviousLyric}
                  disabled={!editData.youtubeId || editData.lyrics.length === 0}
                  className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 border-2 border-primary/30 hover:border-primary/50 disabled:border-gray-500 hover:shadow-lg hover:shadow-primary/20"
                  title="Jump to previous lyric"
                >
                  <span>⏮️</span>
                  <span>Previous</span>
                </button>
                
                <button
                  onClick={togglePlayPause}
                  disabled={!isReady || !editData.youtubeId}
                  className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-200 text-xl border-2 border-primary/40 hover:border-primary/60 disabled:border-gray-500 hover:shadow-xl hover:shadow-primary/30 shadow-lg"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                
                <button
                  onClick={jumpToNextLyric}
                  disabled={!editData.youtubeId || editData.lyrics.length === 0}
                  className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 border-2 border-primary/30 hover:border-primary/50 disabled:border-gray-500 hover:shadow-lg hover:shadow-primary/20"
                  title="Jump to next lyric"
                >
                  <span>Next</span>
                  <span>⏭️</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-8 text-center aspect-video flex items-center justify-center">
              <div>
                <div className="text-4xl mb-2">🎵</div>
                <p className="text-gray-400">Enter YouTube ID to start</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            {!isKaraokeMode ? (
              <>
                <h3 className="text-lg font-semibold text-white">
                  Chants ({editData.lyrics.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={jumpBackward}
                    disabled={!editData.youtubeId}
                    className="bg-primary hover:bg-primary/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-800 disabled:text-gray-400 px-2 py-1 rounded text-xs font-medium transition-all duration-200 border border-primary/30 hover:border-primary/50 disabled:border-gray-600 hover:shadow-md hover:shadow-primary/10"
                    title="Jump back 100ms (←)"
                  >
                    ⏪ -100ms
                  </button>
                  <button
                    onClick={jumpForward}
                    disabled={!editData.youtubeId}
                    className="bg-primary hover:bg-primary/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-800 disabled:text-gray-400 px-2 py-1 rounded text-xs font-medium transition-all duration-200 border border-primary/30 hover:border-primary/50 disabled:border-gray-600 hover:shadow-md hover:shadow-primary/10"
                    title="Jump forward 100ms (→)"
                  >
                    ⏩ +100ms
                  </button>
                  <button
                    onClick={markStartTime}
                    disabled={!editData.youtubeId}
                    className="bg-primary hover:bg-primary/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-800 disabled:text-gray-400 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ml-1 border border-primary/30 hover:border-primary/50 disabled:border-gray-600 hover:shadow-md hover:shadow-primary/10"
                    title="Mark start time (S)"
                  >
                    📍 Start
                  </button>
                </div>
              </>
            ) : (
              <div />
            )}
            
            <button
              onClick={() => setIsKaraokeMode(!isKaraokeMode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isKaraokeMode 
                  ? 'bg-primary hover:bg-primary/80 text-gray-800 border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20' 
                  : 'bg-primary hover:bg-primary/80 text-gray-800 border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20'
              }`}
            >
              {isKaraokeMode ? '✏️ Edit Mode' : '👁️ View Mode'}
            </button>
          </div>

          {!isKaraokeMode && editData.youtubeId && (
            <div className="mb-3 p-2 bg-gray-700 rounded text-xs text-gray-300">
              <div className="font-medium mb-1">⌨️ Keyboard Shortcuts:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>← Previous 100ms</span>
                <span>→ Next 100ms</span>
                <span>Space Play/Pause</span>
                <span>S Mark Start Time</span>
                <span>Enter Add/Update Lyric</span>
                <span>Esc Cancel Edit</span>
              </div>
              {lyricStartTime !== null && (
                <div className="mt-2 p-2 bg-orange-900/30 border border-orange-500/30 rounded text-xs">
                  <span className="text-orange-300">
                    📍 Start marked at: {formatTimeWithMilliseconds(lyricStartTime)}
                    <span className="text-gray-400 ml-2">
                      (End will be set when adding lyric)
                    </span>
                  </span>
                </div>
              )}
              {editingLyric && (
                <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/30 rounded text-xs">
                  <span className="text-blue-300">
                    ✏️ Editing: "{editingLyric.text}"
                    <span className="text-gray-400 ml-2">
                      (Press Enter to update, Esc to cancel)
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0">
            {editData.lyrics.length > 0 ? (
              isKaraokeMode ? (
                <div className="flex flex-col justify-center min-h-full py-8 px-4 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800">
                  {editData.lyrics.map((lyric, index) => {
                    const isActive = currentLyric?.time === lyric.time
                    const isPrevious = editData.lyrics.findIndex(l => l.time === lyric.time) < editData.lyrics.findIndex(l => l.time === currentLyric?.time)
                    const isNext = editData.lyrics.findIndex(l => l.time === lyric.time) > editData.lyrics.findIndex(l => l.time === currentLyric?.time)
                    
                    return (
                      <div
                        key={index}
                        onClick={() => jumpToLyric(lyric.time)}
                        className={`cursor-pointer transition-all duration-300 ease-out text-center py-3 px-4 ${
                          isActive
                            ? 'text-2xl md:text-3xl font-bold text-white drop-shadow-lg translate-x-0'
                            : isPrevious
                            ? 'text-lg text-gray-500 opacity-60'
                            : isNext
                            ? 'text-lg text-gray-400 opacity-70 hover:text-gray-300 hover:opacity-90'
                            : 'text-lg text-gray-400 opacity-70'
                        }`}
                        style={{
                          textShadow: isActive
                            ? '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4), 2px 2px 4px rgba(0,0,0,0.8)'
                            : '1px 1px 2px rgba(0,0,0,0.8)',
                          lineHeight: isActive ? '1.2' : '1.4'
                        }}
                      >
                        {lyric.text}
                        {isActive && (
                          <div className="text-xs text-blue-300 mt-2 font-normal opacity-75">
                            {formatTimeWithMilliseconds(lyric.time)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {editData.lyrics.map((lyric, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg transition-all duration-200 relative ${
                        editingLyric?.time === lyric.time && editingLyric?.text === lyric.text
                          ? 'bg-blue-700 border-2 border-blue-500 text-white z-10'
                          : currentLyric?.time === lyric.time
                          ? 'bg-blue-600 text-white shadow-xl z-20 my-4'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 z-0'
                      }`}
                      style={{
                        marginTop: currentLyric?.time === lyric.time ? '16px' : undefined,
                        marginBottom: currentLyric?.time === lyric.time ? '16px' : undefined,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className="flex-1 cursor-pointer"
                          onClick={() => jumpToLyric(lyric.time)}
                        >
                          {lyric.text}
                        </span>
                        <div className="flex items-center space-x-2 ml-2">
                          <div className="text-xs opacity-75 text-right">
                            <div>{formatTimeWithMilliseconds(lyric.time)}</div>
                          </div>
                          <button
                            onClick={() => editLyric(lyric)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                            title="Edit lyric"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📝</div>
                <p>No chants yet. Add some below!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-mono">{formatTimeWithMilliseconds(currentTime)}</span>
            <div className="flex-1 bg-gray-600 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-200"
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                }}
              />
            </div>
            <span className="text-sm">{formatTimeWithMilliseconds(duration)}</span>
          </div>

          <div className="flex items-center space-x-4">
            {!isKaraokeMode ? (
              <>
                <button
                  onClick={togglePlayPause}
                  disabled={!isReady || !editData.youtubeId}
                  className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all duration-200 border-2 border-primary/30 hover:border-primary/50 disabled:border-gray-500 hover:shadow-lg hover:shadow-primary/20"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center space-x-6 flex-1">
                  <button
                    onClick={jumpToPreviousLyric}
                    disabled={!editData.youtubeId || editData.lyrics.length === 0}
                    className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 border-2 border-primary/30 hover:border-primary/50 disabled:border-gray-500 hover:shadow-lg hover:shadow-primary/20"
                    title="Jump to previous lyric"
                  >
                    <span>⏮️</span>
                    <span>Previous</span>
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    disabled={!isReady || !editData.youtubeId}
                    className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-200 text-xl border-2 border-primary/40 hover:border-primary/60 disabled:border-gray-500 hover:shadow-xl hover:shadow-primary/30 shadow-lg"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  
                  <button
                    onClick={jumpToNextLyric}
                    disabled={!editData.youtubeId || editData.lyrics.length === 0}
                    className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 border-2 border-primary/30 hover:border-primary/50 disabled:border-gray-500 hover:shadow-lg hover:shadow-primary/20"
                    title="Jump to next lyric"
                  >
                    <span>Next</span>
                    <span>⏭️</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!isKaraokeMode && (
        <div className="fixed bottom-6 left-6 right-6 bg-gray-800 rounded-lg shadow-2xl border border-gray-600 p-4 z-50">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <span className="text-white text-sm font-medium">Add Lyric:</span>
            </div>
            
            <input
              type="text"
              value={currentLyricText}
              onChange={(e) => setCurrentLyricText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (editingLyric) {
                    updateLyric()
                  } else {
                    addLyric()
                  }
                }
              }}
              placeholder={editingLyric ? "Edit lyric text..." : "Type lyric text and press Add..."}
              className={`flex-1 p-3 rounded-lg focus:ring-2 focus:outline-none text-lg transition-all duration-200 border-2 ${
                editingLyric
                  ? 'bg-primary/10 text-white focus:ring-primary/50 border-primary/30 focus:border-primary/60'
                  : 'bg-gray-700 text-white focus:ring-primary/50 border-gray-600 hover:border-gray-500 focus:border-primary/40'
              }`}
            />
            
            {editingLyric ? (
              <div className="flex space-x-2">
                <button
                  onClick={updateLyric}
                  disabled={!currentLyricText.trim()}
                  className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium border-2 border-primary/30 hover:border-primary/50 disabled:border-gray-500 hover:shadow-lg hover:shadow-primary/20"
                >
                  Update
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium border-2 border-gray-500 hover:border-gray-400 hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={addLyric}
                disabled={!currentLyricText.trim() || !editData.youtubeId}
                className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium border-2 border-primary/30 hover:border-primary/50 disabled:border-gray-500 hover:shadow-lg hover:shadow-primary/20"
              >
                Add
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <div className="text-sm text-gray-300">
              Current Time: <span className="font-mono text-primary">{formatTimeWithMilliseconds(currentTime)}</span>
            </div>
            {lyricStartTime !== null && (
              <div className="text-sm text-primary/80">
                Start Time: <span className="font-mono">{formatTimeWithMilliseconds(lyricStartTime)}</span>
              </div>
            )}
            {editingLyric && (
              <div className="text-sm text-primary/80">
                Editing: "{editingLyric.text.substring(0, 30)}{editingLyric.text.length > 30 ? '...' : ''}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}