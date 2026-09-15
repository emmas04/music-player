import { useState, useRef, useEffect } from 'react'
import vinylImage from './images/vinyl.png' 
import turntableBase from './images/turntable-base.png'
import needleImage1 from './images/turntable-needle1.png'
import needleImage2 from './images/turntable-needle2.png'
import pressStart2P from './fonts/PressStart2P-Regular.ttf'
import montserrat from './fonts/Montserrat-Regular.ttf'
import montserratItalic from './fonts/Montserrat-Italic.ttf'

function App() {
  const [playlist, setPlaylist] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [needleFrame, setNeedleFrame] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  // Load the playlist.json when the app first starts
  useEffect(() => {
    fetch('./songs/playlist.json')
      .then((res) => res.json())
      .then((data) => setPlaylist(data))
      .catch((err) => console.error('Failed to load playlist:', err))
  }, [])

  // When song is playing, animate the needle
    useEffect(() => {
    if (!isPlaying) {
      setNeedleFrame(1)
      return
    }

    const interval = setInterval(() => {
      setNeedleFrame((prev) => (prev === 1 ? 2 : 1))
    }, 500)

    return () => clearInterval(interval)
  }, [isPlaying])

  const currentSong = playlist[currentIndex]

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  function nextSong() {
    setCurrentIndex((prev) => (prev + 1) % playlist.length)
    setIsPlaying(true)
  }

  function prevSong() {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
    setIsPlaying(true)
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Whenever the song changes, if we were playing, keep playing the new one
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play()
    }
  }, [currentIndex])

  if (playlist.length === 0) {
    return <div><h1>Loading playlist...</h1></div>
  }

  return (
    <div>
      <style>{`
        :root {
          --bg-darkest: #181425;
          --bg-panel: #2A1A2E;
          --purple-mid: #4A2C4F;
          --purple-dusty: #7A4B6B;
          --pink-soft: #C97B93;
          --pink-pale: #EAA9BB;
          --accent-coral: #F6757A;
          --accent-red: #E43B44;
          --blue-gray: #5A6988;
          --blue-gray-light: #8B9BB4;
        }

        @font-face {
          font-family: 'Press Start 2P';
          src: url(${pressStart2P}) format('truetype');
        }
        @font-face {
          font-family: 'Montserrat';
          src: url(${montserrat}) format('truetype');
        }

        @font-face {
          font-family: 'Montserrat';
          src: url(${montserratItalic}) format('truetype');
          font-style: italic;
        }

        body {
          background-color: var(--bg-darkest);
          color: var(--blue-gray);
          font-family: 'Montserrat', sans-serif;
          font-size: 16px;
        }

        h1 {
          color: var(--blue-gray-light);
          font-family: 'Press Start 2P', sans-serif;
          font-size: 20px;
        }

        h2 {
          color: var(--blue-gray-light);
          font-family: 'Press Start 2P', sans-serif;
          font-size: 16px;
          }

        p {
          color: var(--blue-gray);
          font-family: 'Press Start 2P', sans-serif;
          font-size: 10px;
        }

        .player-button {
          background-color: var(--blue-gray);
          color: var(--bg-darkest);
          border: 2px solid var(--blue-gray);
          padding: 10px 16px;
          margin: 0 5px;
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
        }

        .player-button:hover {
          background-color: var(--blue-gray-light);
        }

        input[type="range"] {
          accent-color: var(--accent-red);
        }
      `}</style>

      <h1 style={{ marginBottom: '-25px' }}>
         Music Player <span style={{ fontSize: '1.5em' }}>&#x1F493;</span>
      </h1>
        <div
        style={{
          position: 'relative',
          width: '256px',
          height: '256px',
          margin: '0 auto',
        }}
      >
        <img
          src={turntableBase}
          alt="Turntable base"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '256px',
            imageRendering: 'pixelated',
          }}
        />
                <img
          src={vinylImage}
          alt="Vinyl record"
          style={{
            position: 'absolute',
            top: 64,
            left: 64,
            width: '128px',
            imageRendering: 'pixelated',
          }}
        />
                <img
          src={needleFrame === 1 ? needleImage1 : needleImage2}
          alt="Needle"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '256px',
            imageRendering: 'pixelated',
          }}
        />
      </div>
      <h2 style={{ marginTop: '-30px' }}>{currentSong.title}</h2>
      <p>{currentSong.artist}</p>

      <audio
        ref={audioRef}
        src={`./songs/${currentSong.file}`}
        onEnded={nextSong}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
      />

            <div>
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={(e) => {
            audioRef.current.currentTime = e.target.value
            setCurrentTime(e.target.value)
          }}
          style={{ margin: '0 10px', width: '200px' }}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <button className="player-button" onClick={prevSong}>Previous</button>
      <button className="player-button" onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button className="player-button" onClick={nextSong}>Next</button>
    </div>
  )
}

export default App