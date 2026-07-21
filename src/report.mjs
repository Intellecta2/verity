import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function writeReport({ report, htmlPath, jsonPath }) {
  await fs.mkdir(path.dirname(htmlPath), { recursive: true });
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await fs.writeFile(htmlPath, renderHtml(report), 'utf8');
}

export function renderHtml(report) {
  const payload = JSON.stringify(report).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(report.project.name)} — Verity evidence report</title>
  <style>
    :root { --ink:#12222f; --muted:#61717f; --paper:#f8fafc; --card:#fff; --line:#dbe4ea; --pass:#06705a; --review:#a15b00; --fail:#bd3346; --accent:#076f8f; --accent-2:#1a4a72; }
    * { box-sizing:border-box } body { margin:0; background:var(--paper); color:var(--ink); font:15px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .shell { width:min(1120px, calc(100% - 36px)); margin:0 auto; }
    header { background:linear-gradient(132deg,#092b3d 0%,#0d6f88 55%,#44a5a5 100%); color:#fff; padding:44px 0 38px; box-shadow:0 8px 30px #0c293326; }
    .brand { display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; font-size:12px; opacity:.92; }
    .mark { width:26px;height:26px;border:2px solid #baf4f0;border-radius:8px;display:grid;place-items:center;font-size:15px; }
    h1 { margin:18px 0 6px; font-size:clamp(30px,5vw,48px); letter-spacing:-.045em; line-height:1.04; }
    .subtitle { margin:0; max-width:700px; color:#d5f2f3; font-size:18px; } .stamp { margin-top:18px; color:#c6e7ea; font-size:13px; }
    main { padding:30px 0 58px; } .overview { display:grid; grid-template-columns:1.5fr 1fr; gap:16px; margin-bottom:18px; }
    .panel,.claim { background:var(--card); border:1px solid var(--line); border-radius:16px; box-shadow:0 5px 16px #152a3610; }
    .panel { padding:20px; } .eyebrow { font-size:12px; text-transform:uppercase; letter-spacing:.09em; color:var(--muted); font-weight:800; }
    .status-row { display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:9px; } .status { display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:6px 10px;font-weight:750;text-transform:uppercase;letter-spacing:.05em;font-size:12px; }
    .status::before { content:""; width:8px;height:8px;border-radius:99px;background:currentColor; }.pass {color:var(--pass);background:#e5f6f0}.review{color:var(--review);background:#fff2df}.fail{color:var(--fail);background:#fdecef}
    .health { font-size:26px;font-weight:780;letter-spacing:-.04em; } .integrity { color:var(--muted);font-size:13px;margin-top:14px;word-break:break-all; }
    .metrics { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px; }.metric{padding:12px;border-radius:12px;background:#f3f7f8}.metric b{font-size:22px;display:block}.metric span{font-size:12px;color:var(--muted)}
    .principle { font-size:16px; margin:9px 0 0; } .principle strong { color:var(--accent-2); }
    .claims { display:grid;gap:14px; }.claim { overflow:hidden; }.claim-top{padding:20px 20px 16px;display:flex;justify-content:space-between;gap:20px;border-left:5px solid var(--line)}.claim[data-status="pass"] .claim-top{border-color:var(--pass)}.claim[data-status="review"] .claim-top{border-color:#e6a341}.claim[data-status="fail"] .claim-top{border-color:var(--fail)}
    h2 { font-size:20px;letter-spacing:-.02em;margin:7px 0 6px; }.risk {font-size:12px;text-transform:uppercase;letter-spacing:.07em;font-weight:800;color:var(--muted)}.why {margin:0;color:#405261;max-width:790px}.evidence{border-top:1px solid var(--line)}
    .evidence-row{padding:14px 20px;border-bottom:1px solid #edf1f3}.evidence-row:last-child{border-bottom:0}.evidence-head{display:flex;align-items:start;justify-content:space-between;gap:14px}.evidence-title{font-weight:730}.type{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-left:7px}.detail{color:#4d5e6b;margin:4px 0 0}.command{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:#f4f7f8;padding:7px 9px;border-radius:7px;margin-top:8px;overflow:auto}.output{display:none;margin:10px 0 0;white-space:pre-wrap;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;background:#0d2431;color:#d9f5f6;padding:12px;border-radius:9px;max-height:220px;overflow:auto}.output.visible{display:block}.toggle{border:0;background:none;color:var(--accent);padding:0;margin-top:7px;font:600 13px inherit;cursor:pointer}.hash{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:#82909a;margin-top:7px}
    footer{color:var(--muted);font-size:13px;margin-top:23px}.empty{color:var(--muted);font-style:italic}@media(max-width:720px){.overview{grid-template-columns:1fr}.claim-top{flex-direction:column}.metrics{grid-template-columns:repeat(3,1fr)}header{padding-top:32px}}
  </style>
</head>
<body>
<header><div class="shell"><div class="brand"><span class="mark">✓</span> Verity / release evidence</div><h1 id="project-name"></h1><p class="subtitle">Proof-carrying release checks for AI-assisted changes.</p><div class="stamp" id="stamp"></div></div></header>
<main class="shell"><section class="overview"><div class="panel"><div class="eyebrow">Release decision</div><div class="status-row"><div class="health" id="decision"></div><span id="overall-status" class="status"></span></div><div class="metrics" id="metrics"></div><div class="integrity" id="integrity"></div></div><div class="panel"><div class="eyebrow">What this report proves</div><p class="principle"><strong>Claims are not tests.</strong> A passing suite is evidence only when it is explicitly linked to the release promise it supports. Manual judgment stays visible instead of being silently assumed.</p></div></section><section class="claims" id="claims"></section><footer>Generated locally by Verity. Evidence is ordered and hash-chained so a reviewer can detect changed, removed, or reordered proof.</footer></main>
<script id="verity-data" type="application/json">${payload}</script>
<script>
const report=JSON.parse(document.getElementById('verity-data').textContent);const q=(s)=>document.querySelector(s);const escape=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const label=s=>s==='pass'?'Ready to ship':s==='review'?'Human review required':'Release blocked';
q('#project-name').textContent=report.project.name;q('#stamp').textContent='Generated '+new Date(report.generatedAt).toLocaleString()+' · '+report.project.version;q('#decision').textContent=label(report.status);const overall=q('#overall-status');overall.textContent=report.status;overall.classList.add(report.status);q('#integrity').textContent='Integrity chain head: '+report.chainHead;
q('#metrics').innerHTML=[['pass','Verified'],['review','Needs review'],['fail','Failed']].map(([k,l])=>'<div class="metric"><b>'+report.summary[k]+'</b><span>'+l+' claim'+(report.summary[k]===1?'':'s')+'</span></div>').join('');
q('#claims').innerHTML=report.claims.map(claim=>'<article class="claim" data-status="'+claim.status+'"><div class="claim-top"><div><div class="risk">'+escape(claim.risk)+' risk</div><h2>'+escape(claim.title)+'</h2><p class="why">'+escape(claim.whyItMatters)+'</p></div><span class="status '+claim.status+'">'+claim.status+'</span></div><div class="evidence">'+claim.evidence.map(e=>'<div class="evidence-row"><div class="evidence-head"><div><div class="evidence-title">'+escape(e.description)+' <span class="type">'+escape(e.type.replaceAll('_',' '))+'</span></div><p class="detail">'+escape(e.detail)+'</p>'+(e.command?'<div class="command">$ '+escape(e.command)+'</div>':'')+(e.output?'<button class="toggle" type="button">Show captured output</button><pre class="output">'+escape(e.output)+'</pre>':'')+'<div class="hash">Evidence '+escape(e.id)+' · '+escape(e.hash.slice(0,18))+'…</div></div><span class="status '+e.status+'">'+e.status+'</span></div></div>').join('')+'</div></article>').join('');
document.querySelectorAll('.toggle').forEach(button=>button.addEventListener('click',()=>{const output=button.nextElementSibling;const visible=output.classList.toggle('visible');button.textContent=visible?'Hide captured output':'Show captured output'}));
</script>
</body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
