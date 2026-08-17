// Screen management
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.style.display = 'none';
  });
  document.getElementById('screen-' + id).style.display = 'block';
  window.scrollTo(0, 0);
}

// Format subscriber count (e.g., 292000 -> "292K")
function formatSubscribers(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(0) + 'K';
  }
  return count.toString();
}

// Error display
function showError(message, containerId = 'landingError') {
  const container = document.getElementById(containerId);
  if (container) {
    container.textContent = message;
    container.style.display = 'block';
  }
}

function clearError(containerId = 'landingError') {
  const container = document.getElementById(containerId);
  if (container) {
    container.textContent = '';
    container.style.display = 'none';
  }
}

// Loading state management with progress
let currentAbortController = null;

function setLoading(isLoading, progress = null) {
  const btn = document.getElementById('analyzeBtn');
  const loadingState = document.getElementById('loadingState');

  if (isLoading) {
    btn.disabled = true;
    btn.textContent = progress ? `Analyzing… ${progress}` : 'Analyzing…';
    loadingState.style.display = 'block';
    if (progress) {
      loadingState.textContent = progress;
    }
  } else {
    btn.disabled = false;
    btn.textContent = 'Analyze Channel →';
    loadingState.style.display = 'none';
    loadingState.textContent = 'Analyzing channel… fetching last 30 videos…';
  }
}

function cancelAnalysis() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  setLoading(false);
  showScreen('landing');
}

// Extract channel identifier from URL (for reference, backend also does this)
function extractChannelIdentifier(input) {
  if (!input) return null;
  input = input.trim();

  const handleMatch = input.match(/youtube\.com\/@([^/?]+)/);
  if (handleMatch) return { type: 'handle', value: handleMatch[1] };

  const idMatch = input.match(/youtube\.com\/channel\/([^/?]+)/);
  if (idMatch) return { type: 'id', value: idMatch[1] };

  const cMatch = input.match(/youtube\.com\/c\/([^/?]+)/);
  if (cMatch) return { type: 'handle', value: cMatch[1] };

  if (input.startsWith('@')) return { type: 'handle', value: input.substring(1) };
  if (input.startsWith('UC')) return { type: 'id', value: input };

  return null;
}

// Main analyze function
async function analyzeChannel(url) {
  clearError();
  currentAbortController = new AbortController();
  setLoading(true);

  try {
    const response = await fetch('/analyze-channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelUrl: url }),
      signal: currentAbortController.signal
    });

    currentAbortController = null;

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.status === 'not-supported') {
      showNotSupported(data.reasons, data.warnings);
    } else {
      populateResults(data);
      showScreen('results');
    }
  } catch (error) {
    currentAbortController = null;
    if (error.name === 'AbortError') {
      // User cancelled - silently return
      return;
    }
    console.error(error);
    showError(error.message || 'Failed to analyze channel. Make sure the URL is valid and API key is correct.');
  } finally {
    setLoading(false);
  }
}

// Show not-supported screen
function showNotSupported(reasons, warnings = []) {
  const reasonEl = document.getElementById('disqualReason');
  let content = reasons.join('\n\n');
  if (warnings.length > 0) {
    content += '\n\n⚠ Notes:\n' + warnings.map(w => '• ' + w).join('\n');
  }
  reasonEl.textContent = content;
  showScreen('disqualified');
}

// Populate results screen
function populateResults(data) {
  const card = data.channelCard;
  const prompts = data.prompts;
  const warnings = data.warnings || [];
  const aiDetection = data.aiDetection || {};

  // Hero channel card
  document.getElementById('resultNiche').textContent = card.niche + ' • Creator Roadmap';
  document.getElementById('resultHeadline').textContent = 'Learn their strategy → Build your channel';
  document.getElementById('resultFormat').textContent = card.formatFingerprint;
  document.getElementById('statSubs').textContent = formatSubscribers(card.subscribers);
  document.getElementById('statVideos').textContent = card.videoCount;
  document.getElementById('statRevenue').textContent = card.estimatedMonthlyRevenue;
  document.getElementById('statCadence').textContent = card.uploadCadence;

  // Channel reference
  document.getElementById('channelRef').innerHTML =
    '<strong>Channel Analyzed:</strong> <a href="' + card.url + '" target="_blank" rel="noopener noreferrer">' + card.url + '</a>';

  // Summary line
  document.getElementById('channelSummaryLine').textContent =
    card.videoCount + ' videos → ' + formatSubscribers(card.subscribers) + ' subscribers → est. ' + card.estimatedMonthlyRevenue + '/month → ' + card.uploadCadence + ' uploads';

  // Why it works
  document.getElementById('whyItWorks').innerHTML =
    '<strong>Why this approach works:</strong> ' + card.whyItWorks;

  // AI Detection badge
  if (aiDetection.isLikelyAI) {
    const aiBadge = document.createElement('div');
    aiBadge.style.cssText = 'margin-top:16px; padding:12px 16px; background:rgba(99,214,162,.15); border:1px solid rgba(99,214,162,.3); border-radius:12px; color:#63d6a2; font-weight:600;';
    aiBadge.innerHTML = '🤖 <strong>AI Tools Detected</strong> — This creator uses AI in their workflow (' + aiDetection.aiScore + ' categories: ' + aiDetection.details.map(d => d.category).join(', ') + '). Learn their approach.';
    document.getElementById('whyItWorks').parentNode.insertBefore(aiBadge, document.getElementById('whyItWorks').nextSibling);
  }

  // Warnings
  if (warnings.length > 0) {
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = 'margin-top:16px; padding:12px 16px; background:rgba(255,157,66,.15); border:1px solid rgba(255,157,66,.3); border-radius:12px; color:#ff9d42;';
    warningDiv.innerHTML = '<strong>⚠ Notes:</strong><br>' + warnings.map(w => '• ' + w).join('<br>');
    document.getElementById('whyItWorks').parentNode.insertBefore(warningDiv, document.getElementById('whyItWorks').nextSibling);
  }

  // Prompts
  document.getElementById('prompt1').textContent = prompts.step1.content;
  document.getElementById('prompt2').textContent = prompts.step2.content;
  document.getElementById('prompt3').textContent = prompts.step3.content;
  document.getElementById('prompt4').textContent = prompts.step4.content;
  document.getElementById('prompt5').textContent = prompts.step5.content;
}

// Copy prompt to clipboard
function copyPrompt(btn) {
  const pre = btn.parentElement.querySelector('pre');
  const text = pre.textContent;

  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied ✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    btn.textContent = 'Failed';
    setTimeout(() => {
      btn.textContent = 'Copy';
    }, 2000);
  });
}

// Prefill URL and analyze
function prefillAndAnalyze(url) {
  document.getElementById('channelUrl').value = url;
  showScreen('landing');
  analyzeChannel(url);
}

// Format channel name for export filename
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '');
}

// Export roadmap - supports multiple formats
function exportWorkflow(format = 'txt') {
  const prompts = [
    document.getElementById('prompt1').textContent,
    document.getElementById('prompt2').textContent,
    document.getElementById('prompt3').textContent,
    document.getElementById('prompt4').textContent,
    document.getElementById('prompt5').textContent
  ];

  const steps = [
    'STEP 1 — CONTENT STRATEGY & IDEATION',
    'STEP 2 — SCRIPT STRUCTURE & STORYTELLING',
    'STEP 3 — VISUAL STYLE & IMAGE PROMPTS',
    'STEP 4 — VOICE & AUDIO SETTINGS',
    'STEP 5 — PRODUCTION & ASSEMBLY WORKFLOW'
  ];

  const channelName = document.getElementById('resultNiche')?.textContent?.split(' • ')[0] || 'Unknown Channel';
  const niche = sanitizeFilename(channelName);

  const disclaimer = '\n\n---\n\nThis roadmap is designed for inspiration and strategic guidance. Use these insights to develop your own unique channel, content, and brand—not to copy or replicate another creator.';

  if (format === 'json') {
    const data = {
      engine: 'CreatorRoadmap — Learn From Successful Channels',
      channel: channelName,
      exportedAt: new Date().toISOString(),
      disclaimer: 'This roadmap is designed for inspiration and strategic guidance. Use these insights to develop your own unique channel, content, and brand—not to copy or replicate another creator.',
      steps: prompts.map((prompt, i) => ({
        step: i + 1,
        title: steps[i],
        content: prompt
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creatorroadmap-${niche}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'md') {
    let content = `# CreatorRoadmap — Strategic Channel Roadmap\n\n`;
    content += `**Channel Analyzed:** ${channelName}\n`;
    content += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    content += `---\n\n`;

    prompts.forEach((prompt, i) => {
      content += `## ${steps[i]}\n\n`;
      content += prompt + '\n\n';
    });

    content += '---\n\n> **Disclaimer:** This roadmap is designed for inspiration and strategic guidance. Use these insights to develop your own unique channel, content, and brand—not to copy or replicate another creator.\n';

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creatorroadmap-${niche}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  // Default: txt
  let content = 'CREATORROADMAP — STRATEGIC CHANNEL ROADMAP\n';
  content += 'Learn From Successful Channels\n';
  content += '='.repeat(50) + '\n\n';
  content += `Channel: ${channelName}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n\n`;

  prompts.forEach((prompt, i) => {
    content += steps[i] + '\n';
    content += '-'.repeat(50) + '\n';
    content += prompt + '\n\n';
  });

  content += disclaimer + '\n';

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `creatorroadmap-${niche}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const channelUrlInput = document.getElementById('channelUrl');
  const exportBtn = document.getElementById('exportBtn');
  const exportDropdown = document.getElementById('exportDropdown');

  analyzeBtn.addEventListener('click', () => {
    const url = channelUrlInput.value.trim();
    if (!url) {
      showError('Please paste a YouTube channel URL or handle first.');
      channelUrlInput.focus();
      return;
    }
    analyzeChannel(url);
  });

  channelUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      analyzeBtn.click();
    }
  });

  channelUrlInput.addEventListener('input', () => {
    clearError();
  });

  // Export dropdown toggle
  if (exportBtn && exportDropdown) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown.style.display = exportDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!exportBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
        exportDropdown.style.display = 'none';
      }
    });
  }

  // Export dropdown handlers
  const exportOptions = document.querySelectorAll('.export-option');
  exportOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.preventDefault();
      exportWorkflow(opt.dataset.format);
      if (exportDropdown) exportDropdown.style.display = 'none';
    });
  });
});

// Initialize on landing screen
showScreen('landing');