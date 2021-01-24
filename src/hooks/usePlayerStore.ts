import { StateSliderProps } from '@bit/jannikwienecke.personal.react-slider/dist/types'
import create from 'zustand'
import { immerMiddleware } from '../utils'

export type actionTypesPlayer =
  | 'pause'
  | 'play'
  | 'opt_pause'
  | 'opt_play'
  | 'opt_next_track'
  | 'opt_previous_track'
  | 'opt_track_change'
  | 'change'
  | 'songUpdate'
  | 'SUCCESS_PLAY'
  | 'SUCCESS_PAUSE'
  | 'SUCCESS_MS_CHANGE'
  | 'SUCCESS_NEXT_TRACK'
  | 'SUCCESS_PREVIOUS_TRACK'
  | 'track_change'
  | 'ms_change'
  | 'LOADING'
  | ''
export type Player = {
  IS_LOADING: boolean
  isPlaying: boolean
  playerCounter: number
  lastAction: actionTypesPlayer
  currentMs: number
  contextUri: string
  trackIdPrev: string | undefined
  firstTrackId: string
  setMs: (ms: number) => void
  setLoading: (isLoading: boolean) => void
  setTrackIdPrev: (id: string) => void
  setAction: (action: actionTypesPlayer) => void
  play: () => void
  pause: () => void
  updatePlayer: () => void
  setGetStateFunc: (func: () => StateSliderProps) => void
  getStateFunc: () => StateSliderProps
  track: SpotifyApi.CurrentPlaybackResponse | undefined
  nextTrack: SpotifyApi.TrackObjectFull | undefined
  setTrack: (track: SpotifyApi.CurrentPlaybackResponse | undefined) => void
  setContextUri: (contextUri: string) => void
  setNextTrack: (nextTrack: SpotifyApi.TrackObjectFull | undefined) => void
}

export const usePlayerStore = create<Player>(
  immerMiddleware(set => ({
    lastAction: '',
    isPlaying: false,
    playerCounter: 0,
    track: undefined,
    nextTrack: undefined,
    currentMs: 0,
    firstTrackId: '',
    IS_LOADING: false,
    getStateFunc: () => {},
    setGetStateFunc: func => set(state => void (state.getStateFunc = func)),
    setMs: ms => set(state => void (state.currentMs = ms)),
    setTrackIdPrev: trackIdPrev =>
      set(state => void (state.trackIdPrev = trackIdPrev)),
    setLoading: isLoading => set(state => void (state.IS_LOADING = isLoading)),
    setContextUri: contextUri =>
      set(state => void (state.contextUri = contextUri)),

    setAction: action => {
      if (
        [
          'SUCCESS_PLAY',
          'SUCCESS_PAUSE',
          'SUCCESS_MS_CHANGE',
          'SUCCESS_NEXT_TRACK',
          'SUCCESS_PREVIOUS_TRACK',
        ].includes(action)
      ) {
        set(state => void (state.IS_LOADING = false))
      }

      if (action === 'opt_play') {
        set(state => void (state.isPlaying = true))
      } else if (action === 'opt_pause') {
        set(state => void (state.isPlaying = false))
      } else if (action === 'opt_track_change') {
        set(state => void (state.trackIdPrev = state.track?.item?.id))
      }
      set(state => void (state.lastAction = action))
    },
    setTrack: track => {
      // ON FIRST - SET ID
      // need this to check if i can press previous track button
      set(
        state =>
          void (state.firstTrackId =
            state.firstTrackId || track?.item?.id || ''),
      )

      set(state => void (state.track = track))
      set(state => void (state.playerCounter += 1))
    },
    setNextTrack: nextTrack => {
      set(state => void (state.nextTrack = nextTrack))
    },
    play: () => {
      set(state => void (state.isPlaying = true))
    },
    pause: () => {
      set(state => void (state.isPlaying = false))
    },
    updatePlayer: () => set(state => void (state.playerCounter += 1)),
  })),
)
