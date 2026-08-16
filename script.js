const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const dashboard = document.getElementById('dashboard');
const videoUrlInput = document.getElementById('videoUrl');
const urlDisplay = document.getElementById('urlDisplay');
const errorMsg = document.getElementById('errorMsg');

// Metric elements
const metricNiche = document.getElementById('metricNiche');
const metricAudience = document.getElementById('metricAudience');
const metricCompetition = document.getElementById('metricCompetition');
const metricSaturation = document.getElementById('metricSaturation');
const metricRPM = document.getElementById('metricRPM');
const metricGrowth = document.getElementById('metricGrowth');

// Video info elements
const videoTitle = document.getElementById('videoTitle');
const videoChannel = document.getElementById('videoChannel');
const videoStats = document.getElementById('videoStats');
// Channel analysis elements
const channelForm = document.getElementById('channelForm');
const channelUrlInput = document.getElementById('channelUrl');
const channelError = document.getElementById('channelError');
const analyzeChannelBtn = document.getElementById('analyzeChannelBtn');
const channelLoading = document.getElementById('channelLoading');
const channelDashboard = document.getElementById('channelDashboard');
const channelTitle = document.getElementById('channelTitle');
const channelStats = document.getElementById('channelStats');
const channelToolsContainer = document.getElementById('channelToolsContainer');

// Tools container
const toolsContainer = document.getElementById('toolsContainer');
const detectedToolsContainer = document.getElementById('detectedToolsContainer');

// Render tools from server response
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

analyzeBtn.addEventListener('click', async function () {
  const videoUrl = videoUrlInput.value.trim();

  if (videoUrl === '') {
    errorMsg.textContent = 'Please paste a video URL first.';
    errorMsg.hidden = false;
    return;
  }

  errorMsg.hidden = true;
  urlDisplay.textContent = `Video URL: ${videoUrl}`;

  // Show loading, hide dashboard and channel dashboard
  loading.hidden = false;
  dashboard.hidden = true;
  channelDashboard.hidden = true;

  try {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ videoUrl })
    });

    const data = await response.json();

    // Update video info
    if (data.video) {
      videoTitle.textContent = data.video.title;
      videoChannel.textContent = `Channel: ${data.video.channel}`;
      videoStats.textContent = `Views: ${Number(data.video.viewCount).toLocaleString()} | Likes: ${Number(data.video.likeCount).toLocaleString()} | Published: ${new Date(data.video.publishedAt).toLocaleDateString()}`;
    } else {
      videoTitle.textContent = 'No video data';
      videoChannel.textContent = '';
      videoStats.textContent = '';
    }

    // Update metrics with server response
    metricNiche.textContent = data.metrics.niche;
    metricAudience.textContent = data.metrics.audience;
    metricCompetition.textContent = data.metrics.competition;
    metricSaturation.textContent = data.metrics.saturation;
    metricRPM.textContent = data.metrics.rpm;
    metricGrowth.textContent = data.metrics.growth;

            // Render detected tools from description
    renderDetectedTools(data.detectedTools);

    // Render tools from server
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

  // Hide video dashboard, show channel loading
  dashboard.hidden = true;
  channelDashboard.hidden = true;
  loading.hidden = true; // hide video loading if any
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

    // Update channel info
    channelTitle.textContent = data.channel.title;
    channelStats.textContent = `Subscribers: ${Number(data.channel.subscriberCount).toLocaleString()} | Videos: ${Number(data.channel.videoCount).toLocaleString()} | Analyzed: ${data.videosAnalyzed}`;

    // Render detected tools
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
videoUrlInput.addEventListener('input', function () {
  errorMsg.hidden = true;
});