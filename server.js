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

// Helper: classify niche using three-signal scoring across all niches
function classifyNiche(channelData, videos) {
  const recentTitles = videos.slice(0, 30).map(v => v.title.toLowerCase());

  // Filter out Shorts (under 3 minutes) for accurate median duration calculation
  const longFormVideos = videos.slice(0, 30).filter(v => durationToMinutes(v.duration) >= 3);
  const durations = longFormVideos.map(v => durationToMinutes(v.duration));
  const medianDuration = durations.length > 0 ? median(durations) : 0;
  const desc = channelData.description.toLowerCase();

  let bestNiche = null;
  let bestScore = 0;
  let bestDetails = {};

  niches.forEach(niche => {
    // Signal 1: title keyword density
    const titleMatches = recentTitles.filter(title =>
      niche.keywords.some(keyword => title.includes(keyword))
    ).length;
    const titleDensity = recentTitles.length > 0 ? titleMatches / recentTitles.length : 0;

    // Signal 2: median video length in range
    const lengthInRange = medianDuration >= niche.videoLengthMin && medianDuration <= niche.videoLengthMax;

    // Signal 3: channel description keywords
    const descMatches = niche.keywords.filter(keyword => desc.includes(keyword)).length;

    // Weighted scoring (40% title, 35% length, 25% description)
    const titleScore = titleDensity >= 0.6 ? 1 : titleDensity / 0.6; // scale to 1
    const lengthScore = lengthInRange ? 1 : 0;
    const descScore = descMatches > 0 ? 1 : 0;

    const totalScore = (titleScore * 0.4) + (lengthScore * 0.35) + (descScore * 0.25);
    console.log(`Niche ${niche.name}: score=${totalScore.toFixed(3)}, titleDensity=${titleDensity.toFixed(2)}, lengthInRange=${lengthInRange}, descMatches=${descMatches}, medianDuration=${medianDuration.toFixed(1)}`);
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestNiche = niche;
      bestDetails = {
        titleDensity,
        medianDuration,
        lengthInRange,
        descMatches
      };
    }
  });

  let confidence = 'low';
  if (bestScore >= 0.75) confidence = 'high';
  else if (bestScore >= 0.5) confidence = 'medium';

  const matched = bestScore >= 0.5;

  return {
    niche: matched ? bestNiche : null,
    confidence,
    titleDensity: bestDetails.titleDensity || 0,
    medianDuration: bestDetails.medianDuration || 0,
    lengthInRange: bestDetails.lengthInRange || false,
    descMatches: bestDetails.descMatches || 0,
    score: bestScore
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

// Build 5-step prompt templates using niche data
function buildPromptTemplates(niche, channelData, videos) {
  const titles = videos.slice(0, 30).map(v => v.title);
  const titlePattern = titles.length > 0 ? titles[0] : 'Sample title';

  return {
    step1: {
      title: 'Step 1 — Topic Prompt',
      content: `Paste this into Claude:\nGenerate 10 video ideas for a ${niche.name} channel following this exact format:\n- Video length: ${niche.videoLengthMin}-${niche.videoLengthMax} minutes\n- Title style: ${titlePattern}\n- Topic types: ${niche.keywords.join(', ')}`
    },
    step2: {
      title: 'Step 2 — Script Prompt',
      content: `Paste this into Claude:\nWrite a full ${niche.videoLengthMin}-${niche.videoLengthMax} minute script for a ${niche.name} video on [TOPIC].\nStructure:\n- Follow the format of ${niche.formatFingerprint}\n- Use the pacing style: ${niche.pacingStyle}\n- Include accurate, verifiable facts`
    },
    step3: {
      title: 'Step 3 — Visual / Image Prompt',
      content: `Paste this into Claude:\nGenerate visual prompts for ${niche.aiTools.find(t => t.purpose.toLowerCase().includes('visual') || t.purpose.toLowerCase().includes('image'))?.name || 'your image tool'}.\nStyle: ${niche.visualApproach}\nAspect ratio: 16:9`
    },
    step4: {
      title: 'Step 4 — Voice Settings',
      content: `ElevenLabs settings:\n- Voice type: ${niche.pacingStyle.includes('calm') ? 'deep, calm, soothing male/female' : 'clear, authoritative, professional'}\n- Stability: ${niche.pacingStyle.includes('slow') ? '90' : '70'}\n- Style exaggeration: ${niche.pacingStyle.includes('hypnotic') ? 'Low' : 'Medium'}\n- Test: 3-4 voices with same 200-word passage`
    },
    step5: {
      title: 'Step 5 — Assembly Workflow',
      content: `Editing instructions:\n- Format: ${niche.formatFingerprint}\n- Visual approach: ${niche.visualApproach}\n- Pacing: ${niche.pacingStyle}\n- Upload cadence: ${channelData.videoCount > 0 ? 'one video per week' : 'consistent schedule'}\n- Disclosure: Add YouTube's AI-generated content label`
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

// New endpoint: /clone-channel
app.post('/clone-channel', async (req, res) => {
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

    const fails = checkQualification(channelData, videos, nicheResult);
    if (fails.length > 0) {
      return res.json({
        status: 'disqualified',
        reasons: fails,
        suggestions: alternativeSuggestions
      });
    }

    const rpm = nicheResult.niche.rpm;
    const revenue = estimateRevenue(videos, cadenceDays, rpm);

    const channelCard = buildChannelCard(channelData, videos, cadenceDays, revenue, nicheResult);
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