const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const dashboard = document.getElementById('dashboard');
const videoUrlInput = document.getElementById('videoUrl');
const urlDisplay = document.getElementById('urlDisplay');
const errorMsg = document.getElementById('errorMsg');

const metricNiche = document.getElementById('metricNiche');
const metricAudience = document.getElementById('metricAudience');
const metricCompetition = document.getElementById('metricCompetition');
const metricSaturation = document.getElementById('metricSaturation');
const metricRPM = document.getElementById('metricRPM');
const metricGrowth = document.getElementById('metricGrowth');

const videoTitle = document.getElementById('videoTitle');
const videoChannel = document.getElementById('videoChannel');
const videoStats = document.getElementById('videoStats');

const channelForm = document.getElementById('channelForm');
const channelUrlInput = document.getElementById('channelUrl');
const channelError = document.getElementById('channelError');
const analyzeChannelBtn = document.getElementById('analyzeChannelBtn');
const channelLoading = document.getElementById('channelLoading');
const channelDashboard = document.getElementById('channelDashboard');
const channelTitle = document.getElementById('channelTitle');
const channelStats = document.getElementById('channelStats');
const channelToolsContainer = document.getElementById('channelToolsContainer');

const compareChannel1 = document.getElementById('compareChannel1');
const compareChannel2 = document.getElementById('compareChannel2');
const compareError = document.getElementById('compareError');
const compareBtn = document.getElementById('compareBtn');
const compareLoading = document.getElementById('compareLoading');
const compareDashboard = document.getElementById('compareDashboard');
const compareTitle1 = document.getElementById('compareTitle1');
const compareStats1 = document.getElementById('compareStats1');
const compareTools1 = document.getElementById('compareTools1');
const compareTitle2 = document.getElementById('compareTitle2');
const compareStats2 = document.getElementById('compareStats2');
const compareTools2 = document.getElementById('compareTools2');

const toolsContainer = document.getElementById('toolsContainer');
const detectedToolsContainer = document.getElementById('detectedToolsContainer');

function renderDetectedTools(detectedTools) {
  detectedToolsContainer.innerHTML = '';

  if (detectedTools.length === 0) {
    detectedToolsContainer.innerHTML = '<p style="color: #b0b3b8;">No tools detected in the description.</p>';
    return;
  }

  detectedTools.forEach(function (tool) {
    const toolDiv = document.createElement('div');
    toolDiv.className = 'tool';

    const toolName = document.createElement('h3');
    toolName.textContent = tool.name;

    const toolCategory = document.createElement('p');
    toolCategory.textContent = tool.category;

    const confidence = document.createElement('span');
    confidence.textContent = '✓ Confirmed';
    confidence.style.color = '#4ade80';
    confidence.style.fontSize = '0.8rem';
    confidence.style.fontWeight = '600';

    toolDiv.appendChild(toolName);
    toolDiv.appendChild(toolCategory);
    toolDiv.appendChild(confidence);

    detectedToolsContainer.appendChild(toolDiv);
  });
}

function renderChannelTools(tools) {
  channelToolsContainer.innerHTML = '';

  if (tools.length === 0) {
    channelToolsContainer.innerHTML = '<p style="color: #b0b3b8;">No known tools detected in recent videos.</p>';
    return;
  }

  tools.forEach(function (tool) {
    const toolDiv = document.createElement('div');
    toolDiv.className = 'tool';

    const toolName = document.createElement('h3');
    toolName.textContent = tool.name;

    const toolCategory = document.createElement('p');
    toolCategory.textContent = tool.category;

    const count = document.createElement('p');
    count.textContent = `Found in ${tool.count} video(s)`;
    count.style.color = '#4ade80';
    count.style.fontWeight = '600';

    toolDiv.appendChild(toolName);
    toolDiv.appendChild(toolCategory);
    toolDiv.appendChild(count);

    channelToolsContainer.appendChild(toolDiv);
  });
}

function renderTools(tools) {
  toolsContainer.innerHTML = '';

  tools.forEach(function (tool) {
    const toolDiv = document.createElement('div');
    toolDiv.className = 'tool';

    const toolName = document.createElement('h3');
    toolName.textContent = tool.name;

    const toolPurpose = document.createElement('p');
    toolPurpose.textContent = tool.purpose;

    toolDiv.appendChild(toolName);
    toolDiv.appendChild(toolPurpose);

    toolsContainer.appendChild(toolDiv);
  });
}

function renderCompareTools(container, tools, sharedNames, videosAnalyzed) {
  container.innerHTML = '';

  if (tools.length === 0) {
    container.innerHTML = '<p style="color: #b0b3b8; text-align: center;">No known tools detected.</p>';
    return;
  }

  const safeVideos = Math.max(1, videosAnalyzed);

  tools.forEach(function (tool) {
    const toolDiv = document.createElement('div');
    toolDiv.className = 'tool';

    const toolName = document.createElement('h3');
    toolName.textContent = tool.name;

    const isShared = sharedNames.includes(tool.name);
    const badge = document.createElement('span');
    badge.textContent = isShared ? 'Shared' : 'Unique';
    badge.className = isShared ? 'badge shared' : 'badge unique';
    toolName.appendChild(badge);

    const toolCategory = document.createElement('p');
    toolCategory.textContent = tool.category;

    const percentage = Math.round((tool.count / safeVideos) * 100);
    const count = document.createElement('p');
    count.textContent = `Found in ${tool.count} video(s) (${percentage}%)`;
    count.style.color = '#4ade80';
    count.style.fontWeight = '600';

    toolDiv.appendChild(toolName);
    toolDiv.appendChild(toolCategory);
    toolDiv.appendChild(count);

    container.appendChild(toolDiv);
  });
}

analyzeBtn.addEventListener('click', async function () {
  const videoUrl = videoUrlInput.value.trim();

  if (videoUrl === '') {
    errorMsg.textContent = 'Please paste a video URL first.';
    errorMsg.hidden = false;
    return;
  }

  errorMsg.hidden = true;
  urlDisplay.textContent = `Video URL: ${videoUrl}`;

  loading.hidden = false;
  dashboard.hidden = true;
  channelDashboard.hidden = true;
  compareDashboard.hidden = true;

  try {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ videoUrl })
    });

    const data = await response.json();

    if (data.video) {
      videoTitle.textContent = data.video.title;
      videoChannel.textContent = `Channel: ${data.video.channel}`;
      videoStats.textContent = `Views: ${Number(data.video.viewCount).toLocaleString()} | Likes: ${Number(data.video.likeCount).toLocaleString()} | Published: ${new Date(data.video.publishedAt).toLocaleDateString()}`;
    } else {
      videoTitle.textContent = 'No video data';
      videoChannel.textContent = '';
      videoStats.textContent = '';
    }

    metricNiche.textContent = data.metrics.niche;
    metricAudience.textContent = data.metrics.audience;
    metricCompetition.textContent = data.metrics.competition;
    metricSaturation.textContent = data.metrics.saturation;
    metricRPM.textContent = data.metrics.rpm;
    metricGrowth.textContent = data.metrics.growth;

    renderDetectedTools(data.detectedTools);
    renderTools(data.tools);

    loading.hidden = true;
    dashboard.hidden = false;
  } catch (error) {
    loading.hidden = true;
    errorMsg.textContent = 'Something went wrong. Is the server running?';
    errorMsg.hidden = false;
    console.error(error);
  }
});

analyzeChannelBtn.addEventListener('click', async function () {
  const channelUrl = channelUrlInput.value.trim();

  if (channelUrl === '') {
    channelError.textContent = 'Please paste a channel URL or handle first.';
    channelError.hidden = false;
    return;
  }

  channelError.hidden = true;

  dashboard.hidden = true;
  channelDashboard.hidden = true;
  compareDashboard.hidden = true;
  loading.hidden = true;
  channelLoading.hidden = false;

  try {
    const response = await fetch('/analyze-channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channelUrl })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    channelTitle.textContent = data.channel.title;
    channelStats.textContent = `Subscribers: ${Number(data.channel.subscriberCount).toLocaleString()} | Videos: ${Number(data.channel.videoCount).toLocaleString()} | Analyzed: ${data.videosAnalyzed}`;

    renderChannelTools(data.detectedTools);

    channelLoading.hidden = true;
    channelDashboard.hidden = false;
  } catch (error) {
    channelLoading.hidden = true;
    channelError.textContent = error.message || 'Something went wrong. Is the server running?';
    channelError.hidden = false;
    console.error(error);
  }
});

compareBtn.addEventListener('click', async function () {
  const channel1 = compareChannel1.value.trim();
  const channel2 = compareChannel2.value.trim();

  if (channel1 === '' || channel2 === '') {
    compareError.textContent = 'Please paste both channel URLs or handles.';
    compareError.hidden = false;
    return;
  }

  compareError.hidden = true;

  dashboard.hidden = true;
  channelDashboard.hidden = true;
  compareDashboard.hidden = true;
  loading.hidden = true;
  channelLoading.hidden = true;
  compareLoading.hidden = false;

  try {
    const response = await fetch('/compare-channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel1, channel2 })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const tools1 = data.channel1.detectedTools;
    const tools2 = data.channel2.detectedTools;

    const names1 = tools1.map(t => t.name);
    const names2 = tools2.map(t => t.name);
    const sharedNames = names1.filter(name => names2.includes(name));

    compareTitle1.textContent = data.channel1.title;
    compareStats1.textContent = `Subscribers: ${Number(data.channel1.subscriberCount).toLocaleString()} | Videos Analyzed: ${data.channel1.videosAnalyzed}`;
    renderCompareTools(compareTools1, tools1, sharedNames, data.channel1.videosAnalyzed);

    compareTitle2.textContent = data.channel2.title;
    compareStats2.textContent = `Subscribers: ${Number(data.channel2.subscriberCount).toLocaleString()} | Videos Analyzed: ${data.channel2.videosAnalyzed}`;
    renderCompareTools(compareTools2, tools2, sharedNames, data.channel2.videosAnalyzed);

    compareLoading.hidden = true;
    compareDashboard.hidden = false;
  } catch (error) {
    compareLoading.hidden = true;
    compareError.textContent = error.message || 'Something went wrong. Is the server running?';
    compareError.hidden = false;
    console.error(error);
  }
});

videoUrlInput.addEventListener('input', function () {
  errorMsg.hidden = true;
});