import React from 'react'
import { useQueryClient } from 'react-query'
import { useCurrentPlayer } from './useCurrentPlayer'
import { useCurrentSong } from './useCurrentSong'
import { useHandlePlayerChanges } from './useHandlePlayerChanges'
import { useLocalDeviceStore } from './useLocalDeviceStore'
import { useNext } from './useNextSong'
import { usePause } from './usePause'
import { usePlay } from './usePlay'
import { usePlayerStore } from './usePlayerStore'
import { usePlayPrevious } from './usePlayPrevious'
import { useQueueStore } from './useQueueStore'
import { useValidMutation } from './useValidMutation'

export const useSpotifyPlayer = () => {
  const { data: currentSong, refetch: fetchCurrentSong } = useCurrentSong()
  useCurrentPlayer()
  const { queue, getNextElement } = useQueueStore()
  const {
    play,
    pause,
    setTrack,
    getStateFunc,
    setAction,
    track,
  } = usePlayerStore()
  const { play: playSongs, status: statusPlaySong } = usePlay()
  const { pause: pauseSong, status: statusPauseSong } = usePause()
  const { playNextSong, status: statusPlayNextSong } = useNext()
  const { playPreviousTrack, status: statusPlayPreviouSong } = usePlayPrevious()
  const { deviceIsReady } = useLocalDeviceStore()
  const queryClient = useQueryClient()
  const handleClickPlay = () => {
    pauseRef.current = false

    if (currentSong) {
      const msSinceLastUpdate = getStateFunc().currentMsSong
      playSongs([currentSong.item!.uri!], msSinceLastUpdate)
    } else if (queue.length > 0) {
      const newSong = getNextElement(queue, currentSong)
      newSong && playSongs([newSong.uri])
    } else {
      playNextSong()
    }

    play()
  }

  useValidMutation(statusPlayNextSong, () => {
    playSongs()
  })

  // WHENEVER A SUCCESSFULL CHANGE TO THE PLAYER HAPPENS
  // TAkE ACTIONS
  useHandlePlayerChanges(
    {
      statusPauseSong,
      statusPlayNextSong,
      statusPlayPreviouSong,
      statusPlaySong,
    },
    fetchCurrentSong,
  )

  const pauseRef = React.useRef(false)
  const handleClickPause = () => {
    setAction('pause')
    pause()
    pauseSong()
    pauseRef.current = true
    setTimeout(() => {
      pauseRef.current = false
    }, 3000)
  }

  const handleClickNext = () => {
    playNextSong()
    setAction('change')
  }

  const handleClickPrevious = () => {
    playPreviousTrack()
    setAction('change')
  }

  const hasCurrentSongRef = React.useRef<boolean>(false)
  React.useEffect(() => {
    if (pauseRef.current) {
      return
    }

    if (currentSong) {
      hasCurrentSongRef.current = true
      clearInterval(intervalRef.current)
      intervalRef.current = 0
    }
  }, [currentSong])

  React.useEffect(() => {
    if (!deviceIsReady) return

    if (currentSong?.is_playing) {
      play()
    } else {
      pause()
    }
  }, [track])

  React.useEffect(() => {
    // TODO - WENN CLICk on SONG IN SONGLIST - UPDATE THE SLIDER IMMEDIALY
    console.log('song update in use effect...')

    setAction('songUpdate')
    setTrack(currentSong)
  }, [currentSong])

  const intervalRef = React.useRef<number>()
  React.useEffect(() => {
    if (!deviceIsReady) return
    if (!intervalRef.current) return

    window.setTimeout(() => {
      if (!hasCurrentSongRef.current) {
        playNextSong()
      }
      clearInterval(intervalRef.current)
      intervalRef.current = 0
    }, 800)
  }, [deviceIsReady])

  const fetchCurrentSong_ = () => {
    intervalRef.current = window.setInterval(async () => {
      await queryClient.invalidateQueries({}, { throwOnError: true })
      fetchCurrentSong()
    }, 100)
  }

  React.useEffect(() => {
    fetchCurrentSong_()
  }, [])

  return {
    handleClickPlay,
    handleClickPause,
    handleClickNext,
    handleClickPrevious,
    fetchCurrentSong,
    queue,
  }
}
