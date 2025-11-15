window.Hidden = (function(){
  const $=s=>document.querySelector(s);
  function row(r){
    const reason = r.auto_hidden ? (r.unknown ? 'Unknown' : 'Unassigned') : 'Manually hidden';
    const action = r.auto_hidden
      ? `<button class='btn mini' disabled title='Set Type to move out of Hidden'>(Set Type)</button>`
      : `<button class='btn mini h_unhide inline-flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1'>Unhide</button>`;
    return `<tr data-id='${r.id}'><td>${r.name||''}</td><td>${r.brand||''}</td><td>${r.type||''}</td><td>${r.notes||''}</td><td>${reason}</td><td>${action}</td></tr>`;
  }
  function render(){ const el=$('#tab-hidden'); const rows=(window.State&&State.hiddenRows)||[]; el.innerHTML = `
    <div class="tablewrap"><table class="min-w-full text-sm"><thead><tr>
      <th class="text-left font-semibold text-slate-600 bg-slate-50">Name</th>
      <th class="text-left font-semibold text-slate-600 bg-slate-50">Brand</th>
      <th class="text-left font-semibold text-slate-600 bg-slate-50">Type</th>
      <th class="text-left font-semibold text-slate-600 bg-slate-50">Notes</th>
      <th class="text-left font-semibold text-slate-600 bg-slate-50">Reason</th>
      <th></th>
    </tr></thead><tbody id='h_rows'>
      ${rows.map(row).join('')}
    </tbody></table></div>`; wire(); }
  function wire(){ document.querySelectorAll('#h_rows .h_unhide').forEach(btn=>btn.addEventListener('click',()=>{ const id=parseInt(btn.closest('tr').getAttribute('data-id'),10); __rpc('set_flags',{ ids:[id], flags:{ hidden:false } }); })); }
  return { render };
})();
