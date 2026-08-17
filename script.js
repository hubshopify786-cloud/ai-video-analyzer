// Screen management
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.style.display = 'none';
  });
  document.getElementById('screen-' + id).style.display = 'block';
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

// Loading state management
function setLoading(isLoading) {
  const btn = document.getElementById('analyzeBtn');
  const loadingState = document.getElementById('loadingState');

  if (isLoading) {
    btn.disabled = true;
    btn.textContent = 'Analyzing…';
    loadingState.style.display = 'block';
  } else {
    btn.disabled = false;
    btn.textContent = 'Analyze Channel →';
    loadingState.style.display = 'none';
  }
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
  setLoading(true);

  try {
    const response = await fetch('/clone-channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelUrl: url })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.status === 'disqualified') {
      showDisqualified(data.reasons);
    } else {
      populateResults(data);
      showScreen('results');
    }
  } catch (error) {
    console.error(error);
    // Show error in landing screen
    const errorMsg = error.message || 'Failed to analyze channel. Make sure the URL is valid and API key is correct.';
    alert(errorMsg);
  } finally {
    setLoading(false);
  }
}

// Show disqualified screen
function showDisqualified(reasons) {
  const reasonEl = document.getElementById('disqualReason');
  reasonEl.textContent = reasons.join('\n\n');
  showScreen('disqualified');
}

// Populate results screen
function populateResults(data) {
  // Hero channel card
  document.getElementById('resultNiche').textContent = data.niche + ' • Production System';
  document.getElementById('resultHeadline').textContent = 'One Video a Week = ' + data.revenueRange + '/Month';
  document.getElementById('resultFormat').textContent = data.format;
  document.getElementById('statSubs').textContent = formatSubscribers(data.subscribers);
  document.getElementById('statVideos').textContent = data.videoCount;
  document.getElementById('statRevenue').textContent = data.revenueRange;
  document.getElementById('statCadence').textContent = data.cadence;

  // Channel reference
  document.getElementById('channelRef').innerHTML =
    '<strong>Channel Name:</strong> <a href="' + data.channelUrl + '" target="_blank" rel="noopener noreferrer">' + data.channelUrl + '</a>';

  // Summary line
  document.getElementById('channelSummaryLine').textContent =
    data.videoCount + ' videos → ' + formatSubscribers(data.subscribers) + ' subscribers → est. ' + data.revenueRange + '/month → ' + data.cadence + ' uploads';

  // Why it works
  document.getElementById('whyItWorks').innerHTML =
    '<strong>Why it works:</strong> ' + data.whyItWorks;

  // Prompts
  const prompts = data.prompts;
  document.getElementById('prompt1').textContent = prompts.step1;
  document.getElementById('prompt2').textContent = prompts.step2;
  document.getElementById('prompt3').textContent = prompts.step3;
  document.getElementById('prompt4').textContent = prompts.step4;
  document.getElementById('prompt5').textContent = prompts.step5;
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

// Export workflow as .txt
function exportWorkflow() {
  const prompts = [
    document.getElementById('prompt1').textContent,
    document.getElementById('prompt2').textContent,
    document.getElementById('prompt3').textContent,
    document.getElementById('prompt4').textContent,
    document.getElementById('prompt5').textContent
  ];

  const steps = [
    'STEP 1 — TOPIC PROMPT',
    'STEP 2 — SCRIPT PROMPT',
    'STEP 3 — IMAGE PROMPT',
    'STEP 4 — VOICE SETTINGS',
    'STEP 5 — ASSEMBLY WORKFLOW'
  ];

  let content = 'CLONETHIS — AI CHANNEL CLONING ENGINE\n';
  content += 'Generated Workflow Export\n';
  content += '='.repeat(50) + '\n\n';

  prompts.forEach((prompt, i) => {
    content += steps[i] + '\n';
    content += '-'.repeat(50) + '\n';
    content += prompt + '\n\n';
  });

  content += '='.repeat(50) + '\n';
  content += 'CloneThis — AI Channel Cloning Engine\n';

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clonethis-workflow.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const channelUrlInput = document.getElementById('channelUrl');

  analyzeBtn.addEventListener('click', () => {
    const url = channelUrlInput.value.trim();
    if (!url) {
      alert('Please paste a YouTube channel URL or handle first.');
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
    // Clear any previous error styling if needed
  });
});

// Initialize on landing screen
showScreen('landing');