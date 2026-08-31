(() => {
  const canvas = document.querySelector('[data-waveform]');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const barCount = 56;
  const layerScales = [1, 0.66, 0.42];
  const layerSpeeds = [1, 1.34, 0.78];
  const colors = ['#0A84FF', '#BF5AF2', '#FF375F', '#FF9F0A', '#0A84FF'];
  let width = 0;
  let height = 0;
  let playing = false;
  let frame = 0;
  let lastTime = performance.now();
  let level = reducedMotion ? 0.7 : 0.03;
  let spectrum = reducedMotion ? 0.78 : 0.08;
  let springLevel = level;
  let springVelocity = 0;
  let kick = reducedMotion ? 0.45 : 0;
  let mode = 'idle';
  let modeEndsAt = lastTime + 2400;
  let pulseAt = lastTime + 2200;
  let pulseEnergy = 0;
  let randomState = 0x41c64e6d;

  const random = () => {
    randomState = (1664525 * randomState + 1013904223) >>> 0;
    return randomState / 4294967296;
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const approach = (current, target, rate, dt) => current + (target - current) * (1 - Math.exp(-rate * dt));

  function resize() {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(reducedMotion ? 12.4 : performance.now() / 1000);
  }

  function advanceDriver(now, dt) {
    if (now >= modeEndsAt) {
      mode = mode === 'idle' ? 'speech' : 'idle';
      modeEndsAt = now + (mode === 'idle' ? 2000 + random() * 2000 : 2000 + random() * 1000);
      if (mode === 'speech') pulseAt = now;
    }
    if (mode === 'speech' && now >= pulseAt) {
      const onsetStrength = 0.3 + random() * 0.7;
      pulseEnergy = Math.max(pulseEnergy, 0.3 + onsetStrength * 0.7);
      kick = Math.max(kick, 0.55 + onsetStrength * 0.45);
      pulseAt = now + 120 + random() * 230;
    }
    pulseEnergy *= Math.exp(-6.9 * dt);
    kick *= Math.exp(-4 * dt);
    const target = mode === 'speech'
      ? 0.1 + pulseEnergy * 0.82
      : 0.018 + 0.016 * (0.5 + 0.5 * Math.sin(now * 0.0017));
    level = approach(level, clamp(target, 0, 1), target > level ? 19 : 5.5, dt);
    spectrum = approach(spectrum, clamp(target * 1.14, 0, 1), target > spectrum ? 24 : 7, dt);
    springVelocity += (level - springLevel) * 150 * dt;
    springVelocity *= Math.exp(-14 * dt);
    springLevel = clamp(springLevel + springVelocity * dt, 0, 1);
  }

  function mixColor(position) {
    const p = ((position % 1) + 1) % 1;
    const scaled = p * (colors.length - 1);
    const index = Math.floor(scaled);
    const amount = scaled - index;
    const start = colors[index];
    const end = colors[index + 1];
    const hex = (value) => parseInt(value, 16);
    const r = Math.round(hex(start.slice(1, 3)) + (hex(end.slice(1, 3)) - hex(start.slice(1, 3))) * amount);
    const g = Math.round(hex(start.slice(3, 5)) + (hex(end.slice(3, 5)) - hex(start.slice(3, 5))) * amount);
    const b = Math.round(hex(start.slice(5, 7)) + (hex(end.slice(5, 7)) - hex(start.slice(5, 7))) * amount);
    return `${r}, ${g}, ${b}`;
  }

  function roundedBar(x, y, barWidth, barHeight) {
    const radius = Math.min(barWidth / 2, barHeight / 2);
    context.beginPath();
    context.roundRect(x, y, barWidth, barHeight, radius);
    context.fill();
  }

  function draw(time) {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    const inset = width * 0.08;
    const stripWidth = width - inset * 2;
    const pitch = stripWidth / barCount;
    const coreWidth = Math.max(1.2, pitch * 0.42);
    const centerY = height / 2;
    const voiceHalfHeight = height * 0.4;
    const stub = height * 0.03;
    const travelBase = 2.8 + level * 3.4;

    for (let layer = 0; layer < layerScales.length; layer += 1) {
      const travel = time * travelBase * layerSpeeds[layer];
      for (let index = 0; index < barCount; index += 1) {
        const xPosition = (index + 0.5) / barCount;
        const phase = xPosition * Math.PI * 2;
        const clusters = 0.47
          + 0.23 * Math.sin(phase * 23 - travel)
          + 0.18 * Math.sin(phase * 38 + travel * 1.09 + layer * 0.7)
          + 0.12 * Math.sin(phase * 61 - travel * 1.61 + layer * 1.1);
        const shape = clamp(clusters, 0.06, 1);
        const ambient = 0.02 * (0.5 + 0.5 * Math.sin(phase * 7 + time * 0.8));
        const activity = clamp(level * 0.3 + spectrum * 0.45 + springLevel * 0.15 + kick * 0.3, 0, 1);
        const halfHeight = Math.min(height * 0.44, stub + ambient + voiceHalfHeight * activity * shape * layerScales[layer]);
        const barHeight = Math.max(2, halfHeight * 2);
        const x = inset + index * pitch + (pitch - coreWidth) / 2;
        const y = centerY - barHeight / 2;
        const rgb = mixColor(xPosition + time * 0.022 + layer * 0.14);
        const haloAlpha = 0.05 + level * 0.05 + kick * 0.03;
        const coreAlpha = 0.3 + level * 0.26 + kick * 0.1;
        context.fillStyle = `rgba(${rgb}, ${haloAlpha})`;
        roundedBar(x - coreWidth * 0.9, centerY - barHeight / 2, coreWidth * 2.8, barHeight);
        context.fillStyle = `rgba(${rgb}, ${coreAlpha})`;
        roundedBar(x, y, coreWidth, barHeight);
      }
    }
    context.globalCompositeOperation = 'source-over';
  }

  function animate(now) {
    if (!playing) return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    advanceDriver(now, dt);
    draw(now / 1000);
    frame = requestAnimationFrame(animate);
  }

  function setPlaying(next) {
    if (reducedMotion || next === playing) return;
    playing = next;
    if (playing) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
    }
  }

  const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.01 });
  observer.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  resize();
})();
