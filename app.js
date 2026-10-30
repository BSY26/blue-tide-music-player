'use strict';

// 蓝潮播放器：音乐文件和 LRC 歌词均在本地浏览器中处理，不向网络上传。
const $ = (id) => document.getElementById(id);
const audio = $('audio');
const tracks = [];
const lyricsByName = new Map(); // basename -> File
let index = -1;
let repeatMode = 0; // 0: off, 1: all, 2: one
let shuffle = false;
let currentLyrics = [];
let activeLine = -1;
let toastTimer = null;

const audioExt = /\.(mp3|flac)$/i;
const lrcExt = /\.lrc$/i;
function basename(name) { return name.replace(/\.[^.]+$/, '').trim().toLocaleLowerCase(); }
function displayName(name) { return name.replace(/\.[^.]+$/, ''); }
function timeLabel(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const t = Math.floor(seconds);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}
function notify(message) {
  const el = $('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}
function renderTracks() {
  const list = $('track-list'); list.replaceChildren();
  $('track-count').textContent = `${tracks.length} 首`;
  $('library-empty').hidden = tracks.length !== 0;
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const item = document.createElement('li');
    const button = document.createElement('button'); button.type = 'button';
    button.className = `track${i === index ? ' active' : ''}`;
    button.setAttribute('aria-label', `播放 ${track.title}`);
    const num = document.createElement('span'); num.className = 'track-number'; num.textContent = i === index ? '♫' : String(i + 1).padStart(2, '0');
    const detail = document.createElement('span'); detail.className = 'track-detail';
    const title = document.createElement('span'); title.className = 'track-title'; title.style.display = 'block'; title.textContent = track.title;
    const sub = document.createElement('span'); sub.className = 'track-subtitle'; sub.style.display = 'block'; sub.textContent = track.format + (lyricsByName.has(track.key) ? ' · 有歌词' : ' · 无歌词');
    detail.append(title, sub); button.append(num, detail); item.append(button); list.append(item);
    button.addEventListener('click', () => loadTrack(i, true));
  }
}
function parseLrc(source) {
  const lines = [];
  let offset = 0;
  for (const raw of source.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const m = raw.match(/^\[offset:\s*([+-]?\d+)\]/i);
    if (m) { offset = Number(m[1]) / 1000; continue; }
    const stamps = [...raw.matchAll(/\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g)];
    if (!stamps.length) continue;
    const text = raw.replace(/\[\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?\]/g, '').trim();
    if (!text) continue;
    for (const stamp of stamps) {
      const fraction = stamp[3] || '';
      const frac = fraction ? Number(fraction) / Math.pow(10, fraction.length) : 0;
      const second = Number(stamp[1]) * 60 + Number(stamp[2]) + frac + offset;
      lines.push({time: Math.max(0, second), text});
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}
async function loadLyricsForTrack() {
  activeLine = -1;
  const element = $('lyrics-container'); element.replaceChildren();
  currentLyrics = [];
  if (index === -1 || !lyricsByName.has(tracks[index].key)) {
    showLyricsPlaceholder('还没有对应歌词', '导入与当前歌曲同名的 .lrc 文件'); return;
  }
  const currentIndex = index;
  const file = lyricsByName.get(tracks[index].key);
  try {
    const raw = await file.arrayBuffer();
    const codec = $('encoding').value;
    const text = new TextDecoder(codec, {fatal: false}).decode(raw);
    if (currentIndex !== index || lyricsByName.get(tracks[index].key) !== file) return;
    currentLyrics = parseLrc(text);
    if (!currentLyrics.length) {
      showLyricsPlaceholder('未识别到时间标签', 'LRC 每行示例：[00:15.20]一句歌词'); return;
    }
    const fragment = document.createDocumentFragment();
    currentLyrics.forEach((line, i) => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'lyric-line'; button.textContent = line.text;
      button.title = `跳转至 ${timeLabel(line.time)}`;
      button.addEventListener('click', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(line.time, audio.duration); syncLyrics(); });
      fragment.append(button);
    });
    element.append(fragment); syncLyrics();
  } catch (error) {
    showLyricsPlaceholder('读取歌词失败', '请确认歌词文件可读，并重新选择');
    notify(`歌词解码失败：${error.message}`);
  }
}
function showLyricsPlaceholder(title, subtitle) {
  $('lyrics-container').replaceChildren();
  const p = document.createElement('p'); p.className = 'lyric-placeholder'; p.textContent = title;
  const span = document.createElement('span'); span.textContent = subtitle; p.append(span); $('lyrics-container').append(p);
}
function syncLyrics() {
  if (!currentLyrics.length) return;
  const t = audio.currentTime;
  let lo = 0, hi = currentLyrics.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (currentLyrics[mid].time <= t) lo = mid + 1; else hi = mid; }
  const now = lo - 1;
  if (now === activeLine) return;
  const buttons = $('lyrics-container').querySelectorAll('.lyric-line');
  if (activeLine >= 0 && buttons[activeLine]) buttons[activeLine].classList.remove('active');
  activeLine = now;
  if (now >= 0 && buttons[now]) {
    buttons[now].classList.add('active');
    buttons[now].scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
  }
}
async function play() {
  if (index === -1) return;
  try { await audio.play(); }
  catch (err) { notify('此文件无法播放。请检查浏览器是否支持该音频编码，尤其是 FLAC。'); }
}
async function loadTrack(nextIndex, startPlaying = false) {
  if (nextIndex < 0 || nextIndex >= tracks.length) return;
  index = nextIndex;
  audio.src = tracks[index].url;
  audio.load();
  $('now-title').textContent = tracks[index].title;
  $('now-subtitle').textContent = `${tracks[index].format} · 本地文件`;
  $('play-btn').disabled = false;
  $('seek').disabled = false;
  $('seek').value = '0'; $('current-time').textContent = '0:00'; $('total-time').textContent = '0:00';
  currentLyrics = []; activeLine = -1;
  renderTracks(); await loadLyricsForTrack();
  if (startPlaying) await play();
}
function togglePlay() { if (index === -1) return; if (audio.paused) play(); else audio.pause(); }
function pickNext(direction) {
  if (!tracks.length) return;
  if (shuffle && tracks.length > 1 && direction > 0) {
    let pick = index; while (pick === index) pick = Math.floor(Math.random() * tracks.length);
    loadTrack(pick, true); return;
  }
  let n = index + direction;
  if (n < 0 || n >= tracks.length) {
    if (repeatMode === 1 || direction < 0) n = (n + tracks.length) % tracks.length;
    else { audio.pause(); audio.currentTime = 0; return; }
  }
  loadTrack(n, true);
}
async function importFiles(fileList) {
  const files = [...fileList];
  const music = files.filter(f => audioExt.test(f.name));
  const lrc = files.filter(f => lrcExt.test(f.name));
  let added = 0;
  for (const file of music) {
    const key = basename(file.name);
    tracks.push({file, key, title: displayName(file.name), format: file.name.split('.').pop().toUpperCase(), url: URL.createObjectURL(file)});
    added++;
  }
  for (const file of lrc) lyricsByName.set(basename(file.name), file);
  if (added && index === -1) await loadTrack(0, false);
  else { renderTracks(); if (index !== -1) await loadLyricsForTrack(); }
  notify(added || lrc.length ? `已导入 ${added} 首歌曲、${lrc.length} 个歌词文件` : '请选择 .mp3、.flac 或 .lrc 文件');
}
function clearLibrary() {
  audio.pause(); audio.removeAttribute('src'); audio.load();
  for (const track of tracks) URL.revokeObjectURL(track.url);
  tracks.length = 0; lyricsByName.clear(); index = -1; currentLyrics = []; activeLine = -1;
  $('now-title').textContent = '等待一首歌'; $('now-subtitle').textContent = '从本地音乐开始你的蓝潮之旅';
  $('current-time').textContent = '0:00'; $('total-time').textContent = '0:00';
  $('seek').value = '0'; $('seek').disabled = true; $('play-btn').disabled = true;
  showLyricsPlaceholder('听见海潮，等待歌词。', '选择同名 .lrc 文件后将同步高亮。');
  renderTracks(); notify('播放列表已清空');
}

$('drop-zone').addEventListener('click', () => $('file-input').click());
$('drop-zone').addEventListener('keydown', e => { if (e.target === $('drop-zone') && (e.key === 'Enter' || e.key === ' ')) {e.preventDefault(); $('file-input').click();} });
$('file-input').addEventListener('change', e => {importFiles(e.target.files); e.target.value = '';});
$('drop-zone').addEventListener('dragover', e => {e.preventDefault(); $('drop-zone').classList.add('dragover');});
$('drop-zone').addEventListener('dragleave', () => $('drop-zone').classList.remove('dragover'));
$('drop-zone').addEventListener('drop', e => {e.preventDefault(); $('drop-zone').classList.remove('dragover'); importFiles(e.dataTransfer.files);});
$('lrc-button').addEventListener('click', () => $('lrc-input').click());
$('lrc-input').addEventListener('change', e => {importFiles(e.target.files); e.target.value = '';});
$('encoding').addEventListener('change', () => {if (index !== -1) loadLyricsForTrack();});
$('clear-btn').addEventListener('click', clearLibrary);
$('play-btn').addEventListener('click', togglePlay);
$('prev-btn').addEventListener('click', () => {if (audio.currentTime > 3) audio.currentTime = 0; else pickNext(-1);});
$('next-btn').addEventListener('click', () => pickNext(1));
$('shuffle-btn').addEventListener('click', () => { shuffle = !shuffle; $('shuffle-btn').setAttribute('aria-pressed', String(shuffle)); notify(shuffle ? '随机播放已开启' : '随机播放已关闭'); });
$('repeat-btn').addEventListener('click', () => {
  repeatMode = (repeatMode + 1) % 3;
  const modes = ['关闭', '列表循环', '单曲循环'];
  $('repeat-btn').title = `循环模式：${modes[repeatMode]}`;
  $('repeat-btn').setAttribute('aria-label', `循环模式：${modes[repeatMode]}`);
  $('repeat-btn').setAttribute('aria-pressed', String(repeatMode !== 0));
  $('repeat-btn').textContent = repeatMode === 2 ? '↺¹' : '↻'; notify(`循环模式：${modes[repeatMode]}`);
});
$('seek').addEventListener('input', () => {if (Number.isFinite(audio.duration)) audio.currentTime = audio.duration * Number($('seek').value) / 1000;});
$('volume').addEventListener('input', () => {audio.volume = Number($('volume').value) / 100; $('volume-label').textContent = `${$('volume').value}%`;});
audio.volume = .8;
audio.addEventListener('timeupdate', () => {
  $('current-time').textContent = timeLabel(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) $('seek').value = String(Math.round(audio.currentTime / audio.duration * 1000));
  syncLyrics();
});
audio.addEventListener('loadedmetadata', () => {$('total-time').textContent = timeLabel(audio.duration);});
audio.addEventListener('play', () => {$('play-btn').innerHTML = '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"></rect><rect x="14" y="4" width="5" height="16" rx="1"></rect></svg>'; $('play-btn').setAttribute('aria-label','暂停'); $('disc').classList.add('spinning');});
audio.addEventListener('pause', () => {$('play-btn').textContent = '▶'; $('play-btn').setAttribute('aria-label','播放'); $('disc').classList.remove('spinning');});
audio.addEventListener('ended', () => {if (repeatMode === 2) {audio.currentTime = 0; play();} else pickNext(1);});
audio.addEventListener('error', () => {if (index !== -1 && audio.src) notify('播放失败：当前浏览器可能不支持该音频文件或 FLAC 编码');});
document.addEventListener('keydown', e => {
  const target = e.target;
  if (['INPUT','TEXTAREA','SELECT','BUTTON'].includes(target.tagName) || target.isContentEditable) return;
  if (e.code === 'Space') {e.preventDefault(); togglePlay();}
  if (e.code === 'ArrowLeft' && index !== -1) {e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 5);}
  if (e.code === 'ArrowRight' && index !== -1 && Number.isFinite(audio.duration)) {e.preventDefault(); audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);}
});
window.addEventListener('beforeunload', () => {for (const track of tracks) URL.revokeObjectURL(track.url);});
renderTracks();
