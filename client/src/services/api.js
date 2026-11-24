const j = async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Request failed'); return d; };
export const submit = (body) => fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(j);
const tk = () => localStorage.getItem('solace_admin');
export const adminFetch = (path, opts = {}) => fetch('/api/admin' + path, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk() }, body: opts.body && JSON.stringify(opts.body) }).then(j);
export const adminCsv = async (type) => {
  const r = await fetch('/api/admin/export?type=' + type, { headers: { Authorization: 'Bearer ' + tk() } });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(await r.blob()), download: `solace-${type}.csv` }); a.click();
};
