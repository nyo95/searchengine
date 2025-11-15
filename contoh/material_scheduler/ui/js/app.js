;(function(){
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const normalizeBtn = document.querySelector('[data-action="normalize"]');
  function updateBulkVisibility(tab){ if(!normalizeBtn) return; normalizeBtn.style.display = (tab==='quick') ? 'none' : ''; document.body.classList.toggle('quick-active', tab==='quick'); }
  $$('.ms-tabs .tab').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.ms-tabs .tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const tab=btn.dataset.tab;
    // Force-hide all panels, then show selected with proper layout
    $$('.tabpanel').forEach(p=>{ p.classList.remove('active'); try{ p.style.display='none'; }catch(e){} });
    const activePanel = document.getElementById('tab-'+tab);
    if(activePanel){
      activePanel.classList.add('active');
      try{
        const isScrollable = activePanel.classList.contains('scrollable');
        activePanel.style.display = isScrollable ? 'flex' : 'block';
      }catch(e){}
    }
    // Extra safety: when leaving Scheduler, clear its tbody to avoid any bleed from sticky header
    if(tab!=='scheduler'){
      try{ const tb=document.querySelector('#tab-scheduler #sch_rows'); if(tb){ tb.innerHTML=''; } }catch(e){}
    }
    updateBulkVisibility(tab);
    if(tab==='quick') Quick.render(); if(tab==='scheduler') Scheduler.render();
    if(tab==='kinds') Kinds.render();
    if(tab==='samples') Samples.render(); if(tab==='hidden') Hidden.render();
    try{ if(window.sketchup && sketchup.ping){ sketchup.ping('tab='+tab); } }catch(e){}
  }));
  const statusEl = document.querySelector('#status');
  function setStatus(s){ statusEl.textContent=s; } window.__setStatus=setStatus;
  function toast(msg){ const t=document.querySelector('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1400);} window.__toast=toast;
  function rpc(name,args){ if(window.sketchup&&window.sketchup.rpc){ window.sketchup.rpc(JSON.stringify({name,args})); } else { console.warn('No SU bridge'); } } window.__rpc=rpc;
  let refreshTimer=null;
  function scheduleFullRefresh(delay){
    const wait = typeof delay==='number' ? Math.max(delay, 50) : 450;
    if(refreshTimer){ return; }
    refreshTimer = setTimeout(function(){
      refreshTimer=null;
      rpc('get_full',{});
    }, wait);
  }
  function forceFullRefresh(){
    if(refreshTimer){ clearTimeout(refreshTimer); refreshTimer=null; }
    rpc('get_full',{});
  }
  // Logs panel helpers
  function renderLogs(){
    var listEl = document.querySelector('#log-list'); if(!listEl) return;
    var logs = (window.State && State.logs) || [];
    var html = logs.map(function(l){
      var ts = l.ts || '';
      var lv = (l.level||'').toString();
      var ev = l.event || '';
      var data = l.data ? JSON.stringify(l.data) : '';
      var cls = lv==='error' ? 'log-level-error' : (lv==='warn' ? 'log-level-warn' : 'log-level-info');
      return '<div class="log-item '+cls+'">['+ts+'] '+lv.toUpperCase()+' '+ev+' '+data+'</div>';
    }).join('');
    listEl.innerHTML = html || '<div class="muted">No logs</div>';
  }
  // Debounced flag setter per row (batch small)
  (function(){
    const queue = {}; let timer=null; const FLUSH_MS=200;
    function flush(){
      Object.keys(queue).forEach(function(id){
        const flags = queue[id]; delete queue[id];
        try{ if(window.sketchup&&window.sketchup.rpc){ window.sketchup.rpc(JSON.stringify({name:'set_flags', args:{ ids:[parseInt(id,10)], flags: flags }})); } }catch(e){}
      });
      timer=null;
    }
    function setFlag(id,key,val){ if(!queue[id]) queue[id]={}; queue[id][key]=val; if(timer) clearTimeout(timer); timer=setTimeout(flush,FLUSH_MS); }
    window.__setFlag=setFlag;
  })();

  function updateStatusBar(){
    const visible = (State.visibleRows||[]).length;
    const hidden  = (State.hiddenRows||[]).length;
    const samples = (State.visibleRows||[]).filter(r=> r.sample).length;
    setStatus(visible + ' visible `a ' + hidden + ' hidden `a ' + samples + ' samples `a ' + (new Date().toLocaleTimeString()));
  }
  window.__ms_receive_full=function(data){
    State.rows=data.entries||[]; State.kinds=data.kinds||{}; State.logs=(data&&data.logs)||[]; try{ renderLogs(); }catch(e){}
    var actEl = document.querySelector('.ms-tabs .tab.active'); var active = (actEl && actEl.dataset ? actEl.dataset.tab : 'quick');
    // If there is an active selection, refresh its snapshot from latest rows so UI shows updated code/type
    try{ if(window.__quickSel && window.__quickSel.id){ var upd=(State.rows||[]).find(r=>r.id===window.__quickSel.id); if(upd){ window.__quickSel=upd; } } }catch(e){}
    if(active==='quick') Quick.render(); if(active==='scheduler') Scheduler.render();
    if(active==='kinds') Kinds.render();
    if(active==='samples') Samples.render(); if(active==='hidden') Hidden.render();
    try{ if(window.sketchup && sketchup.ping){ sketchup.ping('receive_active='+active+' rows='+(State.rows||[]).length); } }catch(e){}
    updateStatusBar();
  };
  window.__ms_selected_info=function(p){ Quick.onSelected(p); };
  window.__ms_rpc_resolve=function(p){
    var name = p && p.name;
    if(name==='get_full'){ if(p.result){ window.__ms_receive_full(p.result); } return; }
    if(name==='normalize_preview'){
      var changes=(p.result && p.result.changes)||[];
      if(!changes.length){ __toast('Already normalized'); return; }
      var ok = confirm('Normalize will update '+changes.length+' items. Proceed?');
      if(ok){ rpc('normalize_all',{}); }
      return;
    }
      if(name==='quick_apply'){
        if(p.result && p.result.updated){ window.__quickSel = p.result.updated; Quick.render(); }
        __toast('Saved'); scheduleFullRefresh(); return;
      }
      if(name==='normalize_all'){ var n=(p.result&&p.result.changed&&p.result.changed.length)||0; __toast('Normalized '+n); scheduleFullRefresh(600); }
      else if(name==='delete_material'){ __toast('Deleted'); scheduleFullRefresh(); }
      else if(name==='swap_codes'){ __toast('Swapped'); scheduleFullRefresh(); }
      else if(name==='generate_boards'){ var c=(p.result&&p.result.count)||0; __toast('Generated '+c+' boards'); }
      else if(name==='set_flags'){ scheduleFullRefresh(); }
      else if(name==='kinds_save'){ forceFullRefresh(); }
      else if(name==='export_csv'){
      var csv = (p.result && p.result.csv)||''; var blob=new Blob([csv],{type:'text/csv'});
      var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download='materials.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); __toast('CSV exported');
    }
  };
  window.__ms_rpc_reject=function(p){ __toast('Error: '+p.error); console.error(p.error); };
    document.querySelector('[data-action="refresh"]').addEventListener('click',function(){ forceFullRefresh(); });
  document.querySelector('[data-action="normalize"]').addEventListener('click',function(){ rpc('normalize_preview',{}); });
  document.querySelector('[data-action="export"]').addEventListener('click',function(){ var cols=Scheduler.currentColumns(); rpc('export_csv',{ cols: cols }); });
  window.State={ rows:[], kinds:{}, pending:{},
    get visibleRows(){ return (this.rows||[]).filter(function(r){ return (r && r.type && String(r.type).trim()!=='') && !r.hidden; }); },
    get sampleRows(){ return (this.visibleRows||[]).filter(function(r){ return !!r.sample; }); },
    get hiddenRows(){ return (this.rows||[]).filter(function(r){ return r.hidden || !(r && r.type && String(r.type).trim()!==''); }); }
  };
  // Toggle handlers
  function bindToggles(){
    var btn = document.querySelector('#btn-logs'); var dot=document.querySelector('#log-dot'); var panel=document.querySelector('#log-panel'); var close=document.querySelector('#btn-close-logs');
    function toggle(){ if(!panel) return; var sh = panel.style.display !== 'none'; panel.style.display = sh ? 'none' : 'block'; if(!sh) renderLogs(); }
    if(btn) btn.addEventListener('click', toggle);
    if(dot) dot.addEventListener('click', toggle);
    if(close) close.addEventListener('click', toggle);
  }
  try{ bindToggles(); }catch(e){}
})();

// If Ruby pushed data before JS initialized, flush the queued payloads now
(function(){
  try{
    if(Array.isArray(window.__MS_Q) && window.__MS_Q.length){
      var queued = window.__MS_Q.splice(0);
      queued.forEach(function(d){ try{ window.__ms_receive_full(d); }catch(e){} });
    }
  }catch(e){}
})();

// Watchdog: keep bridge/render healthy without rebuilding RBZ
(function(){
  function ping(msg){ try{ if(window.sketchup && sketchup.ping){ sketchup.ping(msg); } }catch(e){} }
  function activeTab(){ var a=document.querySelector('.ms-tabs .tab.active'); return (a&&a.dataset&&a.dataset.tab)||'quick'; }
  function ensurePanels(){
    try{
      var tab=activeTab();
      ['quick','scheduler','kinds','samples','hidden'].forEach(function(t){
        var el=document.getElementById('tab-'+t); if(!el) return;
        if(t===tab){
          var isScrollable = el.classList.contains('scrollable');
          el.style.display = isScrollable ? 'flex' : 'block';
        } else {
          el.style.display = 'none';
        }
      });
    }catch(e){}
  }
  var last={ tab:'', rows:-1, kinds:-1 };
  function rerenderIfNeeded(){
    var tab=activeTab(); ensurePanels();
    var rows=(window.State&&State.rows)? State.rows.length : 0;
    var kindsCount=(window.State&&State.kinds)? Object.keys(State.kinds).length : 0;
    if(tab!==last.tab || rows!==last.rows || kindsCount!==last.kinds){
      try{
        if(tab==='quick')      { Quick.render(); }
        else if(tab==='scheduler'){ Scheduler.render(); }
        else if(tab==='kinds') { Kinds.render(); }
        else if(tab==='samples'){ Samples.render(); }
        else if(tab==='hidden'){ Hidden.render(); }
      }catch(e){ ping('jserr:'+ (e&&e.message?e.message:'')); }
      last={ tab:tab, rows:rows, kinds:kindsCount };
    }
  }
  function onTick(){
    try{
      // Nudge bridge if injected late
      if(window.sketchup && sketchup.ready && !(window.sketchup && sketchup.rpc)){
        try{ sketchup.ready(); }catch(e){}
      }
      rerenderIfNeeded();
    }catch(e){ ping('jserr:'+ (e&&e.message?e.message:'')); }
  }
  window.addEventListener('focus', function(){ setTimeout(onTick, 20); });
  setInterval(onTick, 900);
  // Global error traps
  window.addEventListener('error', function(e){ ping('jserr:'+ (e.message||'err')); });
  window.addEventListener('unhandledrejection', function(e){ try{ var r=e.reason||{}; ping('jserr:'+ (r.message||'promise')); }catch(_){} });
})();

