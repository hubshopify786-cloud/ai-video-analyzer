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
  const container = document.getElementById('promptsContainer');
  container.innerHTML = '';

  Object.values(prompts).forEach((prompt, index) => {
    const card = document.createElement('div');
    card.className = 'prompt-card';

    const header = document.createElement('div');
    header.className = 'prompt-card-header';

    const title = document.createElement('h3');
    title.textContent = prompt.title;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(prompt.content).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
      });
    });

    header.appendChild(title);
    header.appendChild(copyBtn);

    const pre = document.createElement('pre');
    pre.textContent = prompt.content;

    card.appendChild(header);
    card.appendChild(pre);

    container.appendChild(card);
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
        window.lastCloneData = data;

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
function generateExportHTML(data) {
  const { channelCard, prompts } = data;
  const toolStackHTML = channelCard.aiToolStack.map(tool =>
    `<span class="tool-badge">${tool.name} — ${tool.purpose}</span>`
  ).join('');

  const promptStepsHTML = Object.values(prompts).map((prompt, index) => `
    <div class="step">
      <div class="step-title">
        <span class="prompt-label">STEP ${index + 1}</span>
        <h3>${prompt.title}</h3>
      </div>
      <div class="copy-card">
        <pre>${prompt.content}</pre>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${channelCard.niche} — Production System</title>
<style>
  :root{
    --bg:#070b14;
    --panel:#101827;
    --panel-2:#151e2f;
    --border:#27344b;
    --text:#f5f7fb;
    --muted:#9ca9bc;
    --yellow:#ffc400;
    --yellow-2:#ffb300;
    --blue:#55b7ff;
    --purple:#9d7cff;
    --green:#63d6a2;
    --orange:#ff9d42;
    --shadow:0 18px 50px rgba(0,0,0,.35);
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0;
    background:
      radial-gradient(circle at 80% 0%, rgba(73,94,145,.20), transparent 32%),
      radial-gradient(circle at 0% 30%, rgba(255,196,0,.05), transparent 28%),
      var(--bg);
    color:var(--text);
    font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    line-height:1.65;
  }
  .page{width:min(1180px, calc(100% - 34px));margin:0 auto;padding:42px 0 80px;}
  .hero{position:relative;overflow:hidden;padding:44px;border:1px solid var(--border);border-radius:28px;background:linear-gradient(145deg, #111a2b 0%, #0c1321 70%);box-shadow:var(--shadow);}
  .hero:after{content:"";position:absolute;width:420px;height:420px;right:-180px;top:-220px;border-radius:50%;background:rgba(255,196,0,.08);filter:blur(5px);}
  .eyebrow{color:var(--yellow);font-weight:800;letter-spacing:.16em;text-transform:uppercase;font-size:13px;}
  h1{margin:12px 0 12px;font-size:clamp(38px,6vw,76px);line-height:1.02;letter-spacing:-.045em;max-width:900px;}
  .hero-sub{color:var(--muted);font-size:18px;max-width:850px;}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:30px;}
  .stat{padding:19px;border:1px solid var(--border);border-radius:17px;background:rgba(255,255,255,.025);}
  .stat strong{display:block;color:var(--yellow);font-size:26px;line-height:1.1;margin-bottom:5px;}
  .stat span{color:var(--muted);font-size:13px;}
  .section{margin-top:24px;padding:30px;border:1px solid var(--border);border-radius:24px;background:linear-gradient(145deg, rgba(20,30,47,.96), rgba(11,17,29,.96));box-shadow:0 12px 35px rgba(0,0,0,.18);}
  .section-head{display:flex;align-items:flex-start;gap:18px;margin-bottom:22px;}
  .number{flex:0 0 52px;width:52px;height:52px;display:grid;place-items:center;border-radius:50%;color:#08101c;background:var(--yellow);font-size:22px;font-weight:900;}
  .number.blue{background:var(--blue)}
  .number.purple{background:var(--purple)}
  .number.green{background:var(--green)}
  .number.orange{background:var(--orange)}
  h2{margin:0;font-size:30px;line-height:1.15;letter-spacing:-.02em;}
  .section-kicker{margin-top:5px;color:var(--muted);font-size:14px;}
  .channel{border-left:4px solid var(--yellow);padding:5px 0 5px 20px;margin-bottom:24px;}
  .channel strong{color:var(--yellow)}
  .step{margin-top:30px;}
  .step-title{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
  .step-title h3{margin:0;font-size:24px;}
  .prompt-label{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;background:rgba(255,196,0,.12);color:var(--yellow);border:1px solid rgba(255,196,0,.25);font-size:12px;font-weight:800;letter-spacing:.04em;}
  .copy-card{position:relative;margin-top:14px;padding:25px;border:1px solid #34415a;border-radius:18px;background:#0a101b;}
  .copy-card pre{white-space:pre-wrap;word-break:break-word;background:transparent;color:#dfe5ef;font-size:0.95rem;line-height:1.6;margin:0;}
  .tool-badge{display:inline-block;background:rgba(255,196,0,.12);border:1px solid rgba(255,196,0,.25);color:var(--yellow);padding:4px 12px;border-radius:999px;margin:4px;font-size:0.85rem;}
  .divider{height:1px;background:linear-gradient(90deg, transparent, var(--border), transparent);margin:30px 0;}
  .tip{margin-top:20px;padding:18px 20px;border:1px dashed rgba(255,196,0,.42);border-radius:15px;background:rgba(255,196,0,.045);}
  .tip strong{color:var(--yellow)}
  .footer{margin-top:24px;text-align:center;color:var(--muted);font-size:13px;}
  @media(max-width:800px){
    .page{width:min(100% - 20px,1180px);padding-top:20px}
    .hero{padding:28px 22px;border-radius:21px}
    .section{padding:22px 18px;border-radius:20px}
    .stats{grid-template-columns:repeat(2,1fr)}
    h1{font-size:44px}
  }
  @media(max-width:480px){
    .stats{grid-template-columns:1fr}
    .section-head{gap:12px}
    .number{flex-basis:44px;width:44px;height:44px;font-size:18px}
    h2{font-size:25px}
    .copy-card{padding:18px}
  }
  @media print{
    body{background:white;color:#111}
    .hero,.section{box-shadow:none;background:white;border-color:#ccc}
    .eyebrow,.stat strong,.channel strong,.prompt-label,.tip strong{color:#a66b00}
    .muted,.hero-sub,.section-kicker,.stat span,.footer{color:#555}
    .copy-card{background:#fafafa;border-color:#ccc}
    .page{width:100%;padding:0}
  }
</style>
</head>
<body>
<main class="page">
  <header class="hero">
    <div class="eyebrow">${channelCard.niche} • Production System</div>
    <h1>One Video a Week = $${Math.round(channelCard.estimatedMonthlyRevenue.replace(/[^0-9.-]/g,''))}/Month</h1>
    <p class="hero-sub">${channelCard.formatFingerprint}</p>
    <div class="stats">
      <div class="stat"><strong>${channelCard.subscribers}</strong><span>subscribers</span></div>
      <div class="stat"><strong>${channelCard.videoCount}</strong><span>videos</span></div>
      <div class="stat"><strong>${channelCard.estimatedMonthlyRevenue}</strong><span>est. / month</span></div>
      <div class="stat"><strong>${channelCard.uploadCadence}</strong><span>uploads</span></div>
    </div>
  </header>

  <section class="section">
    <div class="section-head">
      <div class="number">1</div>
      <div>
        <h2>THE CHANNEL (study it first)</h2>
        <div class="section-kicker">Reference channel and production model</div>
      </div>
    </div>

    <div class="channel">
      <strong>${channelCard.name}:</strong> <a href="${channelCard.url}" target="_blank" rel="noopener noreferrer">${channelCard.url}</a>
    </div>

    <p>${channelCard.videoCount} videos → ${channelCard.subscribers} subscribers → est. ${channelCard.estimatedMonthlyRevenue}/month → ${channelCard.uploadCadence} uploads</p>
    <p><strong>Why it works:</strong> ${channelCard.whyItWorks}</p>
    <p><strong>Watch 15 minutes of their top video before starting.</strong> Notice the narration pace, visual style, and chapter structure.</p>
    <div class="divider"></div>
    ${promptStepsHTML}
  </section>

  <section class="section">
    <div class="section-head">
      <div class="number orange">!</div>
      <div>
        <h2>THE HONEST PART</h2>
        <div class="section-kicker">The long-term rule</div>
      </div>
    </div>
    <div class="copy-card">
      <p>This system removes the production barrier. It doesn't remove the consistency requirement. Keep the content honest. Real unexplained things are fascinating enough. The moment a channel invents or misleads, the audience and the algorithm both leave.</p>
    </div>
  </section>

  <div class="footer">Generated by CloneThis — AI Channel Cloning Engine</div>
</main>
</body>
</html>`;
}

function downloadHTMLContent(html, filename, mimeType) {
  const blob = new Blob([html], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportHTML() {
  const data = window.lastCloneData;
  if (!data) {
    alert('No channel analyzed yet. Please analyze a channel first.');
    return;
  }
  const html = generateExportHTML(data);
  const filename = `${data.channelCard.name.replace(/\s+/g, '-')}-clone-playbook.html`;
  downloadHTMLContent(html, filename, 'text/html');
}

function exportPDF() {
  const data = window.lastCloneData;
  if (!data) {
    alert('No channel analyzed yet. Please analyze a channel first.');
    return;
  }
  const html = generateExportHTML(data);
  const newWindow = window.open('', '_blank');
  newWindow.document.write(html);
  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
}

function exportDOCX() {
  const data = window.lastCloneData;
  if (!data) {
    alert('No channel analyzed yet. Please analyze a channel first.');
    return;
  }
  const html = generateExportHTML(data);
  const filename = `${data.channelCard.name.replace(/\s+/g, '-')}-clone-playbook.doc`;
  downloadHTMLContent(html, filename, 'application/msword');
}
document.getElementById('exportHtmlBtn').addEventListener('click', exportHTML);
document.getElementById('exportPdfBtn').addEventListener('click', exportPDF);
document.getElementById('exportDocxBtn').addEventListener('click', exportDOCX);