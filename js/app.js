/* ============================================ */
/*  学习打卡 App - 核心逻辑                     */
/* ============================================ */

(function () {
  'use strict';

  // =============================================
  //  工具函数
  // =============================================
  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => [...(ctx || document).querySelectorAll(s)];
  const formatNum = (n) => String(n).padStart(2, '0');
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${formatNum(d.getMonth() + 1)}-${formatNum(d.getDate())}`;
  };
  const formatDate = (d) =>
    `${d.getFullYear()}-${formatNum(d.getMonth() + 1)}-${formatNum(d.getDate())}`;
  const parseDate = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const getWeekday = (d) => ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];

  // =============================================
  //  存储
  // =============================================
  const STORAGE_KEY = 'learn_habit_data';

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { checkins: {}, timerSessions: [], settings: { focusDuration: 25, shortBreak: 5, longBreak: 15 } };
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let DATA = loadData();

  function ensureTodayCheckin() {
    const key = todayKey();
    if (!DATA.checkins[key]) {
      DATA.checkins[key] = { english: { done: false, words: 0, minutes: 0 }, ai: { done: false, minutes: 0, notes: '' } };
    }
    return DATA.checkins[key];
  }

  // =============================================
  //  Toast 通知
  // =============================================
  function showToast(msg, duration) {
    const old = $('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration || 2000);
  }

  // =============================================
  //  庆祝彩带
  // =============================================
  function showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#a29bfe', '#81ecec', '#fab1d0', '#ffeaa7'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = '0';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = 6 + Math.random() * 6 + 'px';
      piece.style.height = 6 + Math.random() * 6 + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
      piece.style.animationDelay = Math.random() * 0.3 + 's';
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 2000);
  }

  // =============================================
  //  导航
  // =============================================
  let currentPage = 'home';

  function navigateTo(pageId) {
    currentPage = pageId;
    $$('.page').forEach(p => p.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    const nav = $(`.nav-item[data-page="${pageId}"]`);
    if (page) page.classList.add('active');
    if (nav) nav.classList.add('active');
    // 切换时刷新数据
    if (pageId === 'home') renderHome();
    if (pageId === 'checkin') renderCheckin();
    if (pageId === 'timer') initTimerPage();
    if (pageId === 'stats') renderStats();
  }

  // =============================================
  //  名言模块
  // =============================================
  function getDailyQuote() {
    const d = new Date();
    const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }

  function getRandomQuote() {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

  // =============================================
  //  首页
  // =============================================
  function renderHome() {
    const container = $('#page-home');
    if (!container) return;

    // 每日名言
    let quote = getDailyQuote();
    const savedQuoteIdx = sessionStorage.getItem('manual_quote_idx');
    if (savedQuoteIdx !== null) {
      quote = QUOTES[parseInt(savedQuoteIdx)];
    }

    container.innerHTML = `
      <div class="quote-card">
        <button class="quote-refresh" id="quoteRefresh" title="换一句">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6M3 12a9 9 0 0115.36-6.36L21 8M3 22v-6h6M21 12a9 9 0 01-15.36 6.36L3 16"/>
          </svg>
        </button>
        <div class="quote-text">${quote.text}</div>
        <div class="quote-source">
          <span>${quote.author}</span>
          <span class="dot"></span>
          <span>${quote.book}</span>
        </div>
      </div>

      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-number" id="statStreak">0</div>
          <div class="stat-label">连续天数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" id="statTotal">0</div>
          <div class="stat-label">总打卡天数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" id="statToday">0</div>
          <div class="stat-label">今日专注(分)</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">今日学习</div>
        </div>
        <div class="todo-list" id="homeTodoList"></div>
      </div>
    `;

    // 刷新名言
    $('#quoteRefresh').addEventListener('click', function () {
      this.classList.add('spinning');
      const q = getRandomQuote();
      const idx = QUOTES.indexOf(q);
      sessionStorage.setItem('manual_quote_idx', String(idx));
      const qText = $('.quote-text');
      const qSource = $('.quote-source');
      if (qText && qSource) {
        qText.style.opacity = '0';
        qSource.style.opacity = '0';
        setTimeout(() => {
          qText.textContent = q.text;
          qSource.innerHTML = `<span>${q.author}</span><span class="dot"></span><span>${q.book}</span>`;
          qText.style.opacity = '1';
          qSource.style.opacity = '1';
        }, 150);
      }
      setTimeout(() => this.classList.remove('spinning'), 600);
    });

    // 更新统计
    updateHomeStats();
  }

  function updateHomeStats() {
    const stats = calcStats();
    const streakEl = $('#statStreak');
    const totalEl = $('#statTotal');
    const todayEl = $('#statToday');

    if (streakEl) streakEl.textContent = stats.streak;
    if (totalEl) totalEl.textContent = stats.totalDays;
    if (todayEl) {
      const today = ensureTodayCheckin();
      const mins = (today.english.minutes || 0) + (today.ai.minutes || 0);
      todayEl.textContent = mins;
    }

    // 待办列表
    const todoList = $('#homeTodoList');
    if (todoList) {
      const today = ensureTodayCheckin();
      const items = [
        { id: 'english-check', icon: '🌍', name: '英语学习', desc: '背单词 / 阅读 / 听力', done: today.english.done },
        { id: 'ai-check', icon: '🤖', name: 'AI 学习', desc: '课程 / 实践 / 阅读', done: today.ai.done }
      ];
      todoList.innerHTML = items.map(item => `
        <div class="todo-item ${item.done ? 'done' : ''}" data-id="${item.id}">
          <div class="todo-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="todo-icon">${item.icon}</div>
          <div class="todo-info">
            <div class="todo-name">${item.name}</div>
            <div class="todo-desc">${item.desc}</div>
          </div>
        </div>
      `).join('');

      // 点击快速打卡
      todoList.querySelectorAll('.todo-item').forEach(el => {
        el.addEventListener('click', function () {
          const id = this.dataset.id;
          const today = ensureTodayCheckin();
          if (id === 'english-check') {
            today.english.done = !today.english.done;
            if (today.english.done) showConfetti();
          } else if (id === 'ai-check') {
            today.ai.done = !today.ai.done;
            if (today.ai.done) showConfetti();
          }
          saveData(DATA);
          updateHomeStats();
          // 刷新待办
          renderHome();
          showToast(today.english.done && today.ai.done ? '今日全部打卡完成，太棒了！' : '打卡成功！');
        });
      });
    }
  }

  // =============================================
  //  统计计算
  // =============================================
  function calcStats() {
    const keys = Object.keys(DATA.checkins).sort();
    let streak = 0;
    const today = todayKey();
    // 从今天往回数连续
    const d = new Date();
    while (true) {
      const key = formatDate(d);
      const c = DATA.checkins[key];
      if (c && (c.english.done || c.ai.done)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    // 如果今天还没打卡，也算今天的潜在连续
    // 但实际上上面已经检查了今天的日期，所以没问题

    const totalDays = keys.filter(k => {
      const c = DATA.checkins[k];
      return c.english.done || c.ai.done;
    }).length;

    let totalFocusMinutes = 0;
    if (DATA.timerSessions && DATA.timerSessions.length) {
      totalFocusMinutes = DATA.timerSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    }

    return { streak, totalDays, totalFocusMinutes };
  }

  // =============================================
  //  打卡页面
  // =============================================
  function renderCheckin() {
    const container = $('#page-checkin');
    if (!container) return;

    const today = ensureTodayCheckin();

    container.innerHTML = `
      <div class="card checkin-card-english">
        <div class="card-header">
          <div class="card-title">
            <span class="icon" style="background:rgba(108,92,231,0.15);color:#a29bfe;">E</span>
            英语学习
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="checkEnglish" ${today.english.done ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">
          记录今天的英语学习情况
        </p>
        <div class="checkin-grid">
          <div class="checkin-field">
            <label>今日学习单词数</label>
            <input type="number" id="engWords" min="0" placeholder="0" value="${today.english.words || 0}">
          </div>
          <div class="checkin-field">
            <label>学习时长（分钟）</label>
            <input type="number" id="engMinutes" min="0" placeholder="0" value="${today.english.minutes || 0}">
          </div>
        </div>
      </div>

      <div class="card checkin-card-ai">
        <div class="card-header">
          <div class="card-title">
            <span class="icon" style="background:rgba(0,206,201,0.15);color:#81ecec;">AI</span>
            AI 学习
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="checkAi" ${today.ai.done ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">
          记录今天的 AI 学习情况
        </p>
        <div class="checkin-grid">
          <div class="checkin-field">
            <label>学习时长（分钟）</label>
            <input type="number" id="aiMinutes" min="0" placeholder="0" value="${today.ai.minutes || 0}">
          </div>
          <div class="checkin-field">
            <label>学习内容/笔记</label>
            <input type="text" id="aiNotes" placeholder="如：Transformer原理" value="${today.ai.notes || ''}">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">今日进度</div>
          <span class="card-badge" id="progressText">0%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="progressFill" style="width:0%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--text-muted);">
          <span>英语: ${today.english.done ? '✅' : '⬜'}</span>
          <span>AI: ${today.ai.done ? '✅' : '⬜'}</span>
        </div>
      </div>

      <button class="save-btn primary" id="saveCheckin">
        💪 保存今日打卡
      </button>
      <div id="saveFeedback"></div>
    `;

    // 计算进度
    updateCheckinProgress();

    // 事件绑定
    $('#checkEnglish').addEventListener('change', updateCheckinProgress);
    $('#checkAi').addEventListener('change', updateCheckinProgress);
    $('#engWords').addEventListener('input', updateCheckinProgress);
    $('#engMinutes').addEventListener('input', updateCheckinProgress);
    $('#aiMinutes').addEventListener('input', updateCheckinProgress);

    $('#saveCheckin').addEventListener('click', function () {
      const todayData = ensureTodayCheckin();
      todayData.english.done = $('#checkEnglish').checked;
      todayData.english.words = parseInt($('#engWords').value) || 0;
      todayData.english.minutes = parseInt($('#engMinutes').value) || 0;
      todayData.ai.done = $('#checkAi').checked;
      todayData.ai.minutes = parseInt($('#aiMinutes').value) || 0;
      todayData.ai.notes = $('#aiNotes').value.trim();
      saveData(DATA);

      const feedback = $('#saveFeedback');
      feedback.innerHTML = '<div class="save-feedback">✔️ 今日打卡已保存！继续加油！</div>';
      if (todayData.english.done && todayData.ai.done) {
        showConfetti();
      }
      setTimeout(() => { feedback.innerHTML = ''; }, 2500);
      updateHomeStats();
    });
  }

  function updateCheckinProgress() {
    const engChecked = $('#checkEnglish')?.checked;
    const aiChecked = $('#checkAi')?.checked;
    const fill = $('#progressFill');
    const text = $('#progressText');
    if (!fill || !text) return;

    // 勾选占60%，数字输入占40%
    let progress = 0;
    if (engChecked) progress += 30;
    if (aiChecked) progress += 30;
    const engWords = parseInt($('#engWords')?.value) || 0;
    const engMins = parseInt($('#engMinutes')?.value) || 0;
    const aiMins = parseInt($('#aiMinutes')?.value) || 0;
    if (engWords > 0 || engMins > 0) progress += 10;
    if (aiMins > 0 || $('#aiNotes')?.value?.trim()) progress += 10;

    progress = Math.min(progress, 100);
    fill.style.width = progress + '%';
    text.textContent = progress + '%';

    if (progress >= 100) {
      fill.classList.add('green');
    } else {
      fill.classList.remove('green');
    }
  }

  // =============================================
  //  计时器页面
  // =============================================
  let timerState = {
    mode: 'focus',
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    running: false,
    interval: null,
    sessionCount: 0,
    todayMinutes: 0
  };

  const TIMER_MODES = {
    focus: { label: '专注', duration: 25 * 60 },
    shortBreak: { label: '短休', duration: 5 * 60 },
    longBreak: { label: '长休', duration: 15 * 60 }
  };

  function initTimerPage() {
    const container = $('#page-timer');
    if (!container) return;

    // 读自定义设置
    const focusMin = DATA.settings?.focusDuration || 25;
    const shortMin = DATA.settings?.shortBreak || 5;
    const longMin = DATA.settings?.longBreak || 15;
    TIMER_MODES.focus.duration = focusMin * 60;
    TIMER_MODES.shortBreak.duration = shortMin * 60;
    TIMER_MODES.longBreak.duration = longMin * 60;

    // 如果计时器状态不是从当前模式初始化的，重置
    if (!timerState.running) {
      timerState.timeLeft = TIMER_MODES[timerState.mode].duration;
      timerState.totalTime = TIMER_MODES[timerState.mode].duration;
    }

    // 计算今天专注分钟（不依赖 timerState 内部计数）
    const todayMins = calcTodayTimerMinutes();

    container.innerHTML = `
      <div class="timer-container">
        <div class="timer-mode-tabs" id="timerTabs">
          <button class="timer-mode-tab ${timerState.mode === 'focus' ? 'active' : ''}" data-mode="focus">专注</button>
          <button class="timer-mode-tab ${timerState.mode === 'shortBreak' ? 'active' : ''}" data-mode="shortBreak">短休</button>
          <button class="timer-mode-tab ${timerState.mode === 'longBreak' ? 'active' : ''}" data-mode="longBreak">长休</button>
        </div>

        <div class="timer-circle-wrapper">
          <svg width="100%" height="100%" viewBox="0 0 240 240">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6c5ce7"/>
                <stop offset="100%" stop-color="#a29bfe"/>
              </linearGradient>
            </defs>
            <circle class="timer-circle-bg" cx="120" cy="120" r="100"/>
            <circle class="timer-circle-progress" id="timerProgress" cx="120" cy="120" r="100"
              stroke-dasharray="${2 * Math.PI * 100}"
              stroke-dashoffset="0"/>
          </svg>
          <div class="timer-display">
            <div class="timer-time" id="timerDisplay">${formatTimerTime(timerState.timeLeft)}</div>
            <div class="timer-label" id="timerLabel">${TIMER_MODES[timerState.mode].label}</div>
          </div>
        </div>

        <div class="timer-controls">
          <button class="timer-btn timer-btn-secondary" id="timerReset" title="重置">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2v6h-6M3 12a9 9 0 0115.36-6.36L21 8M3 22v-6h6M21 12a9 9 0 01-15.36 6.36L3 16"/>
            </svg>
          </button>
          <button class="timer-btn timer-btn-start ${timerState.running ? 'running' : ''}" id="timerToggle">
            ${timerState.running
              ? '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
              : '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
            }
          </button>
          <button class="timer-btn timer-btn-secondary" id="timerSettingsBtn" title="设置">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>

        <div class="timer-session-stats">
          <div class="timer-session-stat">
            <div class="timer-session-stat-value" id="timerSessionCount">${timerState.sessionCount}</div>
            <div class="timer-session-stat-label">今日专注次数</div>
          </div>
          <div class="timer-session-stat">
            <div class="timer-session-stat-value" id="timerTodayMinutes">${todayMins}</div>
            <div class="timer-session-stat-label">今日专注(分)</div>
          </div>
          <div class="timer-session-stat">
            <div class="timer-session-stat-value" id="timerModeIcon">${timerState.mode === 'focus' ? '🌟' : '☕'}</div>
            <div class="timer-session-stat-label">${TIMER_MODES[timerState.mode].label}</div>
          </div>
        </div>
      </div>
    `;

    // 更新进度圆环
    updateTimerCircle();

    // 事件绑定
    $$('.timer-mode-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        if (timerState.running) return; // 运行中不允许切换模式
        const mode = this.dataset.mode;
        timerState.mode = mode;
        timerState.timeLeft = TIMER_MODES[mode].duration;
        timerState.totalTime = TIMER_MODES[mode].duration;
        $$('.timer-mode-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        $('#timerDisplay').textContent = formatTimerTime(timerState.timeLeft);
        $('#timerLabel').textContent = TIMER_MODES[mode].label;
        updateTimerCircle();
      });
    });

    $('#timerToggle').addEventListener('click', toggleTimer);
    $('#timerReset').addEventListener('click', resetTimer);
    $('#timerSettingsBtn').addEventListener('click', showTimerSettings);
  }

  function formatTimerTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${formatNum(m)}:${formatNum(s)}`;
  }

  function updateTimerCircle() {
    const circle = $('#timerProgress');
    if (!circle) return;
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const progress = timerState.totalTime > 0 ? timerState.timeLeft / timerState.totalTime : 1;
    const offset = circumference * (1 - progress);
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
  }

  function toggleTimer() {
    const btn = $('#timerToggle');
    if (timerState.running) {
      // 暂停
      clearInterval(timerState.interval);
      timerState.running = false;
      btn.classList.remove('running');
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    } else {
      // 开始
      timerState.running = true;
      btn.classList.add('running');
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
      timerState.interval = setInterval(timerTick, 1000);
    }
  }

  function timerTick() {
    if (timerState.timeLeft <= 0) {
      // 时间到！
      clearInterval(timerState.interval);
      timerState.running = false;
      timerState.sessionCount++;

      // 记录专注会话
      const duration = TIMER_MODES[timerState.mode].duration;
      if (timerState.mode === 'focus') {
        if (!DATA.timerSessions) DATA.timerSessions = [];
        DATA.timerSessions.push({
          date: todayKey(),
          duration: Math.round(duration / 60), // 存分钟
          type: 'focus'
        });
        saveData(DATA);
      }

      // 更新UI
      const btn = $('#timerToggle');
      if (btn) {
        btn.classList.remove('running');
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      }

      // 更新session计数
      const sessionEl = $('#timerSessionCount');
      if (sessionEl) sessionEl.textContent = timerState.sessionCount;
      const todayEl = $('#timerTodayMinutes');
      if (todayEl) todayEl.textContent = calcTodayTimerMinutes();

      showConfetti();
      showToast(timerState.mode === 'focus' ? '专注完成！休息一下吧 🌟' : '休息结束，继续加油！');

      timerState.timeLeft = TIMER_MODES[timerState.mode].duration;
      timerState.totalTime = TIMER_MODES[timerState.mode].duration;
      $('#timerDisplay').textContent = formatTimerTime(timerState.timeLeft);
      updateTimerCircle();
      return;
    }

    timerState.timeLeft--;
    $('#timerDisplay').textContent = formatTimerTime(timerState.timeLeft);
    updateTimerCircle();

    // 更新页面标题
    document.title = `${formatTimerTime(timerState.timeLeft)} - 学习打卡`;
  }

  function resetTimer() {
    clearInterval(timerState.interval);
    timerState.running = false;
    timerState.timeLeft = TIMER_MODES[timerState.mode].duration;
    timerState.totalTime = TIMER_MODES[timerState.mode].duration;

    const btn = $('#timerToggle');
    if (btn) {
      btn.classList.remove('running');
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
    $('#timerDisplay').textContent = formatTimerTime(timerState.timeLeft);
    document.title = '学习打卡';
    updateTimerCircle();
  }

  function calcTodayTimerMinutes() {
    if (!DATA.timerSessions) return 0;
    return DATA.timerSessions
      .filter(s => s.date === todayKey())
      .reduce((sum, s) => sum + (s.duration || 0), 0);
  }

  function showTimerSettings() {
    const focus = DATA.settings?.focusDuration || 25;
    const short = DATA.settings?.shortBreak || 5;
    const long = DATA.settings?.longBreak || 15;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:200;
      background:rgba(0,0,0,0.6);
      backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;
      animation:fadeIn 0.2s ease;
    `;
    overlay.innerHTML = `
      <div style="background:var(--bg-secondary);border:1px solid var(--border-glass);border-radius:var(--radius-lg);padding:28px;width:320px;max-width:90vw;">
        <h3 style="font-size:18px;font-weight:600;margin-bottom:20px;">计时器设置</h3>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="font-size:13px;color:var(--text-secondary);">专注时长（分钟）</label>
            <input type="number" id="setFocus" value="${focus}" min="1" max="120"
              style="width:100%;padding:10px 14px;margin-top:4px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px;font-family:var(--font);">
          </div>
          <div>
            <label style="font-size:13px;color:var(--text-secondary);">短休时长（分钟）</label>
            <input type="number" id="setShort" value="${short}" min="1" max="30"
              style="width:100%;padding:10px 14px;margin-top:4px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px;font-family:var(--font);">
          </div>
          <div>
            <label style="font-size:13px;color:var(--text-secondary);">长休时长（分钟）</label>
            <input type="number" id="setLong" value="${long}" min="1" max="60"
              style="width:100%;padding:10px 14px;margin-top:4px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px;font-family:var(--font);">
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px;">
          <button id="settingsCancel" style="flex:1;padding:10px;border:none;border-radius:var(--radius-sm);background:var(--bg-glass);color:var(--text-secondary);font-family:var(--font);cursor:pointer;">取消</button>
          <button id="settingsSave" style="flex:1;padding:10px;border:none;border-radius:var(--radius-sm);background:var(--gradient-primary);color:white;font-family:var(--font);font-weight:600;cursor:pointer;">保存</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    $('#settingsCancel', overlay).addEventListener('click', () => overlay.remove());
    $('#settingsSave', overlay).addEventListener('click', () => {
      const f = parseInt($('#setFocus', overlay).value) || 25;
      const s = parseInt($('#setShort', overlay).value) || 5;
      const l = parseInt($('#setLong', overlay).value) || 15;
      if (!DATA.settings) DATA.settings = {};
      DATA.settings.focusDuration = f;
      DATA.settings.shortBreak = s;
      DATA.settings.longBreak = l;
      saveData(DATA);
      TIMER_MODES.focus.duration = f * 60;
      TIMER_MODES.shortBreak.duration = s * 60;
      TIMER_MODES.longBreak.duration = l * 60;
      if (!timerState.running) {
        timerState.timeLeft = TIMER_MODES[timerState.mode].duration;
        timerState.totalTime = TIMER_MODES[timerState.mode].duration;
        $('#timerDisplay').textContent = formatTimerTime(timerState.timeLeft);
        updateTimerCircle();
      }
      overlay.remove();
      showToast('计时器设置已更新');
    });
  }

  // =============================================
  //  统计页面
  // =============================================
  function renderStats() {
    const container = $('#page-stats');
    if (!container) return;

    const stats = calcStats();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    container.innerHTML = `
      <div class="streak-display">
        <div class="streak-fire">${stats.streak >= 7 ? '🔥' : stats.streak >= 3 ? '💥' : '⏳'}</div>
        <div class="streak-info">
          <div class="streak-count">${stats.streak}</div>
          <div class="streak-label">当前连续打卡天数</div>
        </div>
        <div class="streak-best">
          总计
          <span>${stats.totalDays}</span>
          天
        </div>
      </div>

      <div class="card">
        <div class="calendar-header">
          <div class="calendar-month-year" id="calTitle">${year}年${month + 1}月</div>
          <div class="calendar-nav">
            <button class="calendar-nav-btn" id="calPrev">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="calendar-nav-btn" id="calNext">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <div id="calendarBody"></div>
        <div class="month-summary" id="monthSummary"></div>
      </div>

      <div class="card week-detail" id="weekDetail">
        <div class="week-detail-header">本周打卡详情</div>
        <div id="weekDetailBody"></div>
      </div>
    `;

    buildCalendar(year, month);
    renderWeekDetail();

    // 日历导航
    let calYear = year, calMonth = month;
    $('#calPrev').addEventListener('click', () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      buildCalendar(calYear, calMonth);
    });
    $('#calNext').addEventListener('click', () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      buildCalendar(calYear, calMonth);
    });
  }

  function buildCalendar(year, month) {
    const title = $('#calTitle');
    const body = $('#calendarBody');
    if (title) title.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = formatDate(today);

    let html = '<div class="calendar-weekdays">';
    ['日', '一', '二', '三', '四', '五', '六'].forEach(d => {
      html += `<div class="calendar-weekday">${d}</div>`;
    });
    html += '</div><div class="calendar-days">';

    // 空白填充
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = formatDate(date);
      const isToday = key === todayStr;
      const checkin = DATA.checkins[key];
      let cls = 'calendar-day';
      if (isToday) cls += ' today';
      if (checkin) {
        if (checkin.english.done && checkin.ai.done) cls += ' checked-both';
        else if (checkin.english.done) cls += ' checked';
        else if (checkin.ai.done) cls += ' checked-ai';
      }
      html += `<div class="${cls}" data-date="${key}">${d}</div>`;
    }

    html += '</div>';
    body.innerHTML = html;

    // 月度摘要
    const summary = $('#monthSummary');
    if (summary) {
      let engCount = 0, aiCount = 0, total = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const key = formatDate(new Date(year, month, d));
        const c = DATA.checkins[key];
        if (c) {
          if (c.english.done) engCount++;
          if (c.ai.done) aiCount++;
          if (c.english.done || c.ai.done) total++;
        }
      }
      summary.innerHTML = `
        <div class="month-summary-item">
          <div class="month-summary-value">${total}</div>
          <div class="month-summary-label">打卡天数</div>
        </div>
        <div class="month-summary-item">
          <div class="month-summary-value">${engCount}</div>
          <div class="month-summary-label">英语天数</div>
        </div>
        <div class="month-summary-item">
          <div class="month-summary-value">${aiCount}</div>
          <div class="month-summary-label">AI天数</div>
        </div>
      `;
    }
  }

  function renderWeekDetail() {
    const body = $('#weekDetailBody');
    if (!body) return;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);

    const days = ['日', '一', '二', '三', '四', '五', '六'];
    let html = '';

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const key = formatDate(d);
      const checkin = DATA.checkins[key];
      const done = checkin && (checkin.english.done || checkin.ai.done);
      const isToday = key === todayKey();
      const dayLabel = days[i];

      // 计算当天进度
      let progress = 0;
      if (checkin) {
        if (checkin.english.done) progress += 50;
        if (checkin.ai.done) progress += 50;
      }

      html += `
        <div class="week-detail-item" style="${isToday ? 'background:var(--bg-glass);border-radius:8px;padding:10px;' : ''}">
          <div class="week-detail-day">${dayLabel}${isToday ? '(今)' : ''}</div>
          <div class="week-detail-bar">
            <div class="week-detail-fill" style="width:${progress}%"></div>
          </div>
          <div class="week-detail-check">${done ? '✅' : '❌'}</div>
        </div>
      `;
    }

    body.innerHTML = html;
  }

  // =============================================
  //  初始化
  // =============================================
  function init() {
    // 渲染导航
    const navBar = $('.nav-bar');
    if (navBar) {
      navBar.innerHTML = `
        <button class="nav-item active" data-page="home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="nav-label">首页</span>
        </button>
        <button class="nav-item" data-page="checkin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span class="nav-label">打卡</span>
        </button>
        <button class="nav-item" data-page="timer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="nav-label">计时</span>
        </button>
        <button class="nav-item" data-page="stats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span class="nav-label">统计</span>
        </button>
      `;

      navBar.addEventListener('click', function (e) {
        const item = e.target.closest('.nav-item');
        if (item) navigateTo(item.dataset.page);
      });
    }

    // 设置日期标题
    const dateEl = $('.header-date');
    if (dateEl) {
      const now = new Date();
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 周${weekdays[now.getDay()]}`;
    }

    // 初始页面
    navigateTo('home');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
