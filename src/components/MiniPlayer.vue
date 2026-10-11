<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: '背景音乐' },
  tracks: { type: Array, default: () => [] },
  docked: { type: Boolean, default: false },
  raised: { type: Boolean, default: false },
  suppressed: { type: Boolean, default: false },
})
const visible = ref(true)
const playerRef = ref(null)
const pinned = ref(false)
const dragging = ref(false)
const position = ref(null)
const audioRef = ref(null)
const isPlaying = ref(false)
const pending = ref(false)
const muted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.5)
const error = ref('')
const playbackModes = [
  { id: 'list', label: '列表播放', icon: 'i-lucide-list-music' },
  { id: 'single', label: '单曲循环', icon: 'i-lucide-repeat-1' },
  { id: 'random', label: '随机播放', icon: 'i-lucide-shuffle' },
]
const modeIndex = ref(0)
const trackIndex = ref(0)
const tracks = computed(() => props.tracks.length ? props.tracks : [{ src: props.src, title: props.title }])
const currentTrack = computed(() => tracks.value[trackIndex.value] || tracks.value[0])
const playbackMode = computed(() => playbackModes[modeIndex.value])
const nextMode = computed(() => playbackModes[(modeIndex.value + 1) % playbackModes.length])
const progress = computed(() => duration.value ? currentTime.value / duration.value * 100 : 0)
const canSeek = computed(() => duration.value > 0)
const timeLabel = computed(() => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`)
const playerPosition = computed(() => position.value
  ? { left: `${position.value.x}px`, top: `${position.value.y}px`, right: 'auto', bottom: 'auto' }
  : {})
let userPaused = false
let autoplayStarting = false
let removeEnableAudio
let scrollFrame = 0
let hidePlayerTimer = 0
let lastScrollY = 0
let dragStart

function holdPlayer() {
  window.clearTimeout(hidePlayerTimer)
  hidePlayerTimer = 0
}

function releasePlayer() {
  if (!props.suppressed && visible.value && !pinned.value && !dragging.value && !hidePlayerTimer) {
    hidePlayerTimer = window.setTimeout(() => {
      hidePlayerTimer = 0
      if (!pinned.value && !dragging.value && !playerRef.value?.contains(document.activeElement) && !playerRef.value?.matches(':hover'))
        visible.value = false
    }, 3000)
  }
}

watch(() => props.suppressed, (suppressed) => {
  holdPlayer()
  if (!suppressed)
    releasePlayer()
})

function revealPlayer() {
  if (props.suppressed)
    return
  holdPlayer()
  visible.value = true
  releasePlayer()
}

function handlePointerMove(event) {
  if (event.pointerType !== 'mouse' || props.suppressed || visible.value)
    return
  // 隐藏时保留布局尺寸，通过鼠标坐标唤回播放器，不用透明遮罩拦截页面操作。
  const rect = playerRef.value.getBoundingClientRect()
  if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom)
    revealPlayer()
}

function togglePinned() {
  pinned.value = !pinned.value
  visible.value = true
  holdPlayer()
  if (!pinned.value)
    releasePlayer()
}

function hidePlayer() {
  holdPlayer()
  visible.value = false
}

function constrainPosition(x, y) {
  const rect = playerRef.value.getBoundingClientRect()
  position.value = {
    x: Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)),
    y: Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)),
  }
}

function startDrag(event) {
  if (event.button !== 0 || event.target.closest('button, input, a, label'))
    return
  const rect = playerRef.value.getBoundingClientRect()
  dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top }
  dragging.value = true
  holdPlayer()
  playerRef.value.setPointerCapture(event.pointerId)
  event.preventDefault()
}

function moveDrag(event) {
  if (!dragging.value || event.pointerId !== dragStart.pointerId)
    return
  constrainPosition(dragStart.left + event.clientX - dragStart.x, dragStart.top + event.clientY - dragStart.y)
}

function endDrag(event) {
  if (!dragging.value || event.pointerId !== dragStart.pointerId)
    return
  dragging.value = false
  if (playerRef.value.hasPointerCapture(event.pointerId))
    playerRef.value.releasePointerCapture(event.pointerId)
  dragStart = null
  releasePlayer()
}

function handleResize() {
  if (position.value)
    constrainPosition(position.value.x, position.value.y)
}

function handlePageScroll() {
  cancelAnimationFrame(scrollFrame)
  scrollFrame = requestAnimationFrame(() => {
    const y = Math.max(window.scrollY, 0)
    const delta = y - lastScrollY
    lastScrollY = y
    if (props.suppressed)
      return
    if (delta > 2) {
      releasePlayer()
    }
    else if (delta < -2) {
      revealPlayer()
    }
  })
}

async function startAutoplay() {
  const audio = audioRef.value
  if (!audio || userPaused || pending.value || autoplayStarting || !audio.paused)
    return
  autoplayStarting = true
  audio.volume = volume.value
  try {
    audio.muted = false
    muted.value = false
    await audio.play()
    removeEnableAudio?.()
  }
  catch (cause) {
    if (cause.name === 'NotAllowedError') {
      // 延续老组件的静音自动播放兜底，首次真实交互后再开启声音。
      audio.muted = true
      muted.value = true
      try {
        await audio.play()
      }
      catch {
        error.value = '点击播放，开启背景音乐。'
      }
    }
    else {
      error.value = '音乐暂时无法播放，请点击播放重试。'
    }
  }
  finally {
    autoplayStarting = false
  }
}

async function enableAudio(event) {
  // 音乐控件由自己的点击处理，避免首次点击暂停时又被全局恢复播放。
  if (userPaused || event.target.closest?.('.music-block'))
    return
  const audio = audioRef.value
  audio.muted = false
  muted.value = false
  try {
    await audio.play()
    error.value = ''
    removeEnableAudio?.()
  }
  catch {
    // 若该交互没有解锁浏览器策略，保留监听以便下一次真实交互重试。
    audio.muted = true
    muted.value = true
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0)
    return '00:00'
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

async function togglePlay() {
  const audio = audioRef.value
  if (!audio || pending.value)
    return
  removeEnableAudio?.()
  if (!audio.paused) {
    userPaused = true
    audio.pause()
    return
  }
  pending.value = true
  userPaused = false
  audio.muted = false
  muted.value = false
  error.value = ''
  try {
    if (audio.ended) {
      if (playbackMode.value.id === 'list')
        trackIndex.value = 0
      await nextTick()
      audio.currentTime = 0
      syncTime()
    }
    // 出错后允许通过同一个播放按钮重新加载并重试。
    if (audio.error)
      audio.load()
    await audio.play()
  }
  catch {
    error.value = '音乐暂时无法播放，请点击播放重试。'
  }
  finally {
    pending.value = false
  }
}

function cyclePlaybackMode() {
  modeIndex.value = (modeIndex.value + 1) % playbackModes.length
}

async function handleEnded() {
  const audio = audioRef.value
  isPlaying.value = false
  syncTime()
  if (playbackMode.value.id === 'list' && trackIndex.value >= tracks.value.length - 1) {
    // 列表结束后阻止 canplay 和全局音频解锁监听再次自动播放。
    userPaused = true
    removeEnableAudio?.()
    return
  }
  const previousIndex = trackIndex.value
  if (playbackMode.value.id === 'random' && tracks.value.length > 1) {
    const candidate = Math.floor(Math.random() * (tracks.value.length - 1))
    trackIndex.value = candidate >= previousIndex ? candidate + 1 : candidate
  }
  else if (playbackMode.value.id === 'list') {
    trackIndex.value++
  }
  currentTime.value = 0
  if (trackIndex.value !== previousIndex)
    duration.value = 0
  pending.value = true
  try {
    await nextTick()
    audio.currentTime = 0
    await audio.play()
    error.value = ''
  }
  catch {
    error.value = '音乐暂时无法播放，请点击播放重试。'
  }
  finally {
    pending.value = false
  }
}

function syncTime() {
  const audio = audioRef.value
  if (!audio)
    return
  currentTime.value = audio.currentTime
  duration.value = Number.isFinite(audio.duration) ? audio.duration : 0
}

function seek(event) {
  if (canSeek.value) {
    audioRef.value.currentTime = duration.value * Number(event.target.value) / 100
    syncTime()
  }
}

function restart() {
  if (canSeek.value) {
    audioRef.value.currentTime = 0
    syncTime()
  }
}

function toggleMute() {
  removeEnableAudio?.()
  audioRef.value.muted = !audioRef.value.muted
  muted.value = audioRef.value.muted
}

function updateVolume(event) {
  volume.value = Number(event.target.value)
  audioRef.value.volume = volume.value
}

onMounted(() => {
  audioRef.value.volume = volume.value
  lastScrollY = Math.max(window.scrollY, 0)
  window.addEventListener('scroll', handlePageScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  document.addEventListener('pointerdown', enableAudio)
  document.addEventListener('keydown', enableAudio)
  removeEnableAudio = () => {
    document.removeEventListener('pointerdown', enableAudio)
    document.removeEventListener('keydown', enableAudio)
  }
  startAutoplay()
  releasePlayer()
})
onUnmounted(() => {
  cancelAnimationFrame(scrollFrame)
  holdPlayer()
  window.removeEventListener('scroll', handlePageScroll)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('pointermove', handlePointerMove)
  removeEnableAudio?.()
  audioRef.value?.pause()
})
</script>

<template>
  <div ref="playerRef" :inert="!visible || suppressed" :aria-hidden="!visible || suppressed" class="music-block" :class="{ 'is-docked': docked, 'is-near-footer': raised, 'is-dragging': dragging, 'is-hidden': !visible || suppressed }" :style="playerPosition" @pointerenter="holdPlayer" @pointerleave="releasePlayer" @focusin="holdPlayer" @focusout="releasePlayer" @pointerdown="startDrag" @pointermove="moveDrag" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="endDrag">
    <div class="music-player liquid-glass" role="group" aria-label="背景音乐播放器">
      <img class="album-art" :src="currentTrack.cover || '/scenery/music_cover.jpg'" alt="" width="32" height="32" draggable="false">
      <div class="track-name">
        <strong>{{ currentTrack.title }}</strong><span>{{ muted && isPlaying ? '静音播放' : currentTrack.artist || 'RADWIMPS' }}</span>
      </div>
      <div class="transport">
        <button class="restart-button" :disabled="!canSeek" aria-label="从头重播" @click="restart">
          <i class="i-lucide-rotate-ccw" aria-hidden="true" />
        </button>
        <button class="play-button" :disabled="pending" :aria-pressed="isPlaying" :aria-label="`${isPlaying ? '暂停' : '播放'}${currentTrack.title}`" @click="togglePlay">
          <i :class="pending ? 'i-lucide-loader-circle' : isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" aria-hidden="true" />
        </button>
        <button class="pin-button" :class="{ 'is-pinned': pinned }" :aria-pressed="pinned" :aria-label="pinned ? '恢复自动隐藏' : '固定显示播放器'" :title="pinned ? '恢复自动隐藏' : '固定显示播放器'" @click="togglePinned">
          <i :class="pinned ? 'i-lucide-pin-off' : 'i-lucide-pin'" aria-hidden="true" />
        </button>
      </div>
      <div class="track-progress">
        <input type="range" min="0" max="100" step="0.1" :value="progress" :disabled="!canSeek" aria-label="播放进度" :aria-valuetext="timeLabel" @input="seek"><span>{{ timeLabel }}</span>
      </div>
      <div class="player-options">
        <button type="button" class="playback-mode" :aria-label="`播放模式，当前${playbackMode.label}，切换为${nextMode.label}`" :title="`点击切换为${nextMode.label}`" @click="cyclePlaybackMode">
          <i :class="playbackMode.icon" aria-hidden="true" /><span>播放模式</span><strong aria-live="polite">{{ playbackMode.label }}</strong>
        </button>
        <button type="button" class="hide-button" aria-label="隐藏播放器" title="隐藏播放器，上滑或悬浮原位置可重新显示" @click="hidePlayer">
          <i class="i-lucide-eye-off" aria-hidden="true" /><span>隐藏</span>
        </button>
      </div>
      <div class="volume-control">
        <button :aria-pressed="muted" :aria-label="muted ? '取消静音' : '静音'" @click="toggleMute">
          <i :class="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" aria-hidden="true" />
        </button><input :value="volume" type="range" min="0" max="1" step="0.01" aria-label="音量" @input="updateVolume">
      </div>
    </div>
    <p v-if="error" class="music-error" role="status">
      {{ error }}
    </p>
    <audio ref="audioRef" :src="currentTrack.src" preload="metadata" autoplay :loop="playbackMode.id === 'single'" @ended="handleEnded" @loadedmetadata="syncTime" @canplay="startAutoplay" @durationchange="syncTime" @timeupdate="syncTime" @play="isPlaying = true" @pause="isPlaying = false" @error="error = '音乐文件未能加载，请点击播放重试。'" />
  </div>
</template>

<style scoped>
.music-block {
  transition:
    opacity 320ms ease-in-out,
    visibility 0s;
}
.music-block.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 320ms ease-in-out,
    visibility 0s 320ms;
}
@media (min-width: 601px) {
  .music-block {
    left: auto;
    right: max(5vw, calc((100vw - 1296px) / 2));
  }
}
.music-block {
  width: min(340px, calc(100vw - 36px));
}
.music-block .music-player {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 104px;
  align-items: center;
  column-gap: 8px;
  row-gap: 8px;
  height: auto;
  padding: 14px;
  cursor: grab;
  touch-action: none;
}
.music-block.is-dragging .music-player {
  cursor: grabbing;
  user-select: none;
}
.music-player .pin-button.is-pinned {
  color: #a7e0ff;
  background: #7ebee82e;
  border-radius: 8px;
}
.music-player button,
.music-player input {
  touch-action: manipulation;
}
.music-player .album-art {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}
.music-player .track-name {
  width: auto;
  min-width: 0;
}
.music-player .track-name strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}
.music-player .track-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  margin-top: 1px;
}
.music-player .transport {
  justify-content: flex-end;
  gap: 4px;
}
.music-player .transport button {
  width: 28px;
  height: 32px;
  font-size: 14px;
}
.music-player .transport .play-button {
  width: 32px;
  height: 32px;
  font-size: 16px;
  background: #7288b645;
  border-color: #c1d6ff66;
}
.music-player .track-progress {
  grid-column: 1 / -1;
  flex-direction: row;
  margin: 0;
  gap: 8px;
  align-items: center;
}
.music-player .track-progress input {
  flex: 1;
  width: 0;
  height: 20px;
}
.music-player .track-progress span {
  font-size: 9px;
  white-space: nowrap;
}
.music-player .player-options {
  grid-column: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.music-player .playback-mode,
.music-player .hide-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0;
  color: #c3cee5;
  font-size: 10px;
  white-space: nowrap;
}
.music-player .playback-mode i,
.music-player .hide-button i {
  width: 14px;
  height: 14px;
}
.music-player .playback-mode strong {
  color: #dbe8ff;
  font-weight: 500;
}
.music-player .playback-mode:hover,
.music-player .hide-button:hover {
  color: #fff;
}
.music-player .hide-button {
  flex-shrink: 0;
  gap: 4px;
}
.music-player .volume-control {
  grid-column: 3;
  justify-content: flex-end;
  gap: 4px;
}
.music-player .volume-control button {
  width: 28px;
  height: 24px;
  font-size: 15px;
}
.music-player .volume-control input {
  position: static;
  width: 40px;
  height: 20px;
  padding: 0;
  opacity: 1;
  background: transparent;
}
.music-error {
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 11px;
  background: #18243df2;
}
@media (max-width: 600px) {
  .music-block {
    width: calc(100vw - 112px);
  }
  .music-player .track-progress span {
    display: none;
  }
  .music-block .music-player {
    padding: 12px;
  }
  .music-player .player-options {
    grid-column: 1 / -1;
    grid-row: 3;
  }
  .music-player .playback-mode {
    gap: 4px;
  }
  .music-player .track-progress {
    grid-column: 1 / 3;
  }
  .music-player .volume-control {
    grid-row: 2;
  }
}
</style>
