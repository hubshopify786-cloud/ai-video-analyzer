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

// Tools container
const toolsContainer = document.getElementById('toolsContainer');

// Render tools from server response
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

  // Show loading, hide dashboard
  loading.hidden = false;
  dashboard.hidden = true;

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

videoUrlInput.addEventListener('input', function () {
  errorMsg.hidden = true;
});