import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { LayoutDashboard, Users, BarChart3, Download, Settings, LogOut } from 'lucide-react';
import { adminFetch, adminCsv } from '../services/api.js';
import { QUESTIONS, REFLECTIONS } from '../data/questions.js';

function Login({ done }) {
  const [f, setF] = useState({ identifier: '', password: '' }), [err, setErr] = useState('');
  const go = async (e) => { e.preventDefault(); try { const d = await adminFetch('/login', { method: 'POST', body: f }); localStorage.setItem('solace_admin', d.token); done(); } catch (x) { setErr(x.message); } };
  return (<form onSubmit={go} className="card mx-auto mt-24 w-full max-w-sm space-y-3"><h1 className="text-2xl font-bold">SOLACE Admin</h1>
    <input className="inp" placeholder="Username or email" value={f.identifier} onChange={(e) => setF({ ...f, identifier: e.target.value })} />
    <input className="inp" type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
    {err && <p role="alert" className="text-magenta">{err}</p>}<button className="btn-p w-full">Log in</button></form>);
}

const Stat = ({ l, v }) => <div className="card"><p className="text-sm text-lavender">{l}</p><p className="text-3xl font-bold">{v}</p></div>;

function Overview() {
  const [d, setD] = useState({}); useEffect(() => { adminFetch('/dashboard').then(setD); }, []);
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-5"><Stat l="Participants" v={d.participants} /><Stat l="Submissions" v={d.submissions} /><Stat l="Average" v={d.average} /><Stat l="Highest" v={d.highest} /><Stat l="Lowest" v={d.lowest} /></div>;
}

function Detail({ id, close }) {
  const [s, setS] = useState(); useEffect(() => { adminFetch('/submissions/' + id).then(setS); }, [id]);
  if (!s) return null;
  return (<div className="fixed inset-0 z-10 overflow-auto bg-midnight/90 p-4" onClick={close}><div className="card mx-auto max-w-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between"><h2 className="text-xl font-bold">{s.participantName || 'Anonymous'} ({s.submissionId})</h2><button className="btn-g py-1" onClick={close}>Close</button></div>
    <p className="text-sm text-lavender">{[s.email, s.institution, s.age && `Age ${s.age}`, new Date(s.submittedAt).toLocaleString()].filter(Boolean).join(' · ')}</p>
    <p><b>{s.totalScore}/75</b> – {s.evaluationCategory}. Allah {s.categoryScores.allah}/30, Character {s.categoryScores.character}/20, Digital {s.categoryScores.digital}/25</p>
    <p className="text-sm">{s.evaluation.description}<br />{s.evaluation.opinion}</p>
    <ol className="font-ml list-decimal space-y-1 pl-5 text-sm">{QUESTIONS.map((q, i) => <li key={i}>{q} <b className="text-magenta">{s.answers[i]}</b></li>)}</ol>
    {REFLECTIONS.map((q, i) => <div key={i}><p className="font-ml text-sm text-lavender">{q}</p><p className="font-ml">{s.reflectionAnswers[i] || <i className="text-lavender">Not answered</i>}</p></div>)}</div></div>);
}

const CATS = ['Conscious Living', 'The Awakening', 'The Struggle', 'The First Step'];
function Participants() {
  const [q, setQ] = useState(''), [category, setC] = useState(''), [sort, setS] = useState('date'), [order, setO] = useState('desc'), [page, setP] = useState(1), [d, setD] = useState({ items: [] }), [open, setOpen] = useState();
  useEffect(() => { adminFetch(`/submissions?${new URLSearchParams({ q, category, sort, order, page })}`).then(setD); }, [q, category, sort, order, page]);
  return (<div><div className="mb-3 flex flex-wrap gap-2">
    <input className="inp max-w-xs" placeholder="Search name" value={q} onChange={(e) => { setQ(e.target.value); setP(1); }} />
    <select className="inp max-w-xs" value={category} onChange={(e) => { setC(e.target.value); setP(1); }}><option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
    <button className="btn-g" onClick={() => { setS('score'); setO(order === 'desc' ? 'asc' : 'desc'); }}>Sort by score {sort === 'score' ? (order === 'desc' ? '↓' : '↑') : ''}</button></div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-lavender"><tr>{['Name', 'Email', 'Institution', 'Score', 'Category', 'Date', ''].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
      <tbody>{d.items.map((s) => <tr key={s.submissionId} className="border-t border-royal/50"><td className="p-2">{s.participantName || 'Anonymous'}</td><td>{s.email}</td><td>{s.institution}</td><td>{s.totalScore}/75</td><td>{s.evaluationCategory}</td><td>{new Date(s.submittedAt).toLocaleDateString()}</td><td><button className="btn-g py-1" onClick={() => setOpen(s.submissionId)}>View Details</button></td></tr>)}</tbody></table>
      {!d.items.length && <p className="p-4 text-lavender">No submissions match yet.</p>}</div>
    <div className="mt-3 flex items-center gap-3"><button className="btn-g" disabled={page < 2} onClick={() => setP(page - 1)}>Prev</button><span>{page} / {d.pages || 1}</span><button className="btn-g" disabled={page >= (d.pages || 1)} onClick={() => setP(page + 1)}>Next</button></div>
    {open && <Detail id={open} close={() => setOpen()} />}</div>);
}

function Analytics() {
  const [d, setD] = useState(); useEffect(() => { adminFetch('/analytics').then(setD); }, []);
  if (!d) return null;
  const Box = ({ t, k, data, line }) => (<div className="card h-72"><p className="mb-2 text-sm text-lavender">{t}</p><ResponsiveContainer width="100%" height="90%">
    {line ? <LineChart data={data}><CartesianGrid stroke="#4C0E82" /><XAxis dataKey="date" stroke="#B69ACB" /><YAxis allowDecimals={false} stroke="#B69ACB" /><Tooltip /><Line dataKey={k} stroke="#F20A83" /></LineChart>
      : <BarChart data={data}><XAxis dataKey="name" stroke="#B69ACB" fontSize={11} /><YAxis allowDecimals={false} stroke="#B69ACB" /><Tooltip /><Bar dataKey={k} fill="#8C18E8" radius={6} /></BarChart>}</ResponsiveContainer></div>);
  return <div className="grid gap-4 lg:grid-cols-2"><Box t="Participants by evaluation" k="count" data={d.byCategory} /><Box t="Average score by category (%)" k="average" data={d.avgByCategory} /><Box t="Submission trend" k="count" data={d.trend} line /><Box t="Score distribution" k="count" data={d.distribution} /></div>;
}

const Exports = () => <div className="card max-w-md space-y-3"><p>Exports contain personal reflection answers. Share carefully.</p><button className="btn-p w-full" onClick={() => adminCsv('full')}>Export all submissions (CSV)</button><button className="btn-g w-full" onClick={() => adminCsv('summary')}>Export score summaries (CSV)</button><p className="text-sm text-lavender">Individual submissions: open View Details in Participants.</p></div>;

function Prefs() {
  const [f, setF] = useState({ current: '', next: '' }), [m, setM] = useState(''), [info, setInfo] = useState();
  useEffect(() => { adminFetch('/settings').then(setInfo); }, []);
  const save = async () => { try { await adminFetch('/password', { method: 'PUT', body: f }); setM('Password changed.'); } catch (e) { setM(e.message); } };
  return (<div className="max-w-md space-y-4"><div className="card space-y-3"><h3 className="font-semibold">Change password</h3>
    <input className="inp" type="password" placeholder="Current password" onChange={(e) => setF({ ...f, current: e.target.value })} />
    <input className="inp" type="password" placeholder="New password (10+ characters)" onChange={(e) => setF({ ...f, next: e.target.value })} />
    <button className="btn-p" onClick={save}>Save password</button>{m && <p role="status">{m}</p>}</div>
    <div className="card text-sm text-lavender">SOLACE v{info?.version} · {info?.questions} questions. Edit evaluation messages in server/config/solace.js.</div></div>);
}

const NAV = [['Overview', LayoutDashboard, Overview], ['Participants', Users, Participants], ['Submissions', Users, Participants], ['Analytics', BarChart3, Analytics], ['Export Data', Download, Exports], ['Settings', Settings, Prefs]];
export default function Admin() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('solace_admin')), [tab, setTab] = useState(0);
  if (!authed) return <Login done={() => setAuthed(true)} />;
  const View = NAV[tab][2];
  return (<div className="flex min-h-screen flex-col md:flex-row"><nav className="flex gap-1 overflow-x-auto border-b border-royal/60 bg-plum/60 p-3 md:w-56 md:flex-col md:border-b-0 md:border-r">
    <b className="hidden px-3 py-2 text-lg md:block">SOLACE</b>
    {NAV.map(([l, Ic], i) => <button key={l} onClick={() => setTab(i)} className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left ${tab === i ? 'bg-violet' : 'text-lavender hover:text-warm'}`}><Ic size={16} />{l}</button>)}
    <button className="flex items-center gap-2 px-3 py-2 text-lavender md:mt-auto" onClick={() => { localStorage.removeItem('solace_admin'); setAuthed(false); }}><LogOut size={16} />Logout</button></nav>
    <main className="flex-1 p-4 md:p-8"><h1 className="mb-4 text-2xl font-bold">{NAV[tab][0]}</h1><View /></main></div>);
}
