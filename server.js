require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Map common YouTube category IDs (fallback)
const categoryMap = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism'
};

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

async function getYouTubeVideoData(videoId) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  return {
    title: video.snippet.title,
    channel: video.snippet.channelTitle,
    description: video.snippet.description || '',
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
    categoryId: video.snippet.categoryId
  };
}
function formatAudienceSize(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}
// Fallback rule-based estimates (same as before)
function estimateMetrics(videoData) {
  const categoryName = categoryMap[videoData.categoryId] || 'Unknown';
  const viewCount = parseInt(videoData.viewCount) || 0;
  const publishedAt = new Date(videoData.publishedAt);
  const daysSincePublished = Math.max(1, Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)));
  const viewsPerDay = viewCount / daysSincePublished;

  let niche = 'Medium';
  if (['Education', 'Science & Technology', 'Howto & Style', 'News & Politics'].includes(categoryName)) {
    niche = 'High';
  } else if (['Music', 'Film & Animation', 'Autos & Vehicles'].includes(categoryName)) {
    niche = 'Low';
  }

  let competition = 'Low';
  if (viewCount > 1000000) competition = 'High';
  else if (viewCount > 100000) competition = 'Medium';

  let saturation = 'Low';
  if (viewCount > 2000000) saturation = 'High';
  else if (viewCount > 200000) saturation = 'Medium';

  let rpm = '$3.50';
  if (['Education', 'Science & Technology', 'News & Politics'].includes(categoryName)) {
    rpm = '$8.00';
  } else if (['Gaming', 'Entertainment', 'Comedy'].includes(categoryName)) {
    rpm = '$4.00';
  } else if (['Music', 'Film & Animation'].includes(categoryName)) {
    rpm = '$2.00';
  }
     let growth = 'Moderate';
  if (viewsPerDay > 5000) growth = 'Strong';
  else if (viewsPerDay < 500) growth = 'Weak';

  const estimatedNicheAudience = viewCount * 20;

  return {
    niche,
    audience: formatAudienceSize(estimatedNicheAudience),
    competition,
    saturation,
    rpm,
    growth
  };
}

// Call OpenRouter API to analyze video metadata
async function analyzeWithOpenRouter(videoData) {
  const prompt = `
You are an expert content strategy analyst. Given the following YouTube video metadata, provide realistic estimates for:
- Niche potential (High, Medium, Low)
- - Audience size: estimated total global audience interested in this niche (not just this video's views). Provide as a string, e.g. "2.5M" or "850K".
- Competition (High, Medium, Low)
- Creator saturation (High, Medium, Low)
- Estimated RPM (as a string, e.g. "$8.50")
- Growth potential (Strong, Moderate, Weak)
- Likely AI tools used to create the video (list 4-6 tools with name and purpose)

Return ONLY valid JSON in this exact shape:
{
  "metrics": {
    "niche": "string",
    "audience": "string",
    "competition": "string",
    "saturation": "string",
    "rpm": "string",
    "growth": "string"
  },
  "tools": [
    { "name": "string", "purpose": "string" }
  ]
}

Video metadata:
Title: ${videoData.title}
Channel: ${videoData.channel}
Description: ${videoData.description}
Category ID: ${videoData.categoryId}
Views: ${videoData.viewCount}
Likes: ${videoData.likeCount}
Published: ${videoData.publishedAt}
`;

  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('OpenRouter API request failed');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Extract JSON from the response (may be wrapped in code fences)
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return parsed;
}

app.post('/analyze', async (req, res) => {
  const videoUrl = req.body.videoUrl;
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const videoData = await getYouTubeVideoData(videoId);
    let analysis;

    try {
      // Try AI analysis first
      analysis = await analyzeWithOpenRouter(videoData);
    } catch (aiError) {
      console.warn('AI analysis failed, falling back to rule-based:', aiError.message);
      analysis = {
        metrics: estimateMetrics(videoData),
        tools: [
          { name: 'Cutwise', purpose: 'AI video editing' },
          { name: 'VoiceSynth', purpose: 'AI voiceover' },
          { name: 'ThumbnailPro', purpose: 'AI thumbnails' },
          { name: 'ScriptFlow', purpose: 'AI script writing' },
          { name: 'TrendRadar', purpose: 'Trend discovery' },
          { name: 'Captionly', purpose: 'Auto captions' }
        ]
      };
    }

        // Override audience size with our own niche estimate
    // to avoid showing raw video views from the AI model.
    const viewCountForAudience = parseInt(videoData.viewCount) || 0;
    const estimatedNicheAudience = viewCountForAudience * 20;
    analysis.metrics.audience = formatAudienceSize(estimatedNicheAudience);
    res.json({
      url: videoUrl,
      video: videoData,
      metrics: analysis.metrics,
      tools: analysis.tools
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze video. Make sure the URL is valid and API keys are correct.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});