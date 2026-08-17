require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Load tool database (we still use this for tool stack detection)
const toolsDatabase = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tools.json'), 'utf8')
);

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Supported niches with their parameters
const niches = [
  {
    id: 'ancient-mysteries',
    name: 'Ancient Mysteries / Dark History',
    rpm: 9,
    videoLengthMin: 60,
    videoLengthMax: 120,
    keywords: ['mystery', 'mysteries', 'ancient', 'unexplained', 'dark history', 'documentary', 'impossible', 'discoveries'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover (high stability)' },
      { name: 'Midjourney', purpose: 'Cinematic visuals' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'Mid-roll ads across 90 min = 6-8x the ad revenue of a 10-min video. Viewers fall asleep to it and replay. Algorithm loves the watch time.',
    formatFingerprint: '90-100 min chaptered countdown documentary (7-12 mysteries per video)',
    pacingStyle: 'Calm, atmospheric, slow — sleep and background content',
    visualApproach: 'Cinematic stills + Ken Burns slow zoom · muted earth tones · golden hour lighting'
  }
  // Later: finance, true crime, sleep, AI/tech, business
];

// Helper: extract channel identifier (already exists)
function extractChannelIdentifier(input) {
  if (!input) return null;
  input = input.trim();

  const handleMatch = input.match(/youtube\.com\/@([^/?]+)/);
  if (handleMatch) return { type: 'handle', value: handleMatch[1] };

  const idMatch = input.match(/youtube\.com\/channel\/([^/?]+)/);
  if (idMatch) return { type: 'id', value: idMatch[1] };

  const cMatch = input.match(/youtube\.com\/c\/([^/?]+)/);
  if (cMatch) return { type: 'handle', value: cMatch[1] }; // /c/ can be a custom name, treat as handle

  if (input.startsWith('@')) return { type: 'handle', value: input.substring(1) };
  if (input.startsWith('UC')) return { type: 'id', value: input };

  return null;
}

// Helper: fetch channel metadata
async function getChannelData(identifier) {
  let params;
  if (identifier.type === 'handle') {
    params = `forHandle=${identifier.value}`;
  } else {
    params = `id=${identifier.value}`;
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&${params}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }

  const channel = data.items[0];
      return {
    channelId: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description || '',
    subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
    videoCount: parseInt(channel.statistics.videoCount) || 0,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads
  };
}

// Helper: fetch video IDs from uploads playlist
async function getVideoIds(playlistId, maxResults = 30) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=${maxResults}&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!data.items || data.items.length === 0) return [];

  return data.items.map(item => item.contentDetails.videoId);
}

// Helper: batch fetch video details
async function getVideosDetails(videoIds) {
  if (videoIds.length === 0) return [];

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!data.items) return [];

  return data.items.map(video => ({
    videoId: video.id,
    title: video.snippet.title,
    description: video.snippet.description || '',
    publishedAt: video.snippet.publishedAt,
    duration: video.contentDetails.duration,
    viewCount: parseInt(video.statistics.viewCount) || 0
  }));
}

// Helper: convert ISO 8601 duration to minutes
function durationToMinutes(isoDuration) {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  return hours * 60 + minutes + seconds / 60;
}

// Helper: median
function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Helper: calculate upload cadence in days from video publish dates
function calculateCadence(videos) {
  if (videos.length < 2) return null;

  const dates = videos.map(v => new Date(v.publishedAt).getTime()).sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < dates.length; i++) {
    const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    if (diffDays > 0) gaps.push(diffDays);
  }

  if (gaps.length === 0) return null;
  return median(gaps);
}

// Helper: estimate monthly revenue using rolling 90-day window
function estimateRevenue(videos, cadenceDays, rpm) {
  if (videos.length === 0 || !cadenceDays) return null;

  // Use last 12 videos (approximately 90 days for weekly channel)
  const recent = videos.slice(0, 12);
  if (recent.length === 0) return null;

  const avgViews = recent.reduce((sum, v) => sum + v.viewCount, 0) / recent.length;
  const uploadsPerMonth = 30 / cadenceDays;
  const monthlyViews = avgViews * uploadsPerMonth;
  const monthlyRevenue = (monthlyViews * rpm) / 1000;

  const low = monthlyRevenue * 0.85;
  const high = monthlyRevenue * 1.15;
  return { low, high, midpoint: monthlyRevenue };
}

// Helper: classify niche using three-signal scoring
function classifyNiche(channelData, videos) {
  // For Phase 1, only Ancient Mysteries is defined.
  const niche = niches[0];

  // Signal 1: title keyword density
  const recentTitles = videos.slice(0, 30).map(v => v.title.toLowerCase());
  const titleMatches = recentTitles.filter(title =>
    niche.keywords.some(keyword => title.includes(keyword))
  ).length;
  const titleDensity = recentTitles.length > 0 ? titleMatches / recentTitles.length : 0;

  // Signal 2: median video length
  const durations = videos.slice(0, 30).map(v => durationToMinutes(v.duration));
  const medianDuration = median(durations);
  const lengthInRange = medianDuration >= niche.videoLengthMin && medianDuration <= niche.videoLengthMax;

  // Signal 3: channel description keywords
  const desc = channelData.description.toLowerCase();
  const descMatches = niche.keywords.filter(keyword => desc.includes(keyword)).length;

  // Weighted scoring (40% title, 35% length, 25% description)
  const titleScore = titleDensity >= 0.6 ? 1 : titleDensity / 0.6; // scale to 1
  const lengthScore = lengthInRange ? 1 : 0;
  const descScore = descMatches > 0 ? 1 : 0;

  const totalScore = (titleScore * 0.4) + (lengthScore * 0.35) + (descScore * 0.25);

  let confidence = 'low';
  if (totalScore >= 0.75) confidence = 'high';
  else if (totalScore >= 0.5) confidence = 'medium';

  const matched = totalScore >= 0.5;

  return {
    niche: matched ? niche : null,
    confidence,
    titleDensity,
    medianDuration,
    lengthInRange,
    descMatches
  };
}

// Scan description for tools (reused)
function scanDescription(description, tools) {
  const lowerDesc = description.toLowerCase();
  const detected = [];
  tools.forEach(tool => {
    const match = tool.aliases.some(alias => lowerDesc.includes(alias));
    if (match) {
      detected.push({
        name: tool.name,
        category: tool.category,
        confidence: 'Confirmed'
      });
    }
  });
  return detected;
}

// Build channel card for qualified channel
function buildChannelCard(channelData, videos, cadenceDays, revenue, nicheResult) {
  const niche = nicheResult.niche;
  const recentViews = videos.slice(0, 12).map(v => v.viewCount);
  const avgViews = recentViews.length > 0 ? recentViews.reduce((a, b) => a + b, 0) / recentViews.length : 0;

  const toolStack = niche.aiTools; // For Phase 1 hardcoded per niche

  return {
    name: channelData.title,
    url: `https://www.youtube.com/channel/${channelData.channelId}`,
    subscribers: channelData.subscriberCount,
    videoCount: channelData.videoCount,
    uploadCadence: cadenceDays ? `~${Math.round(cadenceDays)} day(s)` : 'Unknown',
    estimatedMonthlyRevenue: revenue ? `$${Math.round(revenue.low)}-$${Math.round(revenue.high)}` : 'Unknown',
    niche: niche.name,
    confidence: nicheResult.confidence,
    formatFingerprint: niche.formatFingerprint,
    pacingStyle: niche.pacingStyle,
    visualApproach: niche.visualApproach,
    whyItWorks: niche.whyItWorks,
    aiToolStack: toolStack
  };
}

// Build 5-step prompt templates (Phase 1: filled with niche defaults)
function buildPromptTemplates(niche, channelData, videos) {
  // Extract common title pattern: most frequent words/length pattern (simple)
  const titles = videos.slice(0, 30).map(v => v.title);
  const titlePattern = titles.length > 0 ? titles[0] : 'Sample title'; // placeholder

  return {
    step1: {
      title: 'Step 1 — Topic Prompt',
      content: `Paste this into Claude:\nGenerate 10 video ideas for a ${niche.name} channel following this exact format:\n- Video length: ${niche.videoLengthMin}-${niche.videoLengthMax} minutes\n- Title style: ${titlePattern}\n- Topic types: ${niche.keywords.join(', ')}`
    },
    step2: {
      title: 'Step 2 — Script Prompt',
      content: `Paste this into Claude:\nWrite a full ${niche.videoLengthMin}-${niche.videoLengthMax} minute script for a ${niche.name} video on [TOPIC].\nStructure:\n- 7-12 chapters with mystery-like titles\n- Calm, atmospheric narration\n- Include historical context and unexplained details`
    },
    step3: {
      title: 'Step 3 — Image Prompt',
      content: `Paste this into Claude:\nGenerate 20 image prompts for Midjourney/Higgsfield, one per scene.\nStyle: cinematic stills, muted earth tones, golden hour lighting, Ken Burns slow zoom.\nAspect ratio: 16:9`
    },
    step4: {
      title: 'Step 4 — Voice Settings',
      content: `ElevenLabs settings:\n- Voice type: deep, calm, slightly gravelly male — late night documentary register\n- Stability: 90\n- Style exaggeration: Low\n- Test: 3-4 voices with same 200-word passage`
    },
    step5: {
      title: 'Step 5 — Assembly Workflow',
      content: `Editing instructions:\n- Image timing: 45-75 sec per image, very slow Ken Burns zoom\n- Music: low drones, soft atmosphere at -20dB under narration (Suno/Epidemic Sound)\n- Add YouTube chapters for every section\n- Thumbnail: one epic cinematic image + 2-4 words max\n- Upload cadence: one video per week\n- Disclosure: Add YouTube's AI-generated content label`
    }
  };
}

// Qualification checks
function checkQualification(channelData, videos, nicheResult) {
  const fails = [];

  if (channelData.videoCount < 50) {
    fails.push(`This channel has ${channelData.videoCount} videos — we need at least 50 to identify a reliable content pattern.`);
  }

  const avgViews = videos.slice(0, 30).reduce((sum, v) => sum + v.viewCount, 0) / Math.min(videos.length, 30);
  if (channelData.subscriberCount < 1000 || avgViews < 1000) {
    fails.push('This channel does not meet the monetization proxy (1000+ subscribers and 1000+ average views per video).');
  }

  if (!nicheResult.niche) {
    fails.push('This channel does not match any of our supported AI-producible niches.');
  }

  return fails;
}

// Alternative suggestions (hardcoded for Phase 1)
const alternativeSuggestions = [
  { name: 'Uncharted Mysteries', niche: 'Ancient Mysteries', handle: '@TheUnchartedMysteries' },
  { name: 'Andrei Jikh', niche: 'Finance', handle: '@AndreiJikh' },
  { name: 'JCS Criminal Psychology', niche: 'True Crime', handle: '@JCS' }
];

// New endpoint: /clone-channel
app.post('/clone-channel', async (req, res) => {
  const channelInput = req.body.channelUrl;
  const identifier = extractChannelIdentifier(channelInput);

  if (!identifier) {
    return res.status(400).json({ error: 'Invalid YouTube channel URL or handle.' });
  }

  try {
    // 1. Fetch channel metadata
    const channelData = await getChannelData(identifier);

    // 2. Fetch video IDs
    const videoIds = await getVideoIds(channelData.uploadsPlaylistId, 30);

    // 3. Fetch video details
    const videos = await getVideosDetails(videoIds);

    // 4. Compute cadence
    const cadenceDays = calculateCadence(videos);

    // 5. Classify niche
    const nicheResult = classifyNiche(channelData, videos);

    // 6. Qualification checks
    const fails = checkQualification(channelData, videos, nicheResult);
    if (fails.length > 0) {
      return res.json({
        status: 'disqualified',
        reasons: fails,
        suggestions: alternativeSuggestions
      });
    }

    // 7. Revenue estimate
    const rpm = nicheResult.niche.rpm;
    const revenue = estimateRevenue(videos, cadenceDays, rpm);

    // 8. Build channel card
    const channelCard = buildChannelCard(channelData, videos, cadenceDays, revenue, nicheResult);

    // 9. Build prompts
    const prompts = buildPromptTemplates(nicheResult.niche, channelData, videos);

    res.json({
      status: 'qualified',
      channelCard,
      prompts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze channel. Make sure the URL is valid and API key is correct.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});