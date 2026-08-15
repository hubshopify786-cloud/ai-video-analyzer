require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Map common YouTube category IDs to human-readable names
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

// Extract video ID from common YouTube URL formats
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

// Fetch video data from YouTube API
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
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
    categoryId: video.snippet.categoryId
  };
}

// Estimate metrics from real video data using simple rules
function estimateMetrics(videoData) {
  const categoryName = categoryMap[videoData.categoryId] || 'Unknown';
  const viewCount = parseInt(videoData.viewCount) || 0;
  const publishedAt = new Date(videoData.publishedAt);
  const daysSincePublished = Math.max(
    1,
    Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24))
  );
  const viewsPerDay = viewCount / daysSincePublished;

  // Niche potential by category
  let niche = 'Medium';
  if (['Education', 'Science & Technology', 'Howto & Style', 'News & Politics'].includes(categoryName)) {
    niche = 'High';
  } else if (['Music', 'Film & Animation', 'Autos & Vehicles'].includes(categoryName)) {
    niche = 'Low';
  }

  // Competition and saturation by view count
  let competition = 'Low';
  if (viewCount > 1000000) competition = 'High';
  else if (viewCount > 100000) competition = 'Medium';

  let saturation = 'Low';
  if (viewCount > 2000000) saturation = 'High';
  else if (viewCount > 200000) saturation = 'Medium';

  // Estimated RPM by category (rough industry averages)
  let rpm = '$3.50';
  if (['Education', 'Science & Technology', 'News & Politics'].includes(categoryName)) {
    rpm = '$8.00';
  } else if (['Gaming', 'Entertainment', 'Comedy'].includes(categoryName)) {
    rpm = '$4.00';
  } else if (['Music', 'Film & Animation'].includes(categoryName)) {
    rpm = '$2.00';
  }

  // Growth potential based on views per day
  let growth = 'Moderate';
  if (viewsPerDay > 5000) growth = 'Strong';
  else if (viewsPerDay < 500) growth = 'Weak';

  return {
    niche,
    audience: viewCount.toLocaleString(),
    competition,
    saturation,
    rpm,
    growth
  };
}

// /analyze endpoint
app.post('/analyze', async (req, res) => {
  const videoUrl = req.body.videoUrl;
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const videoData = await getYouTubeVideoData(videoId);
    const metrics = estimateMetrics(videoData);

    res.json({
      url: videoUrl,
      video: videoData,
      metrics,
      tools: [
        { name: 'Cutwise', purpose: 'AI video editing' },
        { name: 'VoiceSynth', purpose: 'AI voiceover' },
        { name: 'ThumbnailPro', purpose: 'AI thumbnails' },
        { name: 'ScriptFlow', purpose: 'AI script writing' },
        { name: 'TrendRadar', purpose: 'Trend discovery' },
        { name: 'Captionly', purpose: 'Auto captions' }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze video. Make sure the URL is valid and the API key is correct.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});