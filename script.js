/**
 * 부경대학교 사회복지학전공 웹사이트 | Window OS Engine
 * Concept: Noni Cerâmica Artisanal Tactile GUI
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let highestZ = 100;
  let activeWindowId = null;
  let soundEnabled = true;

  // Window default positions cache for restore
  const windowPosCache = {};

  // Audio Context for subtle tactile ceramic clicks
  let audioCtx = null;
  function playCeramicChime(frequency = 520, duration = 0.04) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked before first interaction
    }
  }

  // Windows list
  const windows = Array.from(document.querySelectorAll('.window'));
  const taskbarAppsContainer = document.getElementById('taskbar-apps');
  const startMenu = document.getElementById('start-menu');
  const startBtn = document.getElementById('start-btn');

  // Cache initial position of all windows
  windows.forEach((win) => {
    const id = win.getAttribute('data-window-id');
    windowPosCache[id] = {
      top: win.style.top,
      left: win.style.left,
      width: win.style.width,
      height: win.style.height,
    };

    // Close windows initially except the intro and dasom welcome window
    if (id !== 'win-intro') {
      win.style.display = 'none';
    } else {
      createTaskbarTab(id, '🏛️ 학과 소개');
      focusWindow(win);
    }
  });

  // Focus Window
  function focusWindow(win) {
    if (!win) return;
    highestZ += 1;
    win.style.zIndex = highestZ;
    windows.forEach(w => w.classList.remove('active-window'));
    win.classList.add('active-window');
    activeWindowId = win.getAttribute('data-window-id');

    // Update Taskbar Tab UI
    document.querySelectorAll('.task-tab').forEach(tab => {
      if (tab.dataset.targetWindow === activeWindowId) {
        tab.classList.add('active-tab');
      } else {
        tab.classList.remove('active-tab');
      }
    });
  }

  // Open Window
  function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    if (win.style.display === 'none' || win.classList.contains('minimized')) {
      win.style.display = 'flex';
      win.classList.remove('minimized');
    }

    createTaskbarTab(id, getWindowTitle(id));
    focusWindow(win);
    playCeramicChime(640, 0.06);

    // Close Start Menu if open
    closeStartMenu();
  }

  // Get Window Title
  function getWindowTitle(id) {
    const titleEl = document.querySelector(`#${id} .win-title-text`);
    if (titleEl) {
      return titleEl.textContent.split('·')[0].trim();
    }
    return '창';
  }

  // Get Window Icon
  function getWindowIcon(id) {
    const iconEl = document.querySelector(`#${id} .win-icon`);
    return iconEl ? iconEl.textContent : '📄';
  }

  // Minimize Window
  function minimizeWindow(win) {
    win.classList.add('minimized');
    win.classList.remove('active-window');
    const id = win.getAttribute('data-window-id');
    const tab = document.querySelector(`.task-tab[data-target-window="${id}"]`);
    if (tab) tab.classList.remove('active-tab');
    playCeramicChime(420, 0.05);
  }

  // Maximize / Restore Window
  function toggleMaximize(win) {
    if (win.classList.contains('maximized')) {
      win.classList.remove('maximized');
      const id = win.getAttribute('data-window-id');
      const cached = windowPosCache[id];
      if (cached) {
        win.style.top = cached.top;
        win.style.left = cached.left;
        win.style.width = cached.width;
        win.style.height = cached.height;
      }
    } else {
      win.classList.add('maximized');
    }
    focusWindow(win);
    playCeramicChime(580, 0.05);
  }

  // Close Window
  function closeWindow(win) {
    win.style.display = 'none';
    win.classList.remove('active-window', 'maximized');
    const id = win.getAttribute('data-window-id');
    removeTaskbarTab(id);
    playCeramicChime(380, 0.07);
  }

  // Taskbar Tab Management
  function createTaskbarTab(id, title) {
    let tab = document.querySelector(`.task-tab[data-target-window="${id}"]`);
    if (!tab) {
      tab = document.createElement('div');
      tab.className = 'task-tab active-tab';
      tab.dataset.targetWindow = id;
      tab.innerHTML = `<span class="tab-icon">${getWindowIcon(id)}</span><span class="tab-label">${title}</span>`;
      tab.addEventListener('click', () => {
        const targetWin = document.getElementById(id);
        if (targetWin.classList.contains('minimized') || targetWin.style.display === 'none') {
          targetWin.style.display = 'flex';
          targetWin.classList.remove('minimized');
          focusWindow(targetWin);
        } else if (targetWin.classList.contains('active-window')) {
          minimizeWindow(targetWin);
        } else {
          focusWindow(targetWin);
        }
      });
      taskbarAppsContainer.appendChild(tab);
    } else {
      tab.classList.add('active-tab');
    }
  }

  function removeTaskbarTab(id) {
    const tab = document.querySelector(`.task-tab[data-target-window="${id}"]`);
    if (tab) {
      tab.remove();
    }
  }

  // Dragging Windows Logic
  windows.forEach((win) => {
    const header = win.querySelector('.window-header');
    if (!header) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;

    header.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest('.win-btn')) return;
      if (win.classList.contains('maximized')) return;

      focusWindow(win);
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = win.offsetLeft;
      initialY = win.offsetTop;

      document.body.style.cursor = 'grabbing';
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Keep within bounds
      let newLeft = Math.max(0, Math.min(window.innerWidth - 100, initialX + dx));
      let newTop = Math.max(40, Math.min(window.innerHeight - 80, initialY + dy));

      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
        header.style.cursor = 'grab';
      }
    });

    // Window click brings to front
    win.addEventListener('mousedown', () => {
      focusWindow(win);
    });

    // Window controls
    const minBtn = win.querySelector('.win-minimize');
    const maxBtn = win.querySelector('.win-maximize');
    const closeBtn = win.querySelector('.win-close');

    if (minBtn) minBtn.addEventListener('click', () => minimizeWindow(win));
    if (maxBtn) maxBtn.addEventListener('click', () => toggleMaximize(win));
    if (closeBtn) closeBtn.addEventListener('click', () => closeWindow(win));
  });

  // Desktop Icons Click / Double Click
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  desktopIcons.forEach(icon => {
    const targetWinId = icon.getAttribute('data-window-target');

    // Single click selects, double click or enter opens
    icon.addEventListener('dblclick', () => {
      openWindow(targetWinId);
    });

    icon.addEventListener('click', () => {
      // Also open on mobile or single click for great accessibility
      if (window.innerWidth <= 768) {
        openWindow(targetWinId);
      }
    });

    icon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        openWindow(targetWinId);
      }
    });
  });

  // Start Menu Toggle
  function toggleStartMenu() {
    if (startMenu.classList.contains('active')) {
      closeStartMenu();
    } else {
      startMenu.classList.add('active');
      playCeramicChime(700, 0.04);
    }
  }

  function closeStartMenu() {
    startMenu.classList.remove('active');
  }

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });

  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
      closeStartMenu();
    }
  });

  // Start Menu App Clicks
  const startItems = document.querySelectorAll('.start-menu-list li');
  startItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-launch-target');
      if (targetId) {
        openWindow(targetId);
      }
    });
  });

  // Close All Windows Button in Start Menu
  const closeAllBtn = document.getElementById('close-all-windows-btn');
  if (closeAllBtn) {
    closeAllBtn.addEventListener('click', () => {
      windows.forEach(win => closeWindow(win));
      closeStartMenu();
    });
  }

  // Show Desktop Button (tray bottom-right)
  const showDesktopBtn = document.getElementById('show-desktop-btn');
  if (showDesktopBtn) {
    showDesktopBtn.addEventListener('click', () => {
      windows.forEach(win => {
        if (win.style.display !== 'none') {
          minimizeWindow(win);
        }
      });
    });
  }

  // Arrange Windows (Tile nicely)
  const arrangeBtn = document.getElementById('arrange-windows-btn');
  if (arrangeBtn) {
    arrangeBtn.addEventListener('click', () => {
      const openWins = windows.filter(w => w.style.display !== 'none' && !w.classList.contains('minimized'));
      if (openWins.length === 0) {
        openWindow('win-intro');
        return;
      }
      openWins.forEach((win, idx) => {
        win.classList.remove('maximized');
        const offset = idx * 36;
        win.style.top = `${60 + offset}px`;
        win.style.left = `${160 + offset}px`;
        focusWindow(win);
      });
      playCeramicChime(540, 0.08);
    });
  }

  // Sound Toggle
  const soundBtn = document.getElementById('toggle-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.querySelector('.sound-icon').textContent = soundEnabled ? '🔔' : '🔕';
      soundBtn.title = soundEnabled ? '사운드 켜짐' : '사운드 꺼짐';
      if (soundEnabled) playCeramicChime(600, 0.05);
    });
  }

  // Theme Toggle (Ceramic warm tone switcher)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('theme-earth');
      playCeramicChime(480, 0.06);
    });
  }

  // Live Tray Clock & Date
  function updateTrayClock() {
    const clockEl = document.getElementById('tray-clock');
    if (!clockEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayStr = days[now.getDay()];

    clockEl.querySelector('.clock-time').textContent = `${hours}:${minutes}:${seconds}`;
    clockEl.querySelector('.clock-date').textContent = `${year}. ${month}. ${date} (${dayStr})`;
  }
  setInterval(updateTrayClock, 1000);
  updateTrayClock();

  // Internal Tab Switcher Logic
  const allTabButtons = document.querySelectorAll('.program-tab');
  allTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentTabBar = btn.closest('.program-tab-bar');
      const parentWindow = btn.closest('.window-body');
      if (!parentTabBar || !parentWindow) return;

      const targetPaneId = btn.getAttribute('data-tab-target');

      // Update button states in same bar
      parentTabBar.querySelectorAll('.program-tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show matching pane
      parentWindow.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      const targetPane = parentWindow.querySelector(`#${targetPaneId}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      playCeramicChime(500, 0.04);
    });
  });

  // Faculty Search Filter
  const facultyInput = document.getElementById('faculty-search-input');
  if (facultyInput) {
    facultyInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('#faculty-list .faculty-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        if (text.includes(query) || tags.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Keyboard shortcut: ESC to close start menu or top window
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (startMenu.classList.contains('active')) {
        closeStartMenu();
      } else if (activeWindowId) {
        const activeWin = document.getElementById(activeWindowId);
        if (activeWin && activeWin.style.display !== 'none') {
          // Don't close if only 1 window is left, just unfocus or close
          closeWindow(activeWin);
        }
      }
    }
  });
});
