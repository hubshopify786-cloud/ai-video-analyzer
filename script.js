const channelUrlInput = document.getElementById('channelUrl');
const channelError = document.getElementById('channelError');
const cloneBtn = document.getElementById('cloneBtn');
const loading = document.getElementById('loading');

const disqualifiedDashboard = document.getElementById('disqualifiedDashboard');
const reasonsList = document.getElementById('reasonsList');
const suggestionsContainer = document.getElementById('suggestionsContainer');

const cloneDashboard = document.getElementById('cloneDashboard');
const channelName = document.getElementById('channelName');
const confidenceBadge = document.getElementById('confidenceBadge');
const channelStats = document.getElementById('channelStats');
const channelRevenue = document.getElementById('channelRevenue');
const channelNiche = document.getElementById('channelNiche');
const metricFormat = document.getElementById('metricFormat');
const metricPacing = document.getElementById('metricPacing');
const metricVisual = document.getElementById('metricVisual');
const whyItWorks = document.getElementById('whyItWorks');
const toolStackContainer = document.getElementById('toolStackContainer');
const promptsContainer = document.getElementById('promptsContainer');

function hideAllDashboards() {
  disqualifiedDashboard.hidden = true;
  cloneDashboard.hidden = true;
}

function renderReasons(reasons) {
  reasonsList.innerHTML = '';
  reasons.forEach(function (reason) {
    const li = document.createElement('li');
    li.textContent = reason;
    reasonsList.appendChild(li);
  });
}

function renderSuggestions(suggestions) {
  suggestionsContainer.innerHTML = '';
  if (!suggestions || suggestions.length === 0) return;

  suggestions.forEach(function (s) {
    const card = document.createElement('div');
    card.className = 'tool';

    const name = document.createElement('h3');
    name.textContent = s.name;

    const niche = document.createElement('p');
    niche.textContent = s.niche;

    const handle = document.createElement('span');
    handle.textContent = s.handle;
    handle.style.display = 'block';
    handle.style.color = 'var(--accent)';
    handle.style.fontSize = '0.8rem';
    handle.style.marginTop = '6px';

    card.appendChild(name);
    card.appendChild(niche);
    card.appendChild(handle);
    suggestionsContainer.appendChild(card);
  });
}

function renderToolStack(tools) {
  toolStackContainer.innerHTML = '';
  if (!tools || tools.length === 0) {
    toolStackContainer.innerHTML = '<p style="color: var(--text-secondary);">No tool stack defined for this niche.</p>';
    return;
  }

  tools.forEach(function (tool) {
    const card = document.createElement('div');
    card.className = 'tool';

    const toolName = document.createElement('h3');
    toolName.textContent = tool.name;

    const purpose = document.createElement('p');
    purpose.textContent = tool.purpose;

    card.appendChild(toolName);
    card.appendChild(purpose);
    toolStackContainer.appendChild(card);
  });
}

function renderPrompts(prompts) {
  promptsContainer.innerHTML = '';
  const keys = ['step1', 'step2', 'step3', 'step4', 'step5'];

  keys.forEach(function (key) {
    const step = prompts[key];
    if (!step) return;

    const card = document.createElement('div');
    card.className = 'prompt-card';

    const title = document.createElement('h3');
    title.textContent = step.title;

    const content = document.createElement('pre');
    content.textContent = step.content;

    card.appendChild(title);
    card.appendChild(content);
    promptsContainer.appendChild(card);
  });
}

function renderDisqualified(data) {
  hideAllDashboards();
  renderReasons(data.reasons || []);
  renderSuggestions(data.suggestions);
  disqualifiedDashboard.hidden = false;
}

function renderQualified(data) {
  hideAllDashboards();
  const card = data.channelCard;

  channelName.textContent = card.name;
  confidenceBadge.textContent = card.confidence.charAt(0).toUpperCase() + card.confidence.slice(1);
  confidenceBadge.className = 'badge confidence ' + card.confidence;

  channelStats.textContent = `Subscribers: ${Number(card.subscribers).toLocaleString()} · Videos: ${Number(card.videoCount).toLocaleString()} · Upload cadence: ${card.uploadCadence}`;
  channelRevenue.textContent = `Est. monthly revenue: ${card.estimatedMonthlyRevenue}`;
  channelNiche.textContent = `Niche: ${card.niche}`;

  metricFormat.textContent = card.formatFingerprint;
  metricPacing.textContent = card.pacingStyle;
  metricVisual.textContent = card.visualApproach;
  whyItWorks.textContent = card.whyItWorks;

  renderToolStack(card.aiToolStack);
  renderPrompts(data.prompts);

  cloneDashboard.hidden = false;
}

cloneBtn.addEventListener('click', async function () {
  const channelUrl = channelUrlInput.value.trim();

  if (channelUrl === '') {
    channelError.textContent = 'Please paste a channel URL or handle first.';
    channelError.hidden = false;
    return;
  }

  channelError.hidden = true;
  hideAllDashboards();
  loading.hidden = false;

  try {
    const response = await fetch('/clone-channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelUrl })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.status === 'disqualified') {
      renderDisqualified(data);
    } else {
      renderQualified(data);
    }
  } catch (error) {
    channelError.textContent = error.message || 'Something went wrong. Is the server running?';
    channelError.hidden = false;
    console.error(error);
  } finally {
    loading.hidden = true;
  }
});

channelUrlInput.addEventListener('input', function () {
  channelError.hidden = true;
});
