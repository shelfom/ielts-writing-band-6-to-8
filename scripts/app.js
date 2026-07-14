// IELTS Writing Practice - App Logic
(function() {
  'use strict';

  var currentTopic = null;
  var timerInterval = null;
  var timerSeconds = 0;
  var timerRunning = false;
  var currentFilter = 'all';
  var currentDiffFilter = 'all';
  var searchQuery = '';
  var saveTimeout = null;

  // Storage
  function getProgress(id) {
    try {
      var data = JSON.parse(localStorage.getItem('ielts_progress_' + id) || '{}');
      return { text: data.text || '', completed: data.completed || false, timeSpent: data.timeSpent || 0 };
    } catch (e) { return { text: '', completed: false, timeSpent: 0 }; }
  }

  function saveProgress(id, text, completed, timeSpent) {
    try { localStorage.setItem('ielts_progress_' + id, JSON.stringify({ text: text, completed: completed, timeSpent: timeSpent })); } catch (e) {}
  }

  function updateCompletedCount() {
    var count = 0;
    for (var i = 0; i < topics.length; i++) {
      if (getProgress(topics[i].id).completed) count++;
    }
    document.getElementById('completedCount').textContent = count;
  }

  // Render topic list
  function renderTopicList() {
    var list = document.getElementById('topicList');
    var filtered = topics.filter(function(t) {
      if (currentFilter !== 'all' && t.task !== currentFilter) return false;
      if (currentDiffFilter !== 'all' && t.difficulty !== currentDiffFilter) return false;
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        if (t.title.toLowerCase().indexOf(q) === -1 && t.category.toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-list">No topics match your filters</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var t = filtered[i];
      var progress = getProgress(t.id);
      var diffDots = t.difficulty === 'easy' ? 1 : t.difficulty === 'medium' ? 2 : 3;
      var dotsHtml = '';
      for (var d = 0; d < 3; d++) {
        dotsHtml += '<span class="diff-dot' + (d < diffDots ? ' filled' : '') + '"></span>';
      }
      var statusHtml = '';
      if (progress.completed) {
        statusHtml = '<div class="status-icon status-completed">&#10003;</div>';
      } else if (progress.text) {
        statusHtml = '<div class="status-icon status-progress">&#9998;</div>';
      }
      var isActive = currentTopic && currentTopic.id === t.id;

      html += '<div class="topic-card' + (isActive ? ' active' : '') + '" onclick="window._app.selectTopic(' + t.id + ')">' +
        '<div class="topic-card-header">' +
        '<span class="topic-badge ' + (t.task === 'task1' ? 'badge-task1' : 'badge-task2') + '">' +
        (t.task === 'task1' ? 'Task 1' : 'Task 2') + '</span>' +
        '<div class="topic-difficulty">' + dotsHtml + '</div></div>' +
        '<div class="topic-card-title">' + t.title + '</div>' +
        '<div class="topic-card-meta"><span>' + t.category + '</span><span>' + t.timeLimit + ' min</span><span>Min ' + t.wordMin + ' words</span></div>' +
        (statusHtml ? '<div class="topic-card-status">' + statusHtml + '</div>' : '') +
        '</div>';
    }
    list.innerHTML = html;
  }

  // Filters
  window.setFilter = function(filter, btn) {
    currentFilter = filter;
    var btns = document.querySelectorAll('[data-filter]');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
    btn.classList.add('active');
    renderTopicList();
  };

  window.setDiffFilter = function(diff, btn) {
    currentDiffFilter = diff;
    var btns = document.querySelectorAll('[data-diff]');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
    btn.classList.add('active');
    renderTopicList();
  };

  window.searchTopics = function(query) {
    searchQuery = query;
    renderTopicList();
  };

  // Select topic
  function selectTopic(id) {
    var topic = null;
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].id === id) { topic = topics[i]; break; }
    }
    if (!topic) return;

    // Stop current timer
    if (timerRunning) toggleTimer();
    timerSeconds = 0;
    updateTimerDisplay();

    currentTopic = topic;
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('workspace').classList.add('active');

    // Populate topic detail
    document.getElementById('detailTitle').textContent = topic.title;
    document.getElementById('detailMeta').innerHTML =
      '<span class="meta-tag">' + (topic.task === 'task1' ? 'Task 1' : 'Task 2') + '</span>' +
      '<span class="meta-tag">' + topic.category + '</span>' +
      '<span class="meta-tag">' + topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1) + '</span>' +
      '<span>' + topic.timeLimit + ' minutes</span>';
    document.getElementById('detailPrompt').textContent = topic.prompt;
    document.getElementById('wordTarget').textContent = '/ min ' + topic.wordMin;

    // Load saved writing
    var saved = getProgress(topic.id);
    document.getElementById('writingTextarea').value = saved.text || '';
    updateWordCount();

    // Update sidebar
    renderTopicList();

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('active');
    }
  }

  // Timer
  function toggleTimer() {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('timerBtn').textContent = 'Start';
      document.getElementById('timerBtn').classList.remove('running');
    } else {
      timerRunning = true;
      document.getElementById('timerBtn').textContent = 'Pause';
      document.getElementById('timerBtn').classList.add('running');
      timerInterval = setInterval(function() {
        timerSeconds++;
        updateTimerDisplay();
        if (currentTopic && timerSeconds >= currentTopic.timeLimit * 60) {
          clearInterval(timerInterval);
          timerRunning = false;
          document.getElementById('timerBtn').textContent = 'Start';
          document.getElementById('timerBtn').classList.remove('running');
          alert('Time is up! You have used all ' + currentTopic.timeLimit + ' minutes.');
        }
      }, 1000);
    }
  }

  function updateTimerDisplay() {
    var total = currentTopic ? currentTopic.timeLimit * 60 : 1200;
    var remaining = Math.max(0, total - timerSeconds);
    var mins = Math.floor(remaining / 60);
    var secs = remaining % 60;
    var textEl = document.getElementById('timerText');
    var progressEl = document.getElementById('timerProgress');

    textEl.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

    var circumference = 106.81;
    var offset = circumference * (timerSeconds / total);
    progressEl.setAttribute('stroke-dashoffset', Math.min(offset, circumference));

    var pct = timerSeconds / total;
    textEl.className = 'timer-text';
    progressEl.className = 'timer-ring-progress';
    if (pct >= 0.9) { textEl.classList.add('danger'); progressEl.classList.add('danger'); }
    else if (pct >= 0.75) { textEl.classList.add('warning'); progressEl.classList.add('warning'); }
  }

  // Word count
  function updateWordCount() {
    var text = document.getElementById('writingTextarea').value.trim();
    var words = text ? text.split(/\s+/).length : 0;
    var el = document.getElementById('wordCount');
    el.textContent = words;
    var min = currentTopic ? currentTopic.wordMin : 150;
    el.className = 'word-count-num';
    if (words === 0) { el.className = 'word-count-num'; }
    else if (words < min * 0.7) { el.classList.add('low'); }
    else if (words < min) { el.classList.add('ok'); }
    else { el.classList.add('good'); }
  }

  // Writing handler
  window.handleWriting = function() {
    updateWordCount();
    var statusEl = document.getElementById('saveStatus');
    statusEl.innerHTML = '<span class="save-dot" style="background:var(--accent)"></span> Saving...';
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() {
      if (currentTopic) {
        var text = document.getElementById('writingTextarea').value;
        var progress = getProgress(currentTopic.id);
        saveProgress(currentTopic.id, text, progress.completed, timerSeconds);
        statusEl.innerHTML = '<span class="save-dot"></span> Saved';
        renderTopicList();
      }
    }, 800);
  };

  // Actions
  window.clearWriting = function() {
    if (!currentTopic) return;
    if (!confirm('Clear your writing? This cannot be undone.')) return;
    document.getElementById('writingTextarea').value = '';
    saveProgress(currentTopic.id, '', false, 0);
    timerSeconds = 0;
    updateTimerDisplay();
    updateWordCount();
    renderTopicList();
    updateCompletedCount();
  };

  window.markComplete = function() {
    if (!currentTopic) return;
    var text = document.getElementById('writingTextarea').value;
    if (!text.trim()) { alert('Please write something before marking as complete.'); return; }
    saveProgress(currentTopic.id, text, true, timerSeconds);
    updateCompletedCount();
    renderTopicList();
    alert('Topic marked as complete!');
  };

  // Model answer
  window.showModelAnswer = function() {
    if (!currentTopic) return;
    var body = document.getElementById('modelBody');
    var paragraphs = currentTopic.modelAnswer.split('\n\n');
    var html = '';
    for (var i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].trim()) html += '<p>' + paragraphs[i].trim() + '</p>';
    }
    body.innerHTML = html;
    document.getElementById('modelModal').classList.add('active');
  };

  window.closeModal = function() {
    document.getElementById('modelModal').classList.remove('active');
  };

  // Scoring guide
  window.showScoringGuide = function() {
    if (!currentTopic) return;
    var criteria = scoringCriteria[currentTopic.task];
    var html = '';
    for (var i = 0; i < criteria.length; i++) {
      html += '<div class="criteria-item">' +
        '<div class="criteria-name">' + criteria[i].name + '</div>' +
        '<div class="criteria-desc">' + criteria[i].desc + '</div></div>';
    }
    document.getElementById('scoringBody').innerHTML = html;
    document.getElementById('scoringPanel').classList.add('active');
  };

  window.closeScoring = function() {
    document.getElementById('scoringPanel').classList.remove('active');
  };

  // Sidebar toggle
  window.toggleSidebar = function() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  };

  // Toggle timer exposed
  window.toggleTimer = toggleTimer;

  // Close modals on overlay click
  document.getElementById('modelModal').addEventListener('click', function(e) {
    if (e.target === this) window.closeModal();
  });
  document.getElementById('scoringPanel').addEventListener('click', function(e) {
    if (e.target === this) window.closeScoring();
  });

  // Expose selectTopic
  window._app = { selectTopic: selectTopic };

  // Init
  document.getElementById('totalCount').textContent = topics.length;
  updateCompletedCount();
  renderTopicList();
})();
