(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const escapeHTML = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Spectrum used by the app's Classic Wave theme.
  const spectrum = ['#0A84FF', '#BF5AF2', '#FF375F', '#FF9F0A', '#0A84FF'];
  const hexRGB = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  function mixSpectrum(position) {
    const p = ((position % 1) + 1) % 1;
    const scaled = p * (spectrum.length - 1);
    const index = Math.floor(scaled);
    const amount = scaled - index;
    const a = hexRGB(spectrum[index]);
    const b = hexRGB(spectrum[index + 1]);
    return a.map((v, i) => Math.round(v + (b[i] - v) * amount)).join(', ');
  }

  // Canvas helpers ----------------------------------------------------------

  function fitCanvas(canvas) {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(box.width * ratio));
    canvas.height = Math.max(1, Math.round(box.height * ratio));
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { context, width: box.width, height: box.height };
  }

  // HUD theme renderers. Each draws one frame for a level between 0 and 1.

  const renderers = {
    classic() {
      const pattern = [18, 30, 44, 36, 58, 46, 72, 54, 84, 62, 92, 70, 100, 76, 88, 64, 94, 72, 80, 56, 68, 48, 60, 40, 50, 34, 42, 26, 34, 20, 14];
      return (ctx, w, h, t, level) => {
        ctx.globalCompositeOperation = 'lighter';
        const stripWidth = w * 0.7;
        const pitch = stripWidth / pattern.length;
        const barWidth = clamp(pitch * 0.42, 2.5, 5);
        const left = (w - stripWidth) / 2;
        for (let i = 0; i < pattern.length; i += 1) {
          const wobble = 0.55 + 0.45 * Math.sin(t * 8.3 + i * 0.85) * Math.sin(t * 3.1 + i * 0.37);
          const amount = 0.06 + level * 0.94 * wobble;
          const half = Math.max(1.5, h * 0.34 * (pattern[i] / 100) * amount);
          const x = left + i * pitch + (pitch - barWidth) / 2;
          const rgb = mixSpectrum(i / pattern.length + t * 0.03);
          ctx.fillStyle = `rgba(${rgb}, 0.16)`;
          roundRect(ctx, x - barWidth * 0.6, h / 2 - half, barWidth * 2.2, half * 2);
          ctx.fillStyle = `rgba(${rgb}, 0.85)`;
          roundRect(ctx, x, h / 2 - half, barWidth, half * 2);
        }
        ctx.globalCompositeOperation = 'source-over';
      };
    },

    glass() {
      return (ctx, w, h, t, level) => {
        const cy = h / 2;
        const left = w * 0.1;
        const right = w * 0.9;
        const amp = h * 0.3 * (0.05 + level * 0.95);
        const blobs = [
          { c: 0.3 + 0.08 * Math.sin(t * 0.9), s: 0.11 },
          { c: 0.62 + 0.1 * Math.sin(t * 0.7 + 2), s: 0.09 },
          { c: 0.82 + 0.05 * Math.sin(t * 1.3 + 4), s: 0.06 },
        ];
        const envelope = (u) => blobs.reduce((sum, b, i) => sum + Math.exp(-((u - b.c) ** 2) / (2 * b.s * b.s)) * (0.7 + 0.3 * Math.sin(t * (4 + i) + i)), 0);
        const gradient = ctx.createLinearGradient(left, 0, right, 0);
        gradient.addColorStop(0, '#5ef0b0');
        gradient.addColorStop(0.5, '#8fa7ff');
        gradient.addColorStop(1, '#c58cff');
        ctx.save();
        ctx.shadowColor = 'rgba(140, 170, 255, 0.8)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        const steps = 80;
        for (let s = 0; s <= steps; s += 1) {
          const u = s / steps;
          const y = cy - Math.max(0.8, amp * envelope(u));
          s === 0 ? ctx.moveTo(left + u * (right - left), y) : ctx.lineTo(left + u * (right - left), y);
        }
        for (let s = steps; s >= 0; s -= 1) {
          const u = s / steps;
          ctx.lineTo(left + u * (right - left), cy + Math.max(0.8, amp * envelope(u)));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
    },

    bolide() {
      const trail = [];
      return (ctx, w, h, t, level) => {
        const x = w / 2 + w * 0.3 * Math.sin(t * 0.8);
        const y = h / 2 + h * 0.22 * level * Math.sin(t * 6.5);
        trail.unshift({ x, y });
        if (trail.length > 46) trail.pop();
        ctx.globalCompositeOperation = 'lighter';
        trail.forEach((p, i) => {
          const fade = 1 - i / trail.length;
          ctx.fillStyle = `rgba(255, ${Math.round(170 + 60 * fade)}, ${Math.round(90 + 80 * fade)}, ${0.22 * fade})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (2.5 + level * 4) * fade + 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        const radius = 9 + level * 9;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, 'rgba(255, 250, 235, 1)');
        glow.addColorStop(0.35, 'rgba(255, 215, 150, 0.8)');
        glow.addColorStop(1, 'rgba(255, 160, 80, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      };
    },

    sonar() {
      const rings = [];
      let lastPing = -10;
      return (ctx, w, h, t, level) => {
        const gap = level > 0.2 ? 0.32 - level * 0.12 : 1.4;
        if (t - lastPing > gap || t < lastPing) {
          rings.push({ born: t, strength: 0.25 + level * 0.75 });
          lastPing = t;
        }
        const cx = w / 2;
        const cy = h / 2;
        for (let i = rings.length - 1; i >= 0; i -= 1) {
          const age = t - rings[i].born;
          if (age > 1.8 || age < 0) { rings.splice(i, 1); continue; }
          const r = 6 + age * w * 0.17;
          ctx.strokeStyle = `rgba(100, 210, 255, ${rings[i].strength * (1 - age / 1.8) * 0.9})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.36, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#64d2ff';
        ctx.shadowColor = '#64d2ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, 3 + level * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      };
    },

    ticker() {
      const samples = [];
      let carry = 0;
      let seed = 7;
      const noise = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
      return (ctx, w, h, t, level, dt) => {
        const step = 2;
        const capacity = Math.ceil((w * 0.8) / step);
        carry += dt * 60;
        while (carry >= 1) {
          samples.push(noise() * (0.04 + level));
          carry -= 1;
        }
        while (samples.length > capacity) samples.shift();
        const left = w * 0.1;
        const right = left + capacity * step;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        const offset = (t * 60 * step) % 24;
        for (let x = right - offset; x > left; x -= 24) {
          ctx.beginPath();
          ctx.moveTo(x, h * 0.2);
          ctx.lineTo(x, h * 0.8);
          ctx.stroke();
        }
        ctx.strokeStyle = '#ff7a59';
        ctx.lineWidth = 1.6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const start = right - samples.length * step;
        samples.forEach((v, i) => {
          const x = start + i * step;
          const y = h / 2 + v * h * 0.32;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        const last = samples[samples.length - 1] || 0;
        ctx.fillStyle = '#ffd0c2';
        ctx.beginPath();
        ctx.arc(right, h / 2 + last * h * 0.32, 3, 0, Math.PI * 2);
        ctx.fill();
      };
    },
  };

  function roundRect(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, Math.min(width, height) / 2);
    ctx.fill();
  }

  // Fake speech for the theme gallery: talk for a few seconds, then pause.
  function syntheticLevel(t, seed) {
    const cycle = (t + seed) % 4.2;
    if (cycle > 3) return 0.04;
    return clamp(0.25 + 0.6 * Math.abs(Math.sin(t * 9.3 + seed)) * (0.55 + 0.45 * Math.sin(t * 2.1 + seed * 3)), 0, 1);
  }

  // Scenarios ---------------------------------------------------------------

  const scenarios = {
    mail: {
      title: 'New Message',
      head: '<div class="field">To: <b>Priya Shah</b></div><div class="field">Subject: <b>Design review</b></div>',
      spoken: 'Hi Priya, can we move the design review to two? First, bring the final mockups. Second, book a room with a big screen. Thanks!',
      result: 'Hi Priya, can we move the design review to two?\n<ol><li>Bring the final mockups.</li><li>Book a room with a big screen.</li></ol>Thanks!',
    },
    messages: {
      title: 'Messages',
      head: '<p class="who">Sam</p><p class="bubble-in">you close? we\'re about to start</p>',
      spoken: 'Running five minutes late, start without me thumbs up emoji',
      result: 'Running five minutes late, start without me 👍',
    },
    notes: {
      title: 'Notes',
      head: '<h4>Groceries</h4>',
      spoken: 'Bullet point oat milk bullet point eggs bullet point coffee beans',
      result: '<ul><li>Oat milk</li><li>Eggs</li><li>Coffee beans</li></ul>',
    },
  };

  // Seconds at which each word appears in the live panel. The first word
  // shows up after a short delay, like the real live preview.
  function wordTimeline(text) {
    const words = text.split(' ');
    let at = 0.55;
    return words.map((word) => {
      const entry = { word, at };
      at += 0.12 + word.length * 0.028 + (/[,.?!]$/.test(word) ? 0.24 : 0);
      return entry;
    }).concat([{ word: null, at }]);
  }

  // Demo --------------------------------------------------------------------

  const demo = $('[data-demo]');
  if (demo) setupDemo();

  function setupDemo() {
    const win = $('[data-window]');
    const title = $('[data-window-title]');
    const head = $('[data-window-head]');
    const body = $('[data-window-body]');
    const output = $('[data-output]');
    const hud = $('[data-hud]');
    const panel = $('.hud-panel', hud);
    const hudText = $('[data-hud-text]');
    const hudTime = $('[data-hud-time]');
    const hudStatus = $('[data-hud-status]');
    const hudCanvas = $('[data-hud-canvas]');
    const key = $('[data-talk-key]');
    const controlStatus = $('[data-control-status]');
    const tabs = $$('[data-scenario]');
    const cards = $$('[data-theme]');
    let scenarioName = 'mail';
    let timeline = wordTimeline(scenarios.mail.spoken);
    let state = 'idle';
    let activeInput = null;
    let pressedAt = 0;
    let revealed = 0;
    let level = 0;
    let processTimer = 0;
    let hudDraw = renderers.classic();
    let hudSize = fitCanvas(hudCanvas);
    let hudNeedsDraw = true;
    let galleryNeedsDraw = true;

    function setState(next) {
      state = next;
      demo.dataset.state = state;
      key.disabled = state === 'processing';
      key.setAttribute('aria-pressed', String(state === 'recording'));
      key.classList.toggle('down', state === 'recording');
      key.setAttribute('aria-label', state === 'recording' && activeInput === 'activation'
        ? 'Finish example dictation' : 'Hold to try dictation');
      tabs.forEach((tab) => { tab.disabled = state === 'processing'; });
    }

    function announce(message) {
      controlStatus.textContent = message;
      demo.classList.toggle('has-status', Boolean(message));
    }

    function showScenario(name) {
      scenarioName = name;
      timeline = wordTimeline(scenarios[name].spoken);
      tabs.forEach((tab) => {
        const selected = tab.dataset.scenario === name;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      win.className = `window ${name}`;
      win.setAttribute('aria-labelledby', `tab-${name}`);
      title.textContent = scenarios[name].title;
      head.innerHTML = scenarios[name].head;
      body.innerHTML = '<span class="cursor"></span>';
    }

    function showOutput() {
      output.hidden = false;
      resizeAll();
    }

    function hideHud() {
      hud.classList.remove('visible', 'status');
    }

    function press(input) {
      if (state !== 'idle') return false;
      activeInput = input;
      showScenario(scenarioName);
      setState('recording');
      pressedAt = performance.now();
      revealed = 0;
      hudText.textContent = '';
      hudTime.textContent = '0:00';
      panel.classList.add('empty');
      hud.classList.remove('status');
      hud.classList.add('visible');
      hudNeedsDraw = true;
      showOutput();
      announce('Listening to an example');
      return true;
    }

    function release(input) {
      if (state !== 'recording' || input !== activeInput) return;
      activeInput = null;
      if (revealed === 0) {
        setState('idle');
        hideHud();
        announce('Hold a little longer to hear the example.');
        return;
      }
      // Capture the result before the asynchronous processing step.
      const complete = revealed >= timeline.length - 1;
      const words = timeline.slice(0, revealed).map((entry) => entry.word).join(' ');
      const result = complete ? scenarios[scenarioName].result : escapeHTML(words);
      setState('processing');
      announce('Transcribing');
      hudStatus.textContent = 'Transcribing';
      hud.classList.add('status');
      processTimer = setTimeout(() => {
        body.innerHTML = `${result}<span class="cursor"></span>`;
        hideHud();
        setState('idle');
        announce(`Example pasted into ${scenarioName === 'mail' ? 'Mail' : scenarios[scenarioName].title}`);
      }, 650);
    }

    function cancel() {
      if (state === 'idle') return;
      clearTimeout(processTimer);
      activeInput = null;
      hideHud();
      setState('idle');
      announce('Cancelled. Nothing pasted.');
    }

    key.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      if (press(event.pointerId)) key.setPointerCapture(event.pointerId);
    });
    key.addEventListener('pointerup', (event) => release(event.pointerId));
    key.addEventListener('pointercancel', (event) => {
      if (activeInput === event.pointerId) cancel();
    });
    key.addEventListener('lostpointercapture', (event) => {
      if (state === 'recording' && activeInput === event.pointerId) cancel();
    });
    key.addEventListener('contextmenu', (event) => event.preventDefault());
    // Assistive technology can activate a button without pointer or key events.
    key.addEventListener('click', (event) => {
      if (event.detail !== 0) return;
      if (state === 'recording' && activeInput === 'activation') {
        release('activation');
      } else if (press('activation')) {
        announce('Example started. Activate again to paste.');
      }
    });
    key.addEventListener('keydown', (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      if (!event.repeat) press(event.code);
    });
    key.addEventListener('keyup', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        release(event.code);
      }
    });
    key.addEventListener('blur', () => {
      if (activeInput === 'Space' || activeInput === 'Enter') cancel();
    });
    window.addEventListener('keydown', (event) => {
      if (event.code === 'AltRight' && !event.repeat) {
        event.preventDefault();
        press(event.code);
      } else if (event.key === 'Escape') {
        cancel();
      }
    });
    window.addEventListener('keyup', (event) => {
      if (event.code === 'AltRight') release(event.code);
    });
    window.addEventListener('blur', cancel);
    $('[data-close-demo]').addEventListener('click', () => {
      cancel();
      hideHud();
      output.hidden = true;
      announce('');
      key.focus({ preventScroll: true });
    });

    tabs.forEach((tab) => tab.addEventListener('click', () => {
      if (state === 'processing') return;
      cancel();
      hideHud();
      showScenario(tab.dataset.scenario);
      announce('');
    }));
    cards.forEach((card) => card.addEventListener('click', () => {
      cards.forEach((other) => {
        other.setAttribute('aria-checked', String(other === card));
        other.tabIndex = other === card ? 0 : -1;
      });
      hudDraw = renderers[card.dataset.theme]();
      hudNeedsDraw = true;
      hud.classList.add('visible');
      showOutput();
      if (state === 'idle') {
        hud.classList.remove('status');
        panel.classList.add('empty');
        announce(`${card.textContent.trim()} selected`);
      }
    }));

    // Tabs and theme radios both use one tab stop and arrow-key selection.
    function bindArrowKeys(items) {
      items.forEach((item, index) => item.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % items.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        event.preventDefault();
        if (items[next].disabled) return;
        items[next].click();
        items[next].focus();
      }));
    }
    bindArrowKeys(tabs);
    bindArrowKeys(cards);

    const gallery = cards.map((card, index) => ({
      canvas: $('canvas', card),
      draw: renderers[card.dataset.theme](),
      seed: index * 1.7,
      size: null,
      visible: false,
    }));
    let hudInView = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hud) hudInView = entry.isIntersecting;
        const item = gallery.find((g) => g.canvas === entry.target);
        if (item) item.visible = entry.isIntersecting;
      });
      galleryNeedsDraw = true;
      hudNeedsDraw = true;
    }, { threshold: 0.05 });
    observer.observe(hud);
    gallery.forEach((item) => observer.observe(item.canvas));

    function resizeAll() {
      hudSize = fitCanvas(hudCanvas);
      gallery.forEach((item) => { item.size = fitCanvas(item.canvas); });
      galleryNeedsDraw = true;
      hudNeedsDraw = true;
    }
    window.addEventListener('resize', resizeAll, { passive: true });
    motionPreference.addEventListener('change', (event) => {
      reducedMotion = event.matches;
      galleryNeedsDraw = true;
      hudNeedsDraw = true;
    });
    resizeAll();

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = reducedMotion ? 2.4 : now / 1000;
      let target = 0.03;
      if (state === 'recording') {
        const elapsed = (now - pressedAt) / 1000;
        while (revealed < timeline.length - 1 && timeline[revealed].at <= elapsed) revealed += 1;
        if (revealed < timeline.length - 1 && elapsed > 0.2) {
          target = 0.35 + 0.6 * Math.abs(Math.sin(elapsed * 10.5));
        }
        const text = timeline.slice(0, revealed).map((entry) => entry.word).join(' ');
        if (hudText.textContent !== text) {
          hudText.textContent = text;
          panel.classList.toggle('empty', !text);
          hudText.parentElement.scrollTop = hudText.parentElement.scrollHeight;
        }
        const seconds = Math.floor(elapsed);
        hudTime.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      }
      level += (target - level) * (1 - Math.exp(-dt * 16));
      if (hudInView && hud.classList.contains('visible') && (!reducedMotion || hudNeedsDraw)) {
        const { context, width, height } = hudSize;
        context.clearRect(0, 0, width, height);
        hudDraw(context, width, height, t, reducedMotion ? 0.6 : level, reducedMotion ? 3 : dt);
        hudNeedsDraw = false;
      }
      if (!reducedMotion || galleryNeedsDraw) {
        gallery.forEach((item) => {
          if (!item.visible || !item.size) return;
          const { context, width, height } = item.size;
          context.clearRect(0, 0, width, height);
          item.draw(context, width, height, t + item.seed, reducedMotion ? 0.6 : syntheticLevel(t, item.seed), reducedMotion ? 3 : dt);
        });
        galleryNeedsDraw = false;
      }
      requestAnimationFrame(frame);
    }
    showScenario('mail');
    requestAnimationFrame(frame);
  }

  function openTargetDetails() {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.tagName === 'DETAILS') target.open = true;
  }
  window.addEventListener('hashchange', openTargetDetails);
  $$('a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target?.tagName === 'DETAILS') target.open = true;
  }));
  openTargetDetails();

  // Point every download button at the latest DMG ---------------------------

  fetch('https://api.github.com/repos/NikAtNight/flo/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((release) => {
      const dmg = (release.assets || []).find((asset) => asset.name.endsWith('.dmg'));
      if (!dmg) return;
      const megabytes = (dmg.size / 1e6).toFixed(0);
      $$('[data-download]').forEach((link) => {
        link.href = dmg.browser_download_url;
        link.title = `Flo ${release.tag_name} · ${megabytes} MB`;
      });
    })
    .catch(() => { /* Links already point at the latest release page. */ });

  // Open other sites in a new tab. Downloads stay in place.
  $$('a[href^="http"]:not([data-download])').forEach((link) => {
    link.target = '_blank';
    link.rel = 'noopener';
  });
})();
