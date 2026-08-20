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
const promptBlueprints = require('./promptBlueprints');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Supported niches with their parameters
const niches = [
  {
    id: 'ancient-mysteries',
    name: 'Ancient Mysteries / Dark History',
    rpm: 9,
    videoLengthMin: 60,
    videoLengthMax: 120,
    keywords: ['mystery', 'mysteries', 'ancient', 'unexplained', 'dark history', 'documentary', 'impossible', 'discoveries', 'lost civilization', 'forbidden archaeology', 'ancient aliens', 'megalithic', 'prehistory', 'antediluvian', 'hidden history', 'conspiracy', 'cover up', 'secret history', 'archaeology', 'ruins', 'artifacts', 'anomalies'],
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
  },
  {
    id: 'personal-finance',
    name: 'Personal Finance Explainers',
    rpm: 30,
    videoLengthMin: 10,
    videoLengthMax: 40,
    keywords: ['finance', 'investing', 'debt', 'budgeting', 'money', 'stocks', 'wealth', 'passive income', 'retirement', 'economy', 'personal finance', 'financial freedom', 'compound interest', 'index fund', 'etf', '401k', 'ira', 'roth ira', 'dividend', 'crypto', 'bitcoin', 'real estate investing', 'house hacking', 'fire movement', 'side hustle', 'credit score', 'loan', 'mortgage', 'insurance', 'tax', 'inflation', 'recession', 'bear market', 'bull market', 'portfolio', 'asset allocation', 'dollar cost averaging'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Canva', purpose: 'Visuals & animations' },
      { name: 'DaVinci Resolve', purpose: 'Video editing' }
    ],
    whyItWorks: 'Highest-CPM faceless niche. Animated graphics + AI voiceover. 10-20 min videos attract advertisers at premium rates.',
    formatFingerprint: '10-20 min animated explainer with AI voiceover',
    pacingStyle: 'Clear, educational, medium pace',
    visualApproach: 'Animated graphics, screen capture, simple charts'
  },
  {
    id: 'true-crime',
    name: 'True Crime Documentaries',
    rpm: 10,
    videoLengthMin: 30,
    videoLengthMax: 60,
    keywords: ['true crime', 'murder', 'mystery', 'case', 'crime documentary', 'investigation', 'court', 'police', 'killer', 'disappearance', 'serial killer', 'cold case', 'missing person', 'homicide', 'detective', 'forensic', 'evidence', 'trial', 'verdict', 'prison', 'inmate', 'victim', 'survivor', 'unsolved', 'investigative', 'criminology', 'psychology', 'profiling', 'dna', 'witness', 'testimony', 'alibi', 'motive'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Midjourney', purpose: 'AI visuals for reconstructions' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'Highest average watch time on the platform. Viewers binge entire playlists. 30-60 min deep dives.',
    formatFingerprint: '30-60 min deep dives with archival photos, maps, court documents',
    pacingStyle: 'Suspenseful but respectful, steady narration',
    visualApproach: 'Archival footage + AI image reconstructions'
  },
  {
    id: 'sleep-meditation',
    name: 'Sleep & Meditation Content',
    rpm: 5.5,
    videoLengthMin: 60,
    videoLengthMax: 480,
    keywords: ['sleep', 'meditation', 'relax', 'calm', 'ambient', 'rain', 'healing', 'frequency', 'insomnia', 'deep sleep', 'bedtime', 'goodnight', 'asmr', 'white noise', 'brown noise', 'nature sounds', 'sleep music', 'sleep story', 'relaxation', 'mindfulness', 'zen', 'yoga', 'breathing', 'guided meditation', 'binaural beats', 'delta waves', 'theta waves', '432 hz', '528 hz', 'manifestation', 'affirmations', 'peaceful', 'serene', 'tranquil', 'dream', 'reiki', 'sound bath', 'lofi', 'chill'],
    aiTools: [
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Suno', purpose: 'Ambient music' },
      { name: 'Runway', purpose: 'Visuals' },
      { name: 'Simple editor', purpose: 'Looping assembly' }
    ],
    whyItWorks: 'Lowest production barrier. Ambient audio + looping visual + AI voice. 2-8 hour videos. Algorithmic favourite — massive replay value, extreme watch time.',
    formatFingerprint: '2-8 hour ambient loops with soft voice and calming music',
    pacingStyle: 'Very slow, hypnotic, soothing',
    visualApproach: 'Slow-moving dreamlike visuals, starfields, nature scenes'
  },
  {
    id: 'ai-tech',
    name: 'AI & Tech Explainers',
    rpm: 14,
    videoLengthMin: 4,
    videoLengthMax: 18,
    keywords: ['ai', 'tech', 'artificial intelligence', 'gpt', 'machine learning', 'tools', 'tutorial', 'future', 'robot', 'software', 'llm', 'large language model', 'chatgpt', 'claude', 'gemini', 'copilot', 'midjourney', 'stable diffusion', 'generative ai', 'deep learning', 'neural network', 'transformer', 'fine tuning', 'prompt engineering', 'ai agent', 'automation', 'coding assistant', 'ai coding', 'cursor', 'vscode', 'github copilot', 'api', 'openai', 'anthropic', 'hugging face', 'pytorch', 'tensorflow', 'computer vision', 'nlp', 'natural language processing', 'ai news', 'ai breakthrough', 'agi', 'artificial general intelligence'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Screen recording', purpose: 'Software demos' },
      { name: 'CapCut / DaVinci', purpose: 'Video editing' }
    ],
    whyItWorks: 'Fastest-growing niche in 2026. Screen recordings + AI voice + simple animation. 5-15 min format.',
    formatFingerprint: '5-15 min screen recordings with AI voice',
    pacingStyle: 'Clear, informative, moderately fast',
    visualApproach: 'Screen capture, simple animations, tool demos'
  },
  {
    id: 'business-case-studies',
    name: 'Business Case Studies',
    rpm: 14,
    videoLengthMin: 15,
    videoLengthMax: 30,
    keywords: ['business', 'startup', 'company', 'brand', 'failure', 'success', 'billionaire', 'stock', 'market', 'entrepreneurship', 'case study', 'business model', 'revenue', 'profit', 'ipo', 'acquisition', 'merger', 'unicorn', 'venture capital', 'vc funding', 'series a', 'series b', 'pitch deck', 'founder', 'ceo', 'scale', 'growth', 'disruption', 'innovation', 'strategy', 'monetization', 'saas', 'subscription', 'ecommerce', 'dropshipping', 'amazon fba', 'shopify', 'digital marketing', 'seo', 'content marketing', 'personal brand'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Storyblocks / Pexels', purpose: 'Stock footage' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'Startup stories, brand failures, billionaire breakdowns. Stock footage + motion graphics + AI voice. 15-30 min format attracts business advertisers.',
    formatFingerprint: '15-30 min stock footage + motion graphics',
    pacingStyle: 'Professional, analytical, structured',
    visualApproach: 'Stock footage, charts, motion graphics'
  },
  {
    id: 'history-documentaries',
    name: 'History Documentaries',
    rpm: 8,
    videoLengthMin: 20,
    videoLengthMax: 60,
    keywords: ['history', 'historical', 'war', 'ancient rome', 'wwii', 'civilization', 'empire', 'battle', 'timeline', 'documentary', 'world war', 'cold war', 'ancient greece', 'egypt', 'mesopotamia', 'viking', 'medieval', 'renaissance', 'revolution', 'independence', 'colonial', 'dynasty', 'king', 'queen', 'emperor', 'pharaoh', 'caesar', 'napoleon', 'hitler', 'churchill', 'roosevelt', 'stalin', 'mao', 'gandhi', 'mandela', 'archaeology', 'artifact', 'ruins', 'excavation', 'ancient', 'prehistory', 'bronze age', 'iron age', 'dark ages', 'enlightenment', 'industrial revolution'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Midjourney', purpose: 'Historical visuals' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'Evergreen content with long shelf life. History buffs rewatch. 20-60 min format works well with mid-roll ads.',
    formatFingerprint: '20-60 min narrated documentaries with maps and archival images',
    pacingStyle: 'Storytelling, measured, authoritative',
    visualApproach: 'Maps, archival photos, animated battle lines, artwork'
  },
  {
    id: 'geopolitics',
    name: 'Geopolitics & World Affairs',
    rpm: 12,
    videoLengthMin: 10,
    videoLengthMax: 25,
    keywords: ['geopolitics', 'geopolitical', 'china', 'russia', 'usa', 'eu', 'nato', 'trade war', 'sanctions', 'diplomacy', 'foreign policy', 'superpower', 'world order', 'global power', 'international relations', 'conflict', 'war', 'crisis', 'border dispute', 'territorial', 'alliance', 'brics', 'g7', 'g20', 'united nations', 'security council', 'military', 'nuclear', 'arms race', 'proxy war', 'election interference', 'sphere of influence', 'hegemony', 'balance of power', 'sovereignty', 'human rights', 'refugee', 'migration', 'energy security', 'oil', 'gas pipeline', 'taiwan', 'ukraine', 'middle east', 'south china sea', 'korea', 'india', 'pakistan', 'iran', 'israel', 'palestine'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'MapChart / Custom maps', purpose: 'Geopolitical maps' },
      { name: 'CapCut / DaVinci', purpose: 'Video editing' }
    ],
    whyItWorks: 'High engagement from news-aware audience. Map animations + AI voice = low production cost. 10-25 min format.',
    formatFingerprint: '10-25 min map-heavy analysis with AI narration',
    pacingStyle: 'Analytical, objective, steady',
    visualApproach: 'Animated maps, charts, satellite imagery, flags'
  },
  {
    id: 'science-space',
    name: 'Science & Space',
    rpm: 7,
    videoLengthMin: 8,
    videoLengthMax: 20,
    keywords: ['space', 'nasa', 'physics', 'astronomy', 'cosmos', 'black hole', 'mars', 'rocket', 'telescope', 'quantum', 'science', 'universe', 'galaxy', 'star', 'planet', 'solar system', 'moon', 'saturn', 'jupiter', 'neptune', 'venus', 'mercury', 'asteroid', 'comet', 'meteor', 'nebula', 'supernova', 'gravity', 'relativity', 'einstein', 'particle', 'atom', 'molecule', 'chemistry', 'biology', 'evolution', 'climate', 'earth', 'antarctica', 'ocean', 'deep sea', 'biology', 'genetics', 'dna', 'theory', 'experiment', 'discovery', 'research', 'scientist', 'lab', 'james webb', 'spacex', 'starship', 'launch', 'orbit', 'space station', 'iss', 'alien', 'extraterrestrial', 'ufo', 'astrophysics', 'cosmology', 'big bang', 'dark matter', 'dark energy'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'NASA / ESA media library', purpose: 'Space footage' },
      { name: 'Blender / After Effects', purpose: 'Visualizations' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'Curiosity-driven, high shareability. Public domain space footage + AI voice. 8-20 min format.',
    formatFingerprint: '8-20 min space/science explainers with real footage',
    pacingStyle: 'Wonder-driven, clear, educational',
    visualApproach: 'NASA/ESA footage, CGI visualizations, data visualizations'
  },
  {
    id: 'psychology-self-improvement',
    name: 'Psychology & Self-Improvement',
    rpm: 11,
    videoLengthMin: 10,
    videoLengthMax: 20,
    keywords: ['psychology', 'habits', 'productivity', 'mindset', 'mental health', 'anxiety', 'confidence', 'discipline', 'stoicism', 'behavioral', 'self improvement', 'self help', 'motivation', 'success habits', 'willpower', 'focus', 'attention', 'procrastination', 'depression', 'stress', 'burnout', 'emotional intelligence', 'eq', 'social skills', 'communication', 'charisma', 'self esteem', 'overthinking', 'therapy', 'counseling', 'cognitive', 'neuroscience', 'brain', 'habit loop', 'dopamine', 'dopamine detox', 'cbt', 'journaling', 'goal setting', 'time management', 'minimalism', 'stoic', 'stoicism'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Canva / Motion graphics', purpose: 'Animated concepts' },
      { name: 'Storyblocks / Pexels', purpose: 'Stock footage' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'High retention, evergreen, shareable. Simple animations + stock footage + AI voice. 10-20 min format.',
    formatFingerprint: '10-20 min animated concept videos with practical takeaways',
    pacingStyle: 'Encouraging, clear, actionable',
    visualApproach: 'Minimal animations, text highlights, stock lifestyle footage'
  },
  {
    id: 'luxury-watches',
    name: 'Luxury Watches & Collectibles',
    rpm: 25,
    videoLengthMin: 8,
    videoLengthMax: 20,
    keywords: ['watch', 'rolex', 'patek', 'omega', 'luxury watch', 'horology', 'timepiece', 'collectible', 'investment watch', 'philippe', 'audemars', 'piguet', 'royal oak', 'nautilus', 'submariner', 'daytona', 'datejust', 'gmt', 'master', 'vacheron', 'constantin', 'richard', 'mille', 'grand', 'complications', 'tourbillon', 'perpetual calendar', 'chronograph', 'automatic', 'mechanical', 'quartz', 'spring drive', 'co-axial', 'in-house movement', 'watch review', 'watch collection', 'watch unboxing', 'watch comparison', 'watch investment', 'vintage watch', 'pre owned', 'grey market', 'authorized dealer', 'ad', 'waitlist', 'hulk', 'batman', 'pepsi', 'kermit', 'starbucks', 'spritetimer', 'moonwatch', 'speedmaster', 'seamaster', 'aquanaut'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Manufacturer press kits', purpose: 'Product imagery' },
      { name: 'DaVinci Resolve', purpose: 'Video editing' }
    ],
    whyItWorks: 'Ultra-high CPM (luxury advertisers). Passionate niche audience. Macro photography + AI voice. 8-20 min format.',
    formatFingerprint: '8-20 min macro close-ups with detailed commentary',
    pacingStyle: 'Appreciative, detailed, connoisseur tone',
    visualApproach: 'Macro watch photography, manufacturer renders, lifestyle shots'
  },
  {
    id: 'coding-tutorials',
    name: 'Coding Tutorials & Dev Education',
    rpm: 18,
    videoLengthMin: 15,
    videoLengthMax: 45,
    keywords: ['coding', 'programming', 'python', 'javascript', 'react', 'tutorial', 'developer', 'software engineering', 'web development', 'api', 'typescript', 'node', 'nodejs', 'express', 'vue', 'angular', 'svelte', 'nextjs', 'frontend', 'backend', 'fullstack', 'full stack', 'database', 'sql', 'postgres', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'devops', 'git', 'github', 'algorithm', 'data structure', 'leetcode', 'clean code', 'refactor', 'debug', 'unit test', 'ci cd', 'rest', 'graphql', 'authentication', 'jwt', 'oauth', 'machine learning', 'data science', 'html', 'css', 'tailwind', 'bootstrap', 'rust', 'go', 'golang', 'java', 'c++', 'swift', 'kotlin', 'mobile', 'ios', 'android', 'flutter', 'react native'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing & code examples' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Screen recording (VS Code)', purpose: 'Code demos' },
      { name: 'DaVinci Resolve / CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'High-value audience (developers). Screen recording + AI voice = near-zero production cost. 15-45 min deep dives.',
    formatFingerprint: '15-45 min code-along tutorials with screen recording',
    pacingStyle: 'Step-by-step, clear, practical',
    visualApproach: 'Screen capture (IDE), code snippets, terminal output'
  },
  {
    id: 'real-estate-investing',
    name: 'Real Estate Investing',
    rpm: 22,
    videoLengthMin: 10,
    videoLengthMax: 25,
    keywords: ['real estate', 'property', 'rental', 'airbnb', 'house hacking', 'reit', 'landlord', 'mortgage', 'cash flow', 'investing', 'realty', 'housing market', 'home prices', 'appreciation', 'depreciation', 'capital gains', 'cap rate', 'roi', 'cash on cash', 'equity', 'leverage', 'down payment', 'escrow', 'closing costs', 'title', 'deed', 'wholesaling', 'flipping', 'fix and flip', 'turnkey', 'multi family', 'multifamily', 'single family', 'commercial real estate', 'industrial', 'retail space', 'office space', 'vacancy rate', 'tenant', 'property management', 'property manager', 'short term rental', 'long term rental', 'mid term rental', 'brrrr', 'brrr', '1031 exchange', 'depreciation', 'amortization', 'hard money', 'private money', 'seller financing', 'subject to', 'lease option', 'rent to own'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Canva / Excel', purpose: 'Deal analysis charts' },
      { name: 'Storyblocks / Pexels', purpose: 'Property footage' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'High-ticket audience, strong affiliate potential. Charts + property footage + AI voice. 10-25 min format.',
    formatFingerprint: '10-25 min deal breakdowns with spreadsheets and property tours',
    pacingStyle: 'Analytical, numbers-driven, practical',
    visualApproach: 'Spreadsheets, property photos, neighborhood maps, charts'
  },
  {
    id: 'book-summaries',
    name: 'Book Summaries & Key Insights',
    rpm: 9,
    videoLengthMin: 8,
    videoLengthMax: 18,
    keywords: ['book summary', 'book review', 'key takeaways', 'lessons from', 'atomic habits', 'psychology of money', 'think and grow rich', 'self help', 'best books', 'must read', 'reading list', 'book recommendation', 'book club', 'summary of', 'the summary', 'main ideas', 'core message', 'author interview', 'biography', 'autobiography', 'memoir', 'nonfiction', 'personal development', 'personal growth', 'business books', 'finance books', 'philosophy books', 'history books', 'science books', 'fiction', 'novel', 'classic literature', 'self improvement books', 'productivity books', 'leadership books', 'mindset books', 'money books', 'investing books', 'health books', 'relationship books'],
    aiTools: [
      { name: 'Claude', purpose: 'Script writing (summarize)' },
      { name: 'ElevenLabs', purpose: 'Voiceover' },
      { name: 'Canva / Animated graphics', purpose: 'Concept visualizations' },
      { name: 'CapCut', purpose: 'Video editing' }
    ],
    whyItWorks: 'Search-driven traffic, evergreen. Simple animations + AI voice. 8-18 min format covers one book per video.',
    formatFingerprint: '8-18 min animated summaries with 3-5 key lessons',
    pacingStyle: 'Concise, insight-focused, structured',
    visualApproach: 'Animated concept graphics, book covers, quote cards'
  }
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
  if (cMatch) return { type: 'handle', value: cMatch[1] };

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

// AI Tool detection patterns (built from tools.json for comprehensive coverage)
const aiToolPatterns = {
  writing: [
    'chatgpt', 'chat gpt', 'gpt-4', 'gpt-3', 'gpt4', 'gpt3', 'openai', 'anthropic', 'claude',
    'jasper', 'jarvis', 'copy.ai', 'copyai', 'notion ai', 'notion.so', 'ai writing', 'ai script',
    'written by ai', 'ai generated script', 'ai-written', 'ai generated', 'gpt', 'llm',
    'large language model', 'prompt engineering'
  ],
  voiceover: [
    'elevenlabs', 'eleven labs', '11labs', 'murf', 'murf.ai', 'speechify', 'play.ht', 'playht',
    'wellsaid', 'wellsaidlabs', 'lovo', 'lovo.ai', 'ai voice', 'ai voiceover', 'text to speech',
    'tts', 'generated voice', 'synthetic voice', 'voice synthesis', 'voice cloning', 'eleven labs'
  ],
  image: [
    'midjourney', 'mid journey', 'mj', 'dall-e', 'dalle', 'dall e', 'openai dall-e',
    'stable diffusion', 'stable-diffusion', 'sd', 'leonardo ai', 'leonardo.ai', 'leonardo',
    'ideogram', 'ideogram.ai', 'ai art', 'ai image', 'ai generated image', 'ai artwork',
    'generated with ai', 'ai art tool', 'ai image generation', 'image generation', 'generative art'
  ],
  video: [
    'runway', 'runwayml', 'runway ml', 'pika', 'pika labs', 'pika.art', 'synthesia',
    'heygen', 'hey gen', 'heygen.com', 'invideo', 'invideo.io', 'pictory', 'pictory.ai',
    'lumen5', 'descript', 'descript.com', 'opus clip', 'opusclip', 'opus.pro', 'ai video',
    'ai generated video', 'ai editing', 'ai video generation', 'video generation', 'gen-2', 'gen-3',
    'runway gen', 'kling', 'luma dream', 'veo', 'sora'
  ],
  music: [
    'suno', 'suno.ai', 'udio', 'udio.ai', 'aiva', 'aiva.ai', 'soundraw', 'soundraw.io',
    'mubert', 'mubert.com', 'ai music', 'ai generated music', 'ai soundtrack', 'music generation',
    'generative music', 'ai composer'
  ],
  caption: [
    'submagic', 'sub magic', 'submagic.co', 'captions.ai', 'captions ai', 'auto caption',
    'ai caption', 'ai subtitles', 'auto subtitles', 'caption generator', 'submagic',
    'opus clip', 'opusclip'
  ]
};

// AI tool categories from tools.json for more comprehensive detection
const aiToolCategories = {
  'AI Writing': 'writing',
  'AI Voiceover': 'voiceover',
  'Text-to-Speech': 'voiceover',
  'AI Image Generation': 'image',
  'AI Video Generation': 'video',
  'AI Video Editing': 'video',
  'AI Video Clipping': 'video',
  'AI Avatar Video': 'video',
  'AI Captions': 'caption',
  'AI Transcription': 'caption',
  'AI Music': 'music',
  'Screen Recording': 'video'
};

// Helper: detect AI tool usage in channel/video descriptions (comprehensive, uses tools.json + patterns)
function detectAIUsage(channelData, videos) {
  const allText = [
    channelData.description.toLowerCase(),
    ...videos.slice(0, 30).map(v => (v.title + ' ' + v.description).toLowerCase())
  ].join(' ');

  const detected = {
    writing: false,
    voiceover: false,
    image: false,
    video: false,
    music: false,
    caption: false,
    details: [],
    tools: [] // Specific tools detected
  };

  // 1. Pattern-based detection (broad categories)
  Object.entries(aiToolPatterns).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (allText.includes(pattern.toLowerCase())) {
        detected[category] = true;
        detected.details.push({ category, pattern });
      }
    });
  });

  // 2. Tool-specific detection from tools.json
  toolsDatabase.forEach(tool => {
    const toolCategory = aiToolCategories[tool.category];
    if (toolCategory) {
      tool.aliases.forEach(alias => {
        if (allText.includes(alias.toLowerCase())) {
          detected[toolCategory] = true;
          if (!detected.tools.some(t => t.name === tool.name)) {
            detected.tools.push({
              name: tool.name,
              category: tool.category,
              purpose: toolCategory,
              use: tool.use || '',
              matchedAlias: alias
            });
          }
        }
      });
    }
  });

  detected.aiScore = Object.values(detected).filter(v => v === true).length;
  detected.isLikelyAI = detected.aiScore >= 2 || detected.tools.length >= 2; // At least 2 AI categories or 2 specific tools

  return detected;
}

// Helper: word-boundary-aware keyword match (prevents "ai" matching inside "email")
// Keywords shorter than 5 chars are treated as whole-word matches; longer ones use includes.
// For very short keywords (2-3 chars like "ai", "gpt", "llm"), also match common delimiters.
function keywordMatch(text, keyword) {
  const kw = keyword.toLowerCase();
  // Multi-word keywords or those with non-alphanumeric chars (e.g. "401k", "ai agent") need care
  if (kw.length <= 4 && /^[a-z0-9]+$/.test(kw)) {
    // Short alphanumeric: require word boundaries, but also match common formats like "AI:", "AI -", "GPT-4", etc.
    // Match: start, end, space, punctuation, colon, dash, underscore, parentheses
    const re = new RegExp(`(^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
    if (re.test(text)) return true;
    // Also match common tech abbreviations like "GPT-4", "AI-powered", "LLM-based", etc.
    const re2 = new RegExp(`${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[-:]`, 'i');
    if (re2.test(text)) return true;
    return false;
  }
  return text.includes(kw);
}

// Helper: classify niche using strict multi-signal scoring
function classifyNiche(channelData, videos) {
  const recentTitles = videos.slice(0, 30).map(v => v.title.toLowerCase());

  // Filter out Shorts (under 3 minutes) for accurate median duration calculation
  const longFormVideos = videos.slice(0, 30).filter(v => durationToMinutes(v.duration) >= 3);
  const durations = longFormVideos.map(v => durationToMinutes(v.duration));
  const medianDuration = durations.length > 0 ? median(durations) : 0;
  const desc = channelData.description.toLowerCase();

  console.log(`=== Classifying: ${channelData.title} ===`);
  console.log(`Median duration (long-form only): ${medianDuration.toFixed(1)} min from ${longFormVideos.length} videos`);
  console.log(`Description: ${desc.substring(0, 200)}...`);

  // Also check AI usage for niche boosting
  const aiDetection = detectAIUsage(channelData, videos);

  let bestNiche = null;
  let bestScore = 0;
  let bestDetails = {};
  const allScores = [];

  niches.forEach(niche => {
    // Signal 1: title keyword density - primary signal, must have meaningful matches
    const titleMatches = recentTitles.filter(title =>
      niche.keywords.some(keyword => keywordMatch(title, keyword))
    ).length;
    const titleDensity = recentTitles.length > 0 ? titleMatches / recentTitles.length : 0;

    // Signal 2: median video length proximity to niche range
    let lengthScore = 0;
    if (medianDuration > 0) {
      const inRange = medianDuration >= niche.videoLengthMin && medianDuration <= niche.videoLengthMax;
      if (inRange) {
        lengthScore = 1.0;
      } else {
        // Partial score only if close to range
        const nicheMid = (niche.videoLengthMin + niche.videoLengthMax) / 2;
        const distance = Math.abs(medianDuration - nicheMid);
        const maxAllowedDistance = Math.max(niche.videoLengthMax - niche.videoLengthMin, 10);
        lengthScore = Math.max(0, 1 - (distance / maxAllowedDistance));
      }
    }

    // Signal 3: channel description keywords
    const descMatches = niche.keywords.filter(keyword => keywordMatch(desc, keyword)).length;
    const descScore = Math.min(1, descMatches / 2); // Need at least 2 matches for full score

    // Signal 4: AI usage boost (if channel uses AI tools, boost matching niches)
    let aiBoost = 0;
    if (aiDetection.isLikelyAI) {
      // Check if niche's aiTools match detected AI categories
      const nicheToolCategories = niche.aiTools.map(t => t.purpose.toLowerCase());
      const detectedCategories = Object.keys(aiDetection).filter(k => aiDetection[k] === true && k !== 'details' && k !== 'aiScore' && k !== 'isLikelyAI' && k !== 'tools');
      const overlap = nicheToolCategories.filter(cat => detectedCategories.some(dc => cat.includes(dc) || dc.includes(cat))).length;
      aiBoost = Math.min(0.15, overlap * 0.075); // Max 0.15 boost
    }

    // KEY FIX: Require minimum title density for ANY score
    // If title density < 0.15 (less than ~15% of videos match niche keywords), heavily penalize
    const minTitleDensity = 0.15;
    let titleScore = 0;
    if (titleDensity >= minTitleDensity) {
      titleScore = Math.min(1, titleDensity / 0.4); // Full score at 40% density
    } else if (titleDensity > 0) {
      // Partial credit but heavily reduced
      titleScore = (titleDensity / minTitleDensity) * 0.3; // Max 0.3 if below threshold
    }

    // Weighted scoring (50% title, 25% length, 15% description, 10% AI boost)
    // Title is now dominant - channel MUST talk about the niche topics
    const totalScore = (titleScore * 0.50) + (lengthScore * 0.25) + (descScore * 0.15) + (aiBoost * 0.10);

    allScores.push({ niche: niche.name, score: totalScore, titleDensity, titleMatches });

    console.log(`Niche ${niche.name}: score=${totalScore.toFixed(3)}, titleDensity=${titleDensity.toFixed(2)}, titleScore=${titleScore.toFixed(2)}, lengthScore=${lengthScore.toFixed(2)}, descScore=${descScore.toFixed(2)}, aiBoost=${aiBoost.toFixed(2)}, medianDuration=${medianDuration.toFixed(1)}, titleMatches=${titleMatches}/${recentTitles.length}, descMatches=${descMatches}`);
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestNiche = niche;
      bestDetails = {
        titleDensity,
        medianDuration,
        lengthScore,
        descMatches,
        aiBoost,
        aiDetection
      };
    }
  });

  // Stricter thresholds
  let confidence = 'low';
  if (bestScore >= 0.65) confidence = 'high';
  else if (bestScore >= 0.4) confidence = 'medium';

  // Match if score >= 0.4 OR if AI detected with decent niche match
  const matched = bestScore >= 0.4 || (aiDetection.isLikelyAI && bestScore >= 0.3);

  console.log(`=== BEST: ${bestNiche?.name || 'NONE'} (score: ${bestScore.toFixed(3)}, matched: ${matched}) ===`);
  console.log(`Top candidates: ${allScores.sort((a,b) => b.score - a.score).slice(0,3).map(s => `${s.niche}=${s.score.toFixed(3)}`).join(', ')}`);

  return {
    niche: matched ? bestNiche : null,
    confidence,
    titleDensity: bestDetails.titleDensity || 0,
    medianDuration: bestDetails.medianDuration || 0,
    lengthScore: bestDetails.lengthScore || 0,
    descMatches: bestDetails.descMatches || 0,
    aiBoost: bestDetails.aiBoost || 0,
    aiDetection: bestDetails.aiDetection || { isLikelyAI: false, aiScore: 0, details: [], tools: [] },
    score: bestScore,
    allScores: allScores.sort((a, b) => b.score - a.score)
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
    aiToolStack: niche.aiTools
  };
}

// Build 5-step prompt templates using blueprint system and dynamic data
function buildPromptTemplates(niche, channelData, videos, nicheResult) {
  const blueprint = promptBlueprints[niche.id] || promptBlueprints['ancient-mysteries']; // fallback

  // Prepare data for placeholders
  const titles = videos.slice(0, 30).map(v => v.title);
  const recentTitles = titles.slice(0, 5);
  const topKeywords = extractTopKeywords(titles, niche.keywords).slice(0, 15).join(', ');
  const titlePatterns = extractTitlePatterns(titles).slice(0, 5).map(p => `• ${p}`).join('\n');

  // Determine tools
  const aiDetection = nicheResult.aiDetection || {};
  const detectedTools = aiDetection.tools || [];
  const detectedCategories = Object.keys(aiDetection).filter(k => aiDetection[k] === true && k !== 'details' && k !== 'aiScore' && k !== 'isLikelyAI' && k !== 'tools');

  const writingTool = detectedTools.find(t => t.purpose === 'writing') || niche.aiTools.find(t => t.purpose.toLowerCase().includes('script') || t.purpose.toLowerCase().includes('writing')) || { name: 'Claude' };
  const voiceTool = detectedTools.find(t => t.purpose === 'voiceover') || niche.aiTools.find(t => t.purpose.toLowerCase().includes('voice')) || { name: 'ElevenLabs' };
  const imageTool = detectedTools.find(t => t.purpose === 'image') || niche.aiTools.find(t => t.purpose.toLowerCase().includes('visual') || t.purpose.toLowerCase().includes('image')) || { name: 'Midjourney' };
  const videoTool = detectedTools.find(t => t.purpose === 'video') || niche.aiTools.find(t => t.purpose.toLowerCase().includes('video') || t.purpose.toLowerCase().includes('edit')) || { name: 'CapCut' };

  const scriptWords = Math.round(((niche.videoLengthMin + niche.videoLengthMax) / 2) * 150);

  const data = {
    channelName: channelData.title,
    nicheName: niche.name,
    formatFingerprint: niche.formatFingerprint,
    pacingStyle: niche.pacingStyle,
    visualApproach: niche.visualApproach,
    videoLengthMin: niche.videoLengthMin,
    videoLengthMax: niche.videoLengthMax,
    rpm: niche.rpm,
    uploadCadence: nicheResult.uploadCadence || 'Consistent schedule',
    topKeywords,
    titlePatterns,
    imageTool: imageTool.name,
    imageToolTips: getImageToolTips(imageTool.name),
    videoTool: videoTool.name,
    voiceType: getVoiceType(niche.pacingStyle, niche.name),
    stability: getStability(niche.pacingStyle),
    similarity: getSimilarity(niche.pacingStyle),
    speed: getSpeed(niche.pacingStyle),
    scriptWords,
    // used in step2 of personal finance for placeholder `videoLengthMax-2`; but we can compute directly.
  };

  // Replace placeholders in each step
  const prompts = {};
  for (let i = 1; i <= 5; i++) {
    let template = blueprint['step' + i];
    // Replace all placeholders
    for (const [key, value] of Object.entries(data)) {
      template = template.replace(new RegExp('{{' + key + '}}', 'g'), value);
    }
    // Special case for personal finance placeholder {{videoLengthMax-2}} (we'll just replace with actual value)
    template = template.replace(/\{\{videoLengthMax-2\}\}/g, Math.max(0, niche.videoLengthMax - 2));
    prompts['step' + i] = {
      title: `Step ${i} — ${['Topic Prompt', 'Script Prompt', 'Visual Prompt', 'Voice Settings', 'Assembly Workflow'][i-1]}`,
      content: template
    };
  }

  return prompts;
}
  // Extract common title patterns from actual videos
// Helper functions for prompt generation
function extractTitlePatterns(titles) {
  const patterns = new Map();
  titles.forEach(title => {
    // Extract first 2-3 words as pattern
    const words = title.split(' ').slice(0, 3).join(' ');
    patterns.set(words, (patterns.get(words) || 0) + 1);
  });
  return Array.from(patterns.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([p]) => p);
}

function extractTopKeywords(titles, nicheKeywords) {
  const wordCount = new Map();
  titles.forEach(title => {
    const words = title.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3);
    words.forEach(w => wordCount.set(w, (wordCount.get(w) || 0) + 1));
  });
  // Prioritize niche keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => {
      const aNiche = nicheKeywords.includes(a[0]) ? 1000 : 0;
      const bNiche = nicheKeywords.includes(b[0]) ? 1000 : 0;
      return (b[1] + bNiche) - (a[1] + aNiche);
    })
    .map(([w]) => w);
}

function getColorPalette(nicheName) {
  const palettes = {
    'Ancient Mysteries / Dark History': 'muted earth tones, amber, deep browns, aged parchment, gold accents',
    'Personal Finance Explainers': 'clean blues, greens, white, gold — trust & growth colors',
    'True Crime Documentaries': 'dark reds, blacks, cold blues, high contrast, forensic aesthetic',
    'Sleep & Meditation Content': 'soft purples, blues, warm ambers, dreamy gradients, low saturation',
    'AI & Tech Explainers': 'electric blues, purples, dark mode UI colors, neon accents, clean whites',
    'Business Case Studies': 'navy, charcoal, gold, crisp whites, corporate professional',
    'History Documentaries': 'sepia, aged paper, deep reds, navy, gold, map tones',
    'Geopolitics & World Affairs': 'deep blues, reds, gold, flag colors, map terrain tones',
    'Science & Space': 'cosmic purples, blues, blacks, nebula pinks, star whites',
    'Psychology & Self-Improvement': 'calm blues, greens, warm neutrals, clean minimal',
    'Luxury Watches & Collectibles': 'black, gold, silver, white, macro lighting, premium',
    'Coding Tutorials & Dev Education': 'dark mode IDE colors, syntax highlighting, clean mono',
    'Real Estate Investing': 'navy, gold, green (money), property photos, clean charts',
    'Book Summaries & Key Insights': 'warm paper tones, accent color per book, clean typography'
  };
  return palettes[nicheName] || 'cinematic, cohesive color grade';
}

function getLightingStyle(nicheName) {
  const styles = {
    'Ancient Mysteries / Dark History': 'golden hour, candlelight, dramatic chiaroscuro',
    'Sleep & Meditation Content': 'soft diffuse, twilight, bioluminescent',
    'True Crime Documentaries': 'harsh fluorescent, single source, shadow-heavy',
    'AI & Tech Explainers': 'clean studio, RGB accent, screen glow',
    'Luxury Watches & Collectibles': 'macro ring light, gradient reflections, controlled highlights',
    'Science & Space': 'cosmic ambient, rim lighting, volumetric'
  };
  return styles[nicheName] || 'cinematic, three-point lighting';
}

function getImageToolTips(toolName) {
  const tips = {
    'Midjourney': '--v 6.1 --style raw --stylize 250 --ar 16:9\nUse --cref for consistency\nUse --sref for style reference',
    'DALL-E': 'Detailed descriptive prompts, specify camera/lens, lighting, mood',
    'Stable Diffusion': 'Use ControlNet for composition, ADetailer for faces, Hires. fix for 4K',
    'Leonardo AI': 'Alchemy upscaler, PhotoReal model, guidance 7-9',
    'Ideogram': 'Excellent for text in images, use "typography" style'
  };
  return tips[toolName] || 'Follow tool-specific best practices for 16:9 cinematic output';
}

function generateShotList(nicheName, visualApproach) {
  // Generic, adaptable shot list per niche archetype
  if (visualApproach.toLowerCase().includes('macro') || nicheName.includes('Luxury')) {
    return `• HERO: macro wide of subject, slow rack focus\n• DETAIL: extreme macro complications/movement\n• CONTEXT: lifestyle / wrist or display shot\n• DIAGRAM: exploded view or labeled callout\n• THUMBNAIL: hero subject on dark glossy bg + accent light`;
  }
  if (visualApproach.toLowerCase().includes('screen') || nicheName.includes('Coding') || nicheName.includes('Tech')) {
    return `• HOOK: full-screen UI / code / tool demo at key moment\n• CODE: screen record of relevant snippet (zoomed)\n• DIAGRAM: callout boxes / animated arrows highlight step\n• FACE/REACTION: optional PIP face (16:9 frame)\n• B-ROLL CUTOFF: screen recording of terminal output`;
  }
  if (visualApproach.toLowerCase().includes('map') || nicheName.includes('Geopolitics') || nicheName.includes('History')) {
    return `• HOOK: dramatic wide map zoom-into region\n• MAP B-ROLL: animated borders / arrows / flags\n• ARCHIVAL: period photos with Ken Burns slow zoom\n• PORTRAIT: key figure / leader close-up\n• THUMBNAIL: map + dominant flag or leader face`;
  }
  if (visualApproach.toLowerCase().includes('stock') || nicheName.includes('Business') || nicheName.includes('Real Estate')) {
    return `• HERO: stock footage of company building / founder b-roll\n• CHART: animated revenue / stock / growth graph\n• LOGO STING: company logo reveal\n• CONTEXT: industry / product shots\n• CEO TRADE: founder public domain photo / archive`;
  }
  return `• HOOK: single iconic image / scene that poses the central question\n• SCENE 1: establishing wide, cinematic\n• SCENE 2: medium detail, orientation\n• SCENE 3: close-up / texture, emotional anchor\n• THUMBNAIL: high-contrast hero frame + readable text`;
}

function getVoiceType(pacingStyle, nicheName) {
  if (pacingStyle.includes('calm') || pacingStyle.includes('slow') || pacingStyle.includes('hypnotic') || pacingStyle.includes('soothing')) {
    return 'Deep, warm, slow-tempo male or female (e.g., ElevenLabs "Adam", "Antoni", "Bella", "Grace")';
  }
  if (pacingStyle.includes('authoritative') || pacingStyle.includes('professional') || pacingStyle.includes('analytical')) {
    return 'Clear, authoritative, mid-range professional (e.g., ElevenLabs "Brian", "Daniel", "Charlotte", "Sophie")';
  }
  if (pacingStyle.includes('storytelling') || pacingStyle.includes('measured')) {
    return 'Storyteller timbre, expressive but controlled (e.g., ElevenLabs "David", "Liam", "Serena")';
  }
  return 'Clear, engaging, versatile (test 4-5 voices)';
}

function getStability(pacingStyle) {
  if (pacingStyle.includes('slow') || pacingStyle.includes('calm') || pacingStyle.includes('hypnotic')) return '85-95';
  if (pacingStyle.includes('fast') || pacingStyle.includes('energetic')) return '50-65';
  return '70-80';
}

function getSimilarity(pacingStyle) {
  if (pacingStyle.includes('hypnotic') || pacingStyle.includes('soothing')) return 'Low (15-25%)';
  if (pacingStyle.includes('authoritative') || pacingStyle.includes('professional')) return 'Medium (30-40%)';
  return 'Medium (30-40%)';
}

function getSpeed(pacingStyle) {
  if (pacingStyle.includes('slow') || pacingStyle.includes('calm') || pacingStyle.includes('hypnotic')) return '0.85-0.95';
  if (pacingStyle.includes('fast') || pacingStyle.includes('energetic') || pacingStyle.includes('moderately fast')) return '1.05-1.15';
  return '1.0';
}

function getVoiceSettingsByNiche(nicheName) {
  const settings = {
    'Ancient Mysteries / Dark History': 'Stability: 90, Similarity: 20%, Speed: 0.9, Voice: Deep male (Adam/Arnold)',
    'Sleep & Meditation Content': 'Stability: 95, Similarity: 15%, Speed: 0.85, Voice: Soft female (Grace/Bella)',
    'True Crime Documentaries': 'Stability: 80, Similarity: 35%, Speed: 1.0, Voice: Serious male (Brian/David)',
    'AI & Tech Explainers': 'Stability: 70, Similarity: 40%, Speed: 1.1, Voice: Clear professional (Charlotte/Emily)',
    'Personal Finance Explainers': 'Stability: 75, Similarity: 35%, Speed: 1.05, Voice: Trustworthy (Daniel/Serena)',
    'Business Case Studies': 'Stability: 75, Similarity: 35%, Speed: 1.0, Voice: Executive (Liam/Charlotte)',
    'History Documentaries': 'Stability: 85, Similarity: 25%, Speed: 0.95, Voice: Narrator (Arnold/David)',
    'Science & Space': 'Stability: 80, Similarity: 30%, Speed: 1.0, Voice: Wonder-driven (Sophie/Emily)'
  };
  return settings[nicheName] || 'Stability: 75, Similarity: 35%, Speed: 1.0, Voice: Test 4-5 options';
}

function getColorGrade(nicheName) {
  const grades = {
    'Ancient Mysteries / Dark History': 'Teal-orange split tone, crushed blacks, film grain overlay',
    'Sleep & Meditation Content': 'Cool shadows, warm highlights, soft glow, reduced contrast',
    'True Crime Documentaries': 'High contrast, desaturated, cold shadows, selective color (red accents)',
    'AI & Tech Explainers': 'Clean digital, slight cyan-teal lift, crisp blacks',
    'Luxury Watches & Collectibles': 'High key, controlled reflections, true blacks, macro detail pop',
    'Science & Space': 'Deep blacks, star-field preservation, nebula color pop'
  };
  return grades[nicheName] || 'Standard cinematic grade';
}

// Qualification checks - more flexible to allow AI-generated channels
function checkQualification(channelData, videos, nicheResult) {
  const fails = [];
  const warnings = [];

  // Video count - reduced minimum, allow more channels
  if (channelData.videoCount < 10) {
    fails.push(`This channel has only ${channelData.videoCount} videos — we need at least 10 to identify a content pattern.`);
  } else if (channelData.videoCount < 30) {
    warnings.push(`This channel has ${channelData.videoCount} videos — more videos would give a more reliable analysis.`);
  }

  // Subscriber/view thresholds - more flexible
  const recentVideos = videos.slice(0, 30);
  const avgViews = recentVideos.length > 0 ? recentVideos.reduce((sum, v) => sum + v.viewCount, 0) / recentVideos.length : 0;

  const isLikelyAI = nicheResult.aiDetection?.isLikelyAI || false;
  const hasGoodNicheMatch = nicheResult.niche && nicheResult.score >= 0.35;

  // For AI-generated channels, we can be more lenient on monetization thresholds
  const minSubs = isLikelyAI ? 100 : 500;
  const minAvgViews = isLikelyAI ? 100 : 500;

  if (channelData.subscriberCount < minSubs || avgViews < minAvgViews) {
    if (channelData.subscriberCount >= 1000 && avgViews >= 1000) {
      // This shouldn't happen with the thresholds above, but just in case
    } else if (isLikelyAI || hasGoodNicheMatch) {
      // For AI channels or good niche matches, show warning instead of fail
      warnings.push(`Channel has ${channelData.subscriberCount.toLocaleString()} subscribers and ${Math.round(avgViews).toLocaleString()} avg views — below typical monetization levels but acceptable for AI-produced content analysis.`);
    } else {
      fails.push(`This channel does not meet minimum thresholds (${minSubs}+ subscribers and ${minAvgViews}+ average views per video). Current: ${channelData.subscriberCount.toLocaleString()} subs, ${Math.round(avgViews).toLocaleString()} avg views.`);
    }
  }

  // Niche match - more flexible
  if (!nicheResult.niche) {
    if (isLikelyAI) {
      // If AI detected but no niche match, try to assign best matching niche anyway
      fails.push('This channel appears to use AI tools but does not clearly match a supported niche. Try a channel with more focused content.');
    } else {
      fails.push('This channel does not match any of our supported AI-producible niches.');
    }
  }

  return { fails, warnings, isLikelyAI, hasGoodNicheMatch };
}

// Alternative suggestions (hardcoded for Phase 1, expanded to one per niche)
const alternativeSuggestions = [
  { name: 'Uncharted Mysteries', niche: 'Ancient Mysteries / Dark History', handle: '@TheUnchartedMysteries' },
  { name: 'Andrei Jikh', niche: 'Business Case Studies', handle: '@AndreiJikh' },
  { name: 'JCS Criminal Psychology', niche: 'True Crime Documentaries', handle: '@JCS' },
  { name: 'Meditative Mind', niche: 'Sleep & Meditation Content', handle: '@MeditativeMind' },
  { name: 'MattVidPro AI', niche: 'AI & Tech Explainers', handle: '@MattVidPro' },
  { name: 'Business Casual', niche: 'Business Case Studies', handle: '@BusinessCasual' },
  { name: 'Kings and Generals', niche: 'History Documentaries', handle: '@KingsAndGenerals' },
  { name: 'Peter Zeihan', niche: 'Geopolitics & World Affairs', handle: '@PeterZeihan' },
  { name: 'Kurzgesagt', niche: 'Science & Space', handle: '@Kurzgesagt' },
  { name: 'Improvement Pill', niche: 'Psychology & Self-Improvement', handle: '@ImprovementPill' },
  { name: 'Teddy Baldassarre', niche: 'Luxury Watches & Collectibles', handle: '@TeddyBaldassarre' },
  { name: 'Traversy Media', niche: 'Coding Tutorials & Dev Education', handle: '@TraversyMedia' },
  { name: 'Graham Stephan', niche: 'Real Estate Investing', handle: '@GrahamStephan' },
  { name: 'Escaping Ordinary', niche: 'Book Summaries & Key Insights', handle: '@EscapingOrdinary' }
];

// New endpoint: /analyze-channel
app.post('/analyze-channel', async (req, res) => {
  const channelInput = req.body.channelUrl;
  const identifier = extractChannelIdentifier(channelInput);

  if (!identifier) {
    return res.status(400).json({ error: 'Invalid YouTube channel URL or handle.' });
  }

  try {
    const channelData = await getChannelData(identifier);
    const videoIds = await getVideoIds(channelData.uploadsPlaylistId, 30);
    const videos = await getVideosDetails(videoIds);

    const cadenceDays = calculateCadence(videos);
    const nicheResult = classifyNiche(channelData, videos);

    const qualification = checkQualification(channelData, videos, nicheResult);

    // If there are hard fails, return not-supported
    if (qualification.fails.length > 0) {
      return res.json({
        status: 'not-supported',
        reasons: qualification.fails,
        warnings: qualification.warnings,
        suggestions: alternativeSuggestions
      });
    }

    // Check if we have a valid niche (even with warnings, we can qualify)
    if (!nicheResult.niche) {
      return res.json({
        status: 'not-supported',
        reasons: ['Unable to determine a clear niche for this channel.'],
        warnings: qualification.warnings,
        suggestions: alternativeSuggestions
      });
    }

    const rpm = nicheResult.niche.rpm;
    const revenue = estimateRevenue(videos, cadenceDays, rpm);

    // Add uploadCadence to nicheResult for prompt generation
    nicheResult.uploadCadence = cadenceDays ? `~${Math.round(cadenceDays)} day(s)` : 'Consistent schedule (e.g., weekly)';

    const channelCard = buildChannelCard(channelData, videos, cadenceDays, revenue, nicheResult);
    const prompts = buildPromptTemplates(nicheResult.niche, channelData, videos, nicheResult);

    res.json({
      status: 'supported',
      channelCard,
      prompts,
      warnings: qualification.warnings,
      aiDetection: nicheResult.aiDetection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze channel. Make sure the URL is valid and API key is correct.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});