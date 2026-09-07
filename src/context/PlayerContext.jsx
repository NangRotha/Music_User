import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

/* Playback speed options cycled by the speed button */
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const VOLUME_KEY = 'khmer_beats_volume';
const RATE_KEY = 'khmer_beats_playback_rate';

const readStoredNumber = (key, fallback) => {
  try {
    const val = parseFloat(localStorage.getItem(key));
    return Number.isFinite(val) ? val : fallback;
  } catch {
    return fallback;
  }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => readStoredNumber(VOLUME_KEY, 0.8));
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(() => {
    const rate = readStoredNumber(RATE_KEY, 1);
    return SPEEDS.includes(rate) ? rate : 1;
  });
  // Playback mode: 'off' | 'all' (repeat queue) | 'one' (repeat current)
  const [loopMode, setLoopMode] = useState('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const audioRef = useRef(null);
  const trackIdRef = useRef(null);

  // Lazily create the single shared <audio> element on first use. Calling
  // `useRef(new Audio())` would construct a brand-new element on EVERY render
  // (timeupdate re-renders happen constantly during playback).
  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const resolveUrl = (track) => track?.preview_audio_url || null;

  /**
   * Calls play() on the audio element and handles the returned promise.
   *
   * `token` is the id of the track this attempt belongs to. A rejection from a
   * *previous* attempt (e.g. play() was interrupted because the user already
   * skipped to another track, or a new src replaced the current one) is
   * ignored so it cannot paint a stale error over the track that is actually
   * playing now.
   */
  const safePlay = (audio, token) => {
    if (!audio) return;
    const promise = audio.play();
    if (!promise || typeof promise.catch !== 'function') return;
    promise.catch((e) => {
      // Expected whenever the user pauses / skips / changes src while play()
      // is still pending – not a real failure.
      if (e?.name === 'AbortError') return;
      if (token != null && token !== trackIdRef.current) return; // stale attempt
      console.log('Audio play error:', e);
      setIsLoading(false);
      setIsPlaying(false);
      setError(e?.message || 'Playback failed');
    });
  };

  /** Loads a new track into the player and starts playback. */
  const startTrack = (track, list, index) => {
    if (!track) return;
    const url = resolveUrl(track);
    setQueue(list);
    setCurrentIndex(index);
    setCurrentTrack(track);
    trackIdRef.current = track.id;
    setError(null);

    const audio = getAudio();
    if (!url) {
      setIsLoading(false);
      setIsPlaying(false);
      setError('No preview audio available for this track.');
      return;
    }
    audio.src = url;
    audio.load();
    setIsLoading(true);
    setIsPlaying(true);
    safePlay(audio, track.id);
  };

  /**
   * Plays a track.
   * - Same track toggles play / pause.
   * - Optional second argument (array) sets the playback queue so
   *   next / previous / auto-advance become available.
   */
  const playTrack = (track, queueList) => {
    if (!track) return;
    const audio = getAudio();
    const isSame = trackIdRef.current === track.id && currentTrack?.id === track.id;

    if (isSame) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Retry after a previous failure: if the element is still in an
        // errored state, force a reload so retry doesn't silently no-op.
        if (audio.error) {
          const retryUrl = resolveUrl(currentTrack);
          if (retryUrl && audio.src !== retryUrl) audio.src = retryUrl;
          audio.load();
        }
        setError(null);
        setIsLoading(false);
        setIsPlaying(true);
        safePlay(audio, currentTrack?.id);
      }
      return;
    }

    const arr = Array.isArray(queueList) && queueList.length ? [...queueList] : [track];
    let idx = arr.findIndex((item) => item.id === track.id);
    if (idx === -1) {
      arr.unshift(track);
      idx = 0;
    }
    startTrack(track, arr, idx);
  };

  const pauseTrack = () => {
    getAudio()?.pause();
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    if (!currentTrack) return;
    const audio = getAudio();
    const url = resolveUrl(currentTrack);
    // Rebuild the source if the element has no usable source (e.g. after a
    // load failure or after closePlayer()) before attempting to play again.
    if (url && (!audio.src || audio.error)) {
      if (audio.src !== url) audio.src = url;
      audio.load();
    }
    setError(null);
    setIsLoading(false);
    setIsPlaying(true);
    safePlay(audio, currentTrack?.id);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const seek = (seconds) => {
    const audio = getAudio();
    const value = clamp(Number(seconds) || 0, 0, duration || 0);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  /** Jumps forward / backward by a relative amount (e.g. skip(10), skip(-10)). */
  const skip = (delta) => {
    const audio = getAudio();
    const target = clamp((audio.currentTime || 0) + (Number(delta) || 0), 0, duration || 0);
    audio.currentTime = target;
    setCurrentTime(target);
  };

  /** Random index that differs from the given one (used by shuffle). */
  const randomNextIndex = (exclude) => {
    const n = queue.length;
    if (n <= 1) return null;
    // No valid current track (e.g. currentIndex === -1): pick any track.
    if (exclude == null || exclude < 0) return Math.floor(Math.random() * n);
    if (n === 2) return exclude === 0 ? 1 : 0;
    let r;
    do {
      r = Math.floor(Math.random() * n);
    } while (r === exclude);
    return r;
  };

  const playIndex = (index) => {
    if (!queue.length) return;
    const safeIndex = clamp(index, 0, queue.length - 1);
    startTrack(queue[safeIndex], queue, safeIndex);
  };

  /** Next track. Manual navigation always wraps to the start of the queue. */
  const playNext = () => {
    if (!queue.length) return;
    if (queue.length === 1) {
      seek(0);
      return;
    }
    const base = currentIndex >= 0 ? currentIndex : -1;
    const idx = isShuffle
      ? randomNextIndex(base)
      : (base + 1) % queue.length;
    if (idx != null) playIndex(idx);
  };

  /** Previous track. Restarts the track first if more than 3 seconds in. */
  const playPrevious = () => {
    if (!queue.length) return;
    const audio = getAudio();
    if (audio && audio.currentTime > 3) {
      seek(0);
      return;
    }
    if (queue.length === 1) {
      seek(0);
      return;
    }
    const base = currentIndex >= 0 ? currentIndex : 0;
    const idx = (base - 1 + queue.length) % queue.length;
    playIndex(idx);
  };

  /**
   * Replaces the whole playback queue.
   * setPlayQueue(tracks)             -> replace and start playing from index 0
   * setPlayQueue(tracks, false)      -> just replace the queue, don't autoplay
   * setPlayQueue(tracks, true, i)    -> replace and start at index i
   */
  const setPlayQueue = (tracks, autoplay = true, startIndex = 0) => {
    if (!Array.isArray(tracks)) return;
    const arr = tracks.filter((t) => t && t.id);
    if (!arr.length) return;
    const index = clamp(startIndex, 0, arr.length - 1);
    if (!autoplay) {
      setQueue(arr);
      setCurrentIndex(index);
      return;
    }
    startTrack(arr[index], arr, index);
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
  };

  /** Behaviour when a track finishes: repeat-one / auto-next / stop. */
  const handleTrackEnded = () => {
    if (!currentTrack) return;

    if (loopMode === 'one') {
      const audio = getAudio();
      audio.currentTime = 0;
      setIsLoading(true);
      safePlay(audio, currentTrack?.id);
      return;
    }

    // Repeat-all with a single-track queue should loop that one track
    if (loopMode === 'all' && queue.length === 1) {
      const audio = getAudio();
      audio.currentTime = 0;
      setIsLoading(true);
      safePlay(audio, currentTrack?.id);
      return;
    }

    const n = queue.length;
    if (n > 1) {
      let next = null;
      if (isShuffle) {
        next = randomNextIndex(currentIndex);
      } else if (currentIndex < n - 1) {
        next = currentIndex + 1;
      } else if (loopMode === 'all') {
        next = 0; // wrap back to the beginning of the queue
      }
      if (next !== null) {
        playIndex(next);
        return;
      }
    }

    setCurrentTime(0);
    setIsPlaying(false);
  };

  const cycleLoopMode = () => {
    setLoopMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const closePlayer = () => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setCurrentTrack(null);
    trackIdRef.current = null;
  };

  const setVolume = (value) => setVolumeState(clamp(Number(value) || 0, 0, 1));

  const setPlaybackRateValue = (value) => {
    const rate = clamp(Number(value) || 1, 0.5, 2.5);
    setPlaybackRateState(SPEEDS.includes(rate) ? rate : 1);
  };

  const cyclePlaybackRate = () => {
    const i = SPEEDS.indexOf(playbackRate);
    const next = SPEEDS[(i + 1) % SPEEDS.length];
    setPlaybackRateState(next);
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  // Keep React state in sync with the underlying <audio> element
  useEffect(() => {
    const audio = getAudio();

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onBuffering = () => setIsLoading(true);
    const onStarted = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const onPaused = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Failed to load this preview. Please try another track.');
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('waiting', onBuffering);
    audio.addEventListener('playing', onStarted);
    audio.addEventListener('play', onStarted);
    audio.addEventListener('pause', onPaused);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('waiting', onBuffering);
      audio.removeEventListener('playing', onStarted);
      audio.removeEventListener('play', onStarted);
      audio.removeEventListener('pause', onPaused);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []);

  // Volume + persistence
  useEffect(() => {
    const audio = getAudio();
    audio.volume = isMuted ? 0 : clamp(volume, 0, 1);
    try {
      localStorage.setItem(VOLUME_KEY, String(clamp(volume, 0, 1)));
    } catch {
      // ignore storage errors
    }
  }, [volume, isMuted]);

  // Playback rate + persistence
  useEffect(() => {
    const audio = getAudio();
    audio.playbackRate = clamp(playbackRate, 0.5, 2.5);
    try {
      localStorage.setItem(RATE_KEY, String(playbackRate));
    } catch {
      // ignore storage errors
    }
  }, [playbackRate]);

  // Auto-advance / repeat when a track ends
  useEffect(() => {
    const audio = getAudio();
    const onEnded = () => handleTrackEnded();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, loopMode, isShuffle, queue, currentIndex]);

  // Media Session API: lock-screen / OS media keys / metadata
  useEffect(() => {
    if (!('mediaSession' in window.navigator)) return;
    const mediaSession = window.navigator.mediaSession;
    try {
      if (currentTrack) {
        const title = currentTrack.title_en || currentTrack.title_kh || 'KhmerBeats';
        const artist = currentTrack.artist_en || currentTrack.artist_kh || '';
        const artwork = currentTrack.cover_image_url
          ? [{ src: currentTrack.cover_image_url, sizes: '512x512', type: 'image/jpeg' }]
          : [];
        if (typeof window.MediaMetadata !== 'undefined') {
          mediaSession.metadata = new window.MediaMetadata({ title, artist, album: 'KhmerBeats', artwork });
        }
      } else {
        mediaSession.metadata = null;
      }

      // Register each action individually so that an action unsupported on
      // the current platform (e.g. seekto on some browsers) doesn't prevent
      // the remaining handlers from being registered.
      const setAction = (action, handler) => {
        try {
          mediaSession.setActionHandler(action, handler);
        } catch {
          // action not supported here – skip it
        }
      };
      setAction('play', () => resumeTrack());
      setAction('pause', () => pauseTrack());
      setAction('previoustrack', () => playPrevious());
      setAction('nexttrack', () => playNext());
      setAction('seekbackward', () => skip(-10));
      setAction('seekforward', () => skip(10));
      setAction('seekto', (details) => {
        if (details && details.seekTime != null) seek(details.seekTime);
      });
      try {
        mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch {
        // ignore
      }
    } catch {
      // Media Session API is optional – ignore browsers that don't support it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, isPlaying]);

  return (
    <PlayerContext.Provider
      value={{
        // Playback state
        currentTrack,
        isPlaying,
        isLoading,
        error,
        currentTime,
        duration,

        // Preferences / modes
        volume,
        isMuted,
        playbackRate,
        loopMode,
        isShuffle,

        // Queue state
        queue,
        currentIndex,

        // Transport
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        seek,
        skip,
        closePlayer,

        // Queue controls
        setPlayQueue,
        clearQueue,
        playNext,
        playPrevious,
        playIndex,

        // Settings
        setVolume,
        toggleMute,
        setPlaybackRate: setPlaybackRateValue,
        cyclePlaybackRate,
        cycleLoopMode,
        toggleShuffle
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
