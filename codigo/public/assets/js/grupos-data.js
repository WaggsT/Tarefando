// Fonte única de dados de grupos: tenta API e cai para localStorage
(function(){
  const API_URL = 'http://localhost:3000/grupos';
  const LS_GROUPS = 'grupos_db_v1';

  function fromLocal(){
    try{ return JSON.parse(localStorage.getItem(LS_GROUPS) || '[]'); }
    catch{ return []; }
  }
  function saveLocal(arr){
    try{ localStorage.setItem(LS_GROUPS, JSON.stringify(arr||[])); }catch{}
  }
  function nextId(current){
    const ids = (current||[]).map(x => Number(x.id)||0);
    return String((ids.length ? Math.max(...ids) : 0) + 1);
  }

  async function getAll(){
    try{
      const res = await fetch(API_URL, { method: 'GET' });
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      if(Array.isArray(data)){ saveLocal(data); return data; }
      // formato inesperado: usa local
      return fromLocal();
    }catch(_){
      // sem servidor/erro de rede: usa localStorage
      return fromLocal();
    }
  }

  async function createGroup(payload){
    // tenta API
    try{
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('HTTP '+res.status);
      const created = await res.json();
      // mantém cache local coerente
      const curr = fromLocal();
      saveLocal([ created, ...curr.filter(x=>String(x.id)!==String(created.id)) ]);
      return created;
    }catch(_){
      // offline: cria localmente
      const curr = fromLocal();
      const id = nextId(curr);
      const g = { id, membros: Number(payload.membros||1), posts_semana: Number(payload.posts_semana||0), ...payload };
      curr.unshift(g);
      saveLocal(curr);
      return g;
    }
  }

  async function updateGroup(id, patch){
    id = String(id);
    try{
      const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if(!res.ok) throw new Error('HTTP '+res.status);
      const updated = await res.json();
      const curr = fromLocal();
      const i = curr.findIndex(x => String(x.id)===id);
      if(i>=0) curr[i] = { ...curr[i], ...updated };
      else curr.unshift(updated);
      saveLocal(curr);
      return updated;
    }catch(_){
      // offline/local
      const curr = fromLocal();
      const i = curr.findIndex(x => String(x.id)===id);
      if(i>=0){ curr[i] = { ...curr[i], ...patch, id }; }
      saveLocal(curr);
      return curr[i] || null;
    }
  }

  async function deleteGroup(id){
    id = String(id);
    try{
      const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if(!res.ok && res.status !== 404) throw new Error('HTTP '+res.status);
    }catch(_){ /* ignora: cai para remoção local */ }
    const next = fromLocal().filter(x => String(x.id)!==id);
    saveLocal(next);
  }

  // expõe em window
  window.GruposData = { getAll, createGroup, updateGroup, deleteGroup };
})();
