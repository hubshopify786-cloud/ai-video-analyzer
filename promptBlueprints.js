// promptBlueprints.js
// Full prompt engineering system for CreatorRoadmap
// Each niche has 5 tailored prompt templates

module.exports = {
  'ancient-mysteries': {
    step1: `You are a YouTube content strategist specializing in the Ancient Mysteries / Dark History niche. I need 10 video ideas for a channel like "{{channelName}}" that produce {{formatFingerprint}}. 

CHANNEL CONTEXT:
- Niche: {{nicheName}}
- Typical video length: {{videoLengthMin}}-{{videoLengthMax}} minutes
- Pacing style: {{pacingStyle}}
- Visual approach: {{visualApproach}}
- Avg monthly revenue: {{rpm}} RPM
- Upload cadence: {{uploadCadence}}

TITLE PATTERNS TO EMULATE (based on actual video titles from this channel):
{{titlePatterns}}

TOP KEYWORDS (from this channel):
{{topKeywords}}

REQUIREMENTS FOR EACH TOPIC:
- Built on real archaeological sites, artifacts, unexplained phenomena, or dark historical events.
- Trigger curiosity and the feeling: "How is that even possible?"
- Support 7-12 chapters of 8-12 minutes each.
- Evergreen interest with strong search demand.
- Suitable for a global English-speaking audience (US-heavy).

TITLE FORMULAS THAT WORK:
- "[Number] IMPOSSIBLE [Ancient Things] That Can't Be Explained"
- "[Age]-Year-Old [Discovery] We CANNOT Explain"
- "The GREATEST [Category] Discoveries of [Year]"
- "[Number] Mysteries That Still Puzzle Scientists"

OUTPUT FORMAT:
For each topic (1-10), provide:
1. Title (following a pattern above)
2. Chapter potential (list 7-10 real sites/artifacts/discoveries)
3. Curiosity Score (1-10)
4. Why viewers can't scroll past (1-2 sentences)
5. Search demand (High/Medium/Low) with estimated monthly search volume (if possible)

Start with #1 and continue until #10.`,
    step2: `You are an expert documentary scriptwriter for a long-form Ancient Mysteries / Dark History channel. Write a complete narration script for:

TOPIC: [INSERT CHOSEN TOPIC FROM STEP 1]
CHAPTERS: [PASTE THE CHAPTER LIST FROM STEP 1]

SCRIPT LENGTH: approximately {{scriptWords}} words (this will become a {{videoLengthMin}}-{{videoLengthMax}} minute video at 150 wpm).

FORMAT (based on "{{channelName}}" style):
- Format: {{formatFingerprint}}
- Pacing: {{pacingStyle}}
- Visual approach: {{visualApproach}}

STRUCTURE:
1. Cold open (300-400 words): Open on the single most impossible detail from the whole video—a number, a measurement, an unexplained fact. No greetings, no channel intro. End by promising what the viewer will understand by the end.
2. One chapter per mystery/site/discovery. Each chapter (1,200-1,600 words) follows this arc:
   - Set the scene cinematically.
   - Present the discovery with real facts (dates, measurements, locations).
   - Explain why it defies easy explanation.
   - Present leading theories.
   - End on an open question that bridges to the next chapter.
3. Closing chapter (400-500 words): Connect the mysteries into one bigger reflection, end on a calm, wondering note (this is sleep/background content, never end on alarm).

PACING RULES:
- Calm, measured, atmospheric. Long flowing sentences are welcome. No hype, no "you won't BELIEVE this."
- A new intriguing detail every 200-300 words, delivered with quiet wonder rather than drama.
- Chapters must work standalone—viewers drop in and out. Briefly re-anchor context at each chapter start.

ACCURACY RULES (non-negotiable):
- Every site, artifact, date, and measurement must be real and verifiable.
- Present facts as facts, theories as theories, and fringe speculation as speculation—clearly labeled ("some researchers suggest...", "one controversial theory claims...").
- Never invent quotes, researchers, studies, or discoveries. If something is genuinely unexplained, say exactly that—the honest mystery IS the content.

OUTPUT: First give me the chapter outline with estimated word counts, then write the full script chapter by chapter. After the outline, wait for me to say "continue" before each chapter so I can review as we go.`,
    step3: `You are a cinematic storyboard artist for an Ancient Mysteries documentary. Convert my script into image generation prompts for {{imageTool}}.

VISUAL STYLE (every image, no exceptions):
- {{visualApproach}}
- Lighting: golden hour or moody overcast.
- Epic scale—vast landscapes, massive ancient structures, tiny human figures for scale where appropriate.
- Atmospheric depth: mist, dust particles in light beams, dramatic clouds.
- Muted earth tones with deep shadows.
- Shot like a high-budget documentary—wide establishing shots, dramatic low angles, aerial views.
- No text in images, no cartoon styles, no fantasy elements that misrepresent the real site.

FOR EACH SCRIPT SECTION:
1. One establishing wide shot of the location.
2. 2-3 detail shots (carvings, stonework, artifacts, terrain).
3. One atmosphere shot (the site at dusk, in mist, from above).

RULES:
- Stay faithful to how the real site/artifact actually looks—this is a documentary, not fantasy art. Reference real architecture, materials, landscape.
- Every image must feel like it belongs to the same film: same lighting language, same color grade, same lens feel.

OUTPUT FORMAT:
IMAGE 1
Script line: "[the line this image covers]"
Prompt: [detailed prompt]

Generate 10 prompts per batch, then wait for "next batch."

TOOL TIPS:
{{imageToolTips}}`,
    step4: `Configure ElevenLabs for a channel like "{{channelName}}" with the following settings:

RECOMMENDED VOICE PROFILE:
- Voice type: {{voiceType}}
- Stability: {{stability}}
- Similarity/Style Exaggeration: {{similarity}}
- Speed: {{speed}} (1.0 = normal)

TESTING PROTOCOL:
1. Generate 30-second test with same 200-word passage across 4-5 voices.
2. Score each on naturalness, niche fit, and listener fatigue.
3. Pick top 2, generate full script with both.
4. A/B test on retention if possible.

GENERATION WORKFLOW:
- Generate chapter by chapter, not whole script at once.
- Keep one master reference clip—if later chapters drift, regenerate against it.
- Export WAV, 48kHz.

POST-PROCESSING:
- Normalize to -16 LUFS (YouTube standard).
- Light compression (2:1, slow attack).
- De-ess if needed.
- Add subtle room tone for realism.

COMPLIANCE:
- Label video as "Altered or synthetic content" in YouTube upload settings.`,
    step5: `COMPLETE PRODUCTION WORKFLOW for "{{channelName}}"-style {{nicheName}} channel:

📋 PRE-PRODUCTION (Day 1-2)
- Topic selected from Step 1.
- Script finalized from Step 2 (fact-checked, [SOURCE NEEDED] resolved).
- Shot list created from Step 3.
- Voice selected & tested from Step 4.
- Thumbnail concepts drafted.

🎬 PRODUCTION (Day 2-4)
1. VOICEOVER: Generate full narration in ElevenLabs (or chosen tool).
   - Batch by chapter.
   - Export WAV, 48kHz.
2. VISUALS: Generate AI images in {{imageTool}} per shot list.
   - Use style reference for consistency.
   - Upscale to 4K (Topaz/waifu2x).
   - Organize by chapter/timestamp.
3. MUSIC: Ambient soundtrack—low drones, soft atmospheric.
   - Music at -20dB under narration.
   - Sources: Suno, Epidemic Sound.

✂️ EDITING (Day 4-6) — {{videoTool}}
- Import voiceover, visuals, music.
- Rough cut: lay voiceover, trim silence.
- Visual sync: match visuals to narration cues.
- Ken Burns slow zoom on static images (45-75 sec per image).
- Add YouTube chapters for every section—chapter titles are searchable.
- Lower thirds: chapter titles, key names/dates.
- Color grade: teal-orange split, crushed blacks.
- Audio mix: voice -6dB, music -18 to -24dB under voice.
- Captions: auto-generate (Submagic) + manual cleanup.

📤 PUBLISHING (Day 7)
- Title: From Step 1, optimized for CTR.
- Description: Script summary + timestamps + links + disclosure.
- Thumbnail: one epic cinematic image + 2-4 words max.
- Playlist: Add to relevant series.
- Schedule: consistent day/time weekly.
- Disclosure: Enable "Altered or synthetic content" label.

📊 POST-PUBLISH (Day 7-30)
- Monitor retention graph—note drop-off points for next video.
- Reply to every comment in first 24h.
- Community post: behind-the-scenes / poll for next topic.
- Analytics review at 7d/30d: CTR, AVD, sub conversion.

⚠️ COMPLIANCE CHECKLIST
☐ YouTube "Altered or synthetic content" label enabled
☐ No misleading claims—all facts verified
☐ Music/SFX licensed for commercial use
☐ Visuals: no copyrighted characters/logos without permission
☐ Affiliate/sponsor disclosures in description

🔁 REPEAT: Next video starts Day 1 while current publishes.`
  },

  'personal-finance': {
    step1: `You are a YouTube strategist for a Personal Finance channel like "{{channelName}}". Generate 10 video ideas that fit the format: {{formatFingerprint}}.

CHANNEL CONTEXT:
- Niche: {{nicheName}}
- Typical video length: {{videoLengthMin}}-{{videoLengthMax}} minutes
- Pacing: {{pacingStyle}}
- Visual approach: {{visualApproach}}
- RPM: {{rpm}}
- Upload cadence: {{uploadCadence}}

TITLE PATTERNS (from this channel):
{{titlePatterns}}

TOP KEYWORDS:
{{topKeywords}}

REQUIREMENTS:
- Topics must address real financial pain points (debt, saving, investing, retirement) or emerging wealth-building strategies.
- High commercial value—attracts finance advertisers.
- Suitable for beginners but valuable for advanced viewers.
- Fact-checkable; any numbers must be accurate.

TITLE FORMULAS:
- "[Number] Money Mistakes You Must Avoid"
- "How [Person] Built $[Amount] Net Worth (Step-by-Step)"
- "[Year] Passive Income Strategy for Beginners"
- "The Only [Topic] Guide You'll Ever Need"

OUTPUT:
For each idea:
1. Title (pattern-matched)
2. Target audience
3. Key value proposition (1 sentence)
4. Outline (3-5 main points)
5. Search demand (High/Medium/Low)
6. Affiliate potential (High/Medium/Low)`,
    step2: `You are an expert financial scriptwriter. Write a clear, engaging, and educational script for a {{videoLengthMin}}-{{videoLengthMax}} minute video on [TOPIC].

CHANNEL STYLE:
- Voice: {{pacingStyle}}
- Visual: {{visualApproach}}
- Format: {{formatFingerprint}}

STRUCTURE:
1. Hook (0:00-0:30): Pose a relatable problem or bold claim with numbers.
2. Context (0:30-2:00): Explain why this matters now.
3. Main content (2:00-{{videoLengthMax-2}}): 3-5 key points, each with:
   - Explanation using simple analogies
   - Real-world example or case study
   - Actionable step
4. Summary and call to action.
5. Outro: subscribe + next video teaser.

ACCURACY RULES:
- Every figure must be current (as of 2026) and sourced.
- Explain concepts in plain language—avoid jargon unless defined.
- Include disclaimers where appropriate ("This is not financial advice").

OUTPUT:
Provide the script in full, with timestamps and bullet points for visuals. Add [VISUAL CUE] markers for animations or charts.`,
    step3: `You are a visual designer for a Personal Finance channel. Convert the script into visual prompts for {{imageTool}} or Canva.

VISUAL STYLE:
- {{visualApproach}}
- Clean, modern, trustworthy.
- Use green for positive, red for negative.
- Include charts, graphs, and simple icons.

FOR EACH SECTION:
1. Title card with key concept.
2. Animated chart or infographic.
3. Real-life photo (stock) illustrating the scenario.
4. Text overlay with key numbers.

OUTPUT:
For each visual, provide:
- Type (chart/photo/icon)
- Description
- Tool suggestion (Canva, DaVinci, etc.)
- Text content (if overlay)

Generate in batches of 5.`,
    step4: `Configure voiceover for a Personal Finance channel. Use ElevenLabs.

VOICE PROFILE:
- Type: {{voiceType}}
- Stability: {{stability}}
- Similarity: {{similarity}}
- Speed: {{speed}}

TEST:
- Test 4-5 voices with a 200-word passage about compound interest.
- Choose the one that sounds most credible and professional.

GENERATION:
- Generate chapter by chapter.
- Export WAV 48kHz.
- Normalize to -16 LUFS.

DISCLOSURE:
- Label as "Altered or synthetic content".`,
    step5: `PRODUCTION WORKFLOW for Personal Finance:

📋 PRE-PRODUCTION (Day 1)
- Topic from Step 1.
- Script from Step 2 (fact-check).
- Visual plan from Step 3.
- Voice from Step 4.

🎬 PRODUCTION (Day 2-3)
- Voiceover generation.
- Visuals: create charts, gather stock, screen record if needed.
- Music: upbeat but professional, -18dB under voice.

✂️ EDITING (Day 4-5)
- Use DaVinci Resolve or CapCut.
- Sync visuals to voice.
- Add lower thirds for definitions.
- Keep pace moderate.

📤 PUBLISHING
- Title from Step 1.
- Description with timestamps, sources, disclaimer.
- Thumbnail: face or bold text with numbers.
- Schedule weekly.

⚠️ COMPLIANCE
- Financial disclaimer in description.
- Verify all data.
- No promises of returns.`
  },

  'true-crime': {
    step1: `You are a YouTube strategist for True Crime. Generate 10 video ideas for a channel like "{{channelName}}".

CHANNEL CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Cases must be real, factual, and respectful to victims.
- Prefer lesser-known but compelling cases, or new angles on famous ones.
- High emotional stakes, clear narrative arc.
- Ethical: no glorification, no victim blaming, include trigger warnings.

OUTPUT:
For each:
1. Title (curiosity gap)
2. Case summary (2 sentences)
3. Why it works (1 sentence)
4. Key evidence/twist
5. Sensitivity level

Start with #1.`,
    step2: `You are a true crime documentary scriptwriter. Write a {{videoLengthMin}}-{{videoLengthMax}} minute script for [CASE].

STRUCTURE:
- Cold open: start at the most dramatic moment.
- Background: victim and setting.
- Investigation: chronological, with evidence.
- Resolution/aftermath.
- Reflection: lessons, justice status.

ACCURACY:
- All facts verified.
- Respectful tone toward victims and families.
- Present theory as theory, fact as fact.

OUTPUT: Script with [SOUND EFFECT] and [VISUAL] cues.`,
    step3: `You are a visual researcher for True Crime. Provide visual descriptions for archival photos, maps, court documents, and AI reconstructions.

RULES:
- Use real public domain images where possible.
- For AI reconstructions (Midjourney), describe scenes without showing violence.
- Format: [TYPE] - description.`,
    step4: `Voice settings for True Crime:
- Voice: serious male (e.g., Brian, David).
- Stability: 80, Similarity: 35, Speed: 1.0.
- Test with a 200-word passage about a court trial.`,
    step5: `Production workflow for True Crime:
- Editing: CapCut.
- Music: tense, low drones.
- Chapters: add timestamps.
- Thumbnail: high contrast, victim/evidence.
- Upload weekly.`
  },

  'sleep-meditation': {
    step1: `You are a content strategist for Sleep & Meditation channel. Generate 10 video ideas.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: 2-8 hours
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- No jarring sounds or fast cuts.
- Themes: sleep, relaxation, healing, ambient.
- Repetitive, loop-friendly.

OUTPUT: Title, duration, description.`,
    step2: `Write a minimal narration script (or no narration) for a sleep video.

RULES:
- Soft, slow, repetitive.
- Use soothing imagery words.
- No sudden loud sounds.

OUTPUT: Narration lines (if any) and timestamp for silence.`,
    step3: `Visual prompt for sleep video:
- Style: dreamy, soft, dark blues/purples.
- Description of looping scene (starfield, clouds, ocean).
- Aspect: 16:9, no text.`,
    step4: `Voice: very soft female (ElevenLabs Grace).
Stability: 95, Similarity: 15, Speed: 0.85.
Or no voice, only music.`,
    step5: `Assembly: looping video with crossfade, music low, export 2-8 hours.`
  },

  'ai-tech': {
    step1: `You are a tech YouTuber strategist. Generate 10 video ideas for AI & Tech channel.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Focus on trending AI tools, tutorials, or breakthroughs.
- Practical value: viewers can apply.
- Evergreen vs news balance.

OUTPUT: Title, outline, target audience, tool needed.`,
    step2: `Write a step-by-step tutorial script for [TOOL/TOPIC].

STRUCTURE:
- Hook: problem solved.
- Setup: requirements.
- Step-by-step with screen recording cues.
- Tips and gotchas.
- Conclusion and call to action.`,
    step3: `Visuals: screen recordings with zoom highlights, text overlays, simple animations.
Use OBS and CapCut.`,
    step4: `Voice: clear professional (Charlotte or Emily).
Stability: 70, Similarity: 40, Speed: 1.1.`,
    step5: `Editing: tight cuts, zooms on key steps.
Thumbnail: bold text, tool logo.
Upload twice weekly.`
  },

  'business-case-studies': {
    step1: `You are a business YouTube strategist. Generate 10 video ideas for Business Case Studies.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Startup stories, brand failures, billionaire breakdowns.
- Strong narrative, business metrics.
- Attracts business advertisers.

OUTPUT: Company, story angle, key metrics, lesson.`,
    step2: `Write a narrative script about [COMPANY/STORY].

STRUCTURE:
- Hook: shocking fact or result.
- Rise/fall timeline.
- Analysis: what went right/wrong.
- Key lesson for entrepreneurs.

ACCURACY: verify all numbers.`,
    step3: `Visuals: stock footage, company logos (public domain), charts.
Use Storyblocks/Pexels.`,
    step4: `Voice: executive male (Liam or Daniel).
Stability: 75, Similarity: 35, Speed: 1.0.`,
    step5: `Editing: CapCut, structured sequences, background music.
Upload weekly.`
  },

  'history-documentaries': {
    step1: `You are a history YouTube strategist. Generate 10 video ideas for History Documentaries.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Evergreen topics with search demand.
- Use original or under-told stories.

OUTPUT: Title, time period, key events, why viewers watch.`,
    step2: `Write a historical narrative script for [TOPIC].

STRUCTURE:
- Context: time period, key figures.
- Chronological events.
- Analysis: significance.
- Conclusion: impact today.

ACCURACY: cite sources.`,
    step3: `Visuals: period paintings, maps, archival photos. Use Midjourney for artwork if needed.`,
    step4: `Voice: authoritative narrator (Arnold or David). Stability: 85, Speed: 0.95.`,
    step5: `Editing: Ken Burns effect, map animations. Upload weekly.`
  },

  'geopolitics': {
    step1: `You are a geopolitics strategist. Generate 10 video ideas.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Current events with historical context.
- Objective analysis, multiple viewpoints.

OUTPUT: Topic, regions involved, angle, complexity.`,
    step2: `Write an analytical script for [TOPIC].

STRUCTURE:
- Hook: why this matters now.
- Background.
- Current situation.
- Future scenarios.
- Balanced conclusion.`,
    step3: `Visuals: maps (MapChart), flags, news footage.`,
    step4: `Voice: professional neutral (Brian). Stability: 80, Speed: 1.0.`,
    step5: `Editing: smooth map transitions. Upload 2-3 times per week.`
  },

  'science-space': {
    step1: `You are a science communicator. Generate 10 video ideas for Science & Space.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Fascinating discoveries, explained simply.
- Use public domain NASA/ESA footage.

OUTPUT: Topic, why fascinating, visuals available.`,
    step2: `Write a script for [TOPIC] with wonder-driven tone.

STRUCTURE:
- Hook: mind-blowing fact.
- Explanation.
- Implications.
- Future.`,
    step3: `Visuals: NASA footage, CGI animations. Use Blender for animations.`,
    step4: `Voice: wonder-driven (Sophie/Emily). Stability: 80, Speed: 1.0.`,
    step5: `Editing: dynamic, but not too fast. Upload weekly.`
  },

  'psychology-self-improvement': {
    step1: `You are a self-improvement strategist. Generate 10 video ideas.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Practical, science-backed.
- Habits, productivity, mindset.

OUTPUT: Topic, key takeaways, target audience.`,
    step2: `Write a script with clear actionable steps.

STRUCTURE:
- Problem identification.
- Science/psychology basis.
- Practical steps.
- Implementation challenge.`,
    step3: `Visuals: simple animations, stock lifestyle footage. Canva.`,
    step4: `Voice: friendly, encouraging (Grace/Serena). Stability: 75, Speed: 1.0.`,
    step5: `Editing: clean, minimal. Upload twice weekly.`
  },

  'luxury-watches': {
    step1: `You are a luxury watch expert. Generate 10 video ideas.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- High-end, detailed, passionate.
- Watch reviews, history, investment.

OUTPUT: Watch/brand, angle, exclusivity.`,
    step2: `Write a script for [WATCH] with connoisseur tone.

STRUCTURE:
- Introduction: emotional appeal.
- Design/features.
- Movement.
- Value/investment.
- Conclusion.`,
    step3: `Visuals: macro photography, manufacturer renders.`,
    step4: `Voice: refined (Liam). Stability: 75, Speed: 0.9.`,
    step5: `Editing: slow, elegant. Upload weekly.`
  },

  'coding-tutorials': {
    step1: `You are a coding educator. Generate 10 video ideas.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Practical projects, trending tech.
- Beginner to advanced.

OUTPUT: Topic, language, target skill level.`,
    step2: `Write a tutorial script with code-along.

STRUCTURE:
- Setup.
- Step-by-step.
- Common errors.
- Final project.

Include code snippets (placeholders).`,
    step3: `Visuals: screen recording, code highlight, terminal.`,
    step4: `Voice: clear (Charlotte). Stability: 70, Speed: 1.05.`,
    step5: `Editing: precise cuts at key points. Upload 2-3 times weekly.`
  },

  'real-estate-investing': {
    step1: `You are a real estate investing strategist. Generate 10 video ideas.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Deal analysis, market trends, strategies.

OUTPUT: Topic, type (how-to, case study), value.`,
    step2: `Write a script for [TOPIC] with numbers-driven analysis.

STRUCTURE:
- Hook: potential returns.
- Method/strategy.
- Case study or example.
- Risks and mitigation.
- Action steps.`,
    step3: `Visuals: spreadsheets, property photos, charts.`,
    step4: `Voice: authoritative (Daniel). Stability: 75, Speed: 1.0.`,
    step5: `Editing: clear charts, numbers highlighted. Upload weekly.`
  },

  'book-summaries': {
    step1: `You are a book summary strategist. Generate 10 video ideas.

CONTEXT:
- Format: {{formatFingerprint}}
- Length: {{videoLengthMin}}-{{videoLengthMax}} min
- Pacing: {{pacingStyle}}
- Visual: {{visualApproach}}

REQUIREMENTS:
- Popular books with strong lessons.
- Actionable insights.

OUTPUT: Book title, core message, target audience.`,
    step2: `Write a summary script of [BOOK].

STRUCTURE:
- Hook: transformative idea.
- 3-5 key lessons.
- Practical application.
- Recommendation.`,
    step3: `Visuals: book cover, concept graphics.`,
    step4: `Voice: warm (Serena). Stability: 75, Speed: 1.0.`,
    step5: `Editing: clean, text overlays. Upload weekly.`
  }
};