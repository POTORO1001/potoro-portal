// Original 16-bar cafe waltz. Synthesized locally; no audio download or autoplay.
(() => {
  'use strict';
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  const toggle = document.getElementById('bgmToggle');
  const volume = document.getElementById('bgmVolume');
  const status = document.getElementById('bgmStatus');
  const notes = [
    [76,79,81,79,76,74], [72,76,79,76,74,72],
    [74,77,81,79,77,74], [71,74,79,77,74,71],
    [72,76,81,79,76,72], [69,72,77,76,72,69],
    [71,74,77,74,72,71], [72,76,79,76,72,null],
    [79,81,84,81,79,76], [77,79,81,79,76,72],
    [77,81,84,81,79,77], [79,77,74,71,74,null],
    [76,79,81,79,76,72], [74,77,81,77,74,72],
    [71,74,79,77,74,71], [72,76,79,76,72,null]
  ];
  const chords = [
    [48,55,64],[45,52,60],[50,57,65],[43,50,59],
    [45,52,60],[41,48,57],[43,50,59],[48,55,64],
    [48,55,64],[45,52,60],[41,48,57],[43,50,59],
    [45,52,60],[50,57,65],[43,50,59],[48,55,64]
  ];
  let context, master, interval;
  let playing = false;
  let step = 0;
  let nextTime = 0;
  let request = 0;
  const voices = new Set();
  const eighth = 60 / 92 / 2;
  const level = () => Math.pow(Number(volume.value) / 100, 1.5) * 0.65;
  function tone(midi, time, duration, loudness, type) {
    if (midi === null) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(loudness, time + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope);
    envelope.connect(master);
    voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }
  function schedule() {
    if (!playing || context.state !== 'running') return;
    // Keep a short audio-clock lookahead so UI work cannot interrupt the beat.
    while (nextTime < context.currentTime + 0.18) {
      if (nextTime < context.currentTime) nextTime = context.currentTime + 0.03;
      const bar = Math.floor(step / 6) % notes.length;
      const beat = step % 6;
      tone(notes[bar][beat], nextTime, 0.75, 0.22, 'sine');
      if (beat % 2 === 0) tone(chords[bar][beat / 2], nextTime, 1.15, 0.13, 'triangle');
      step = (step + 1) % (notes.length * 6);
      nextTime += eighth;
    }
  }
  function stop() {
    request++;
    playing = false;
    toggle.checked = false;
    clearInterval(interval);
    if (!context) return;
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0, now, 0.025);
    for (const voice of voices) { try { voice.stop(now + 0.12); } catch (_) { /* Already ended. */ } }
    // Suspend after the fade; a new user request cancels this pending suspension.
    const stoppedRequest = request;
    setTimeout(() => { if (request === stoppedRequest && !playing) context.suspend().catch(() => {}); }, 160);
  }
  toggle.addEventListener('change', async () => {
    status.textContent = '';
    if (!toggle.checked) { stop(); return; }
    const currentRequest = ++request;
    try {
      if (!context) {
        context = new AudioEngine();
        master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);
        context.addEventListener('statechange', () => {
          if (playing && context.state !== 'running') stop();
        });
      }
      await context.resume();
      if (currentRequest !== request || document.hidden) { if (currentRequest === request) stop(); return; }
      if (context.state !== 'running') throw new Error('Audio unavailable');
      playing = true;
      step = 0;
      nextTime = context.currentTime + 0.04;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(level(), context.currentTime, 0.08);
      schedule();
      clearInterval(interval);
      interval = setInterval(schedule, 60);
    } catch (_) {
      stop();
      status.textContent = 'BGMを再生できませんでした。もう一度お試しください。';
    }
  });
  volume.addEventListener('input', () => {
    document.getElementById('bgmVolumeValue').textContent = `${volume.value}%`;
    if (playing) master.gain.setTargetAtTime(level(), context.currentTime, 0.04);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  document.getElementById('lessonAudio').hidden = false;
  if (!AudioEngine) {
    toggle.disabled = true;
    volume.disabled = true;
    status.textContent = 'このブラウザではBGMをご利用いただけません。';
  }
})();
