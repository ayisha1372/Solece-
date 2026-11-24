import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { QUESTIONS, OPTIONS, REFLECTIONS, CARDS } from '../data/questions.js';
import { submit } from '../services/api.js';

const Shell = ({ children }) => <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">{children}</main>;
const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } };

function Landing({ next }) {
  const items = [['Muhasabah', 'Self-accountability'], ['Tawbah', 'Returning to Allah'], ['Tazkiyah', 'Spiritual purification']];
  return (<div className="pt-10 text-center">
    <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-violet shadow-[0_0_50px_#8C18E8] bg-royal/40"><Icons.MoonStar size={36} className="text-magenta" /></div>
    <h1 className="text-5xl font-bold tracking-tight">SOLACE</h1>
    <p className="mt-1 tracking-widest text-lavender">DIGITAL MUHASABAH</p>
    <p className="mt-8 text-xl font-semibold">Pause. Reflect. Recognise. Improve.</p>
    <p className="mx-auto mt-3 max-w-md text-lavender">Digital Muhasabah is an opportunity to examine our daily habits, strengthen our relationship with Allah, and become more responsible in our digital lives.</p>
    <button className="btn-p mt-8" onClick={next}>Start Reflection</button>
    <div className="mt-12 grid gap-3 sm:grid-cols-3">{items.map(([t, d]) => <div key={t} className="card"><b>{t}</b><p className="text-sm text-lavender">{d}</p></div>)}</div>
    <p className="mt-8 text-xs text-lavender/80">Privacy: your answers are used only for this programme. Personal details are optional and visible only to authorised administrators.</p>
  </div>);
}

function Info({ data, set, next }) {
  const f = (k, p, t = 'text') => <input className="inp" type={t} placeholder={p} value={data[k] || ''} onChange={(e) => set({ ...data, [k]: e.target.value })} />;
  return (<div><h2 className="text-3xl font-bold">About You</h2>
    <p className="mb-6 mt-1 text-lavender">Share your details if you wish. All fields are optional.</p>
    <div className="space-y-3">{f('name', 'Full name')}{f('email', 'Email address', 'email')}{f('institution', 'Institution / College')}{f('age', 'Age', 'number')}</div>
    <div className="mt-6 flex gap-3"><button className="btn-p" onClick={next}>Continue</button><button className="btn-g" onClick={() => { set({}); next(); }}>Skip</button></div></div>);
}

function Quiz({ answers, setAnswers, next, back }) {
  const [i, setI] = useState(0);
  const pick = (v) => { const a = [...answers]; a[i] = v; setAnswers(a); };
  const done = i === QUESTIONS.length - 1;
  return (<div>
    <div className="mb-2 flex justify-between text-sm text-lavender"><span>Question {i + 1} of 15</span><span>{Math.round(((i + 1) / 15) * 100)}%</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-plum"><motion.div className="h-full bg-gradient-to-r from-violet to-magenta" animate={{ width: `${((i + 1) / 15) * 100}%` }} /></div>
    <AnimatePresence mode="wait"><motion.div key={i} {...fade} className="mt-8">
      <h2 className="font-ml text-2xl leading-relaxed">{QUESTIONS[i]}</h2>
      <div className="mt-6 space-y-3" role="radiogroup">{OPTIONS.map(([t, v]) => (
        <button key={v} role="radio" aria-checked={answers[i] === v} onClick={() => pick(v)}
          className={`font-ml w-full rounded-xl border px-4 py-4 text-left transition ${answers[i] === v ? 'border-magenta bg-royal shadow-[0_0_20px_-4px_#F20A83]' : 'border-royal/60 bg-plum/60 hover:border-violet'}`}>{t}</button>))}</div>
    </motion.div></AnimatePresence>
    <div className="mt-8 flex justify-between">
      <button className="btn-g" onClick={() => (i ? setI(i - 1) : back())}>Previous</button>
      <button className="btn-p" disabled={!answers[i]} onClick={() => (done ? next() : setI(i + 1))}>{done ? 'Finish' : 'Next'}</button></div></div>);
}

function Reflect({ refl, setRefl, send, back, busy, err }) {
  return (<div><h2 className="text-3xl font-bold">Beyond the Numbers</h2>
    <p className="mb-6 mt-1 text-lavender">Take a moment to think beyond your score.</p>
    {REFLECTIONS.map((q, i) => (<label key={i} className="mb-5 block"><span className="font-ml mb-2 block">{q}</span>
      <textarea rows={5} maxLength={2000} className="inp font-ml" value={refl[i] || ''} onChange={(e) => { const r = [...refl]; r[i] = e.target.value; setRefl(r); }} /></label>))}
    {err && <p role="alert" className="mb-3 text-magenta">{err}</p>}
    <div className="flex justify-between"><button className="btn-g" onClick={back}>Back</button><button className="btn-p" disabled={busy} onClick={send}>{busy ? 'Saving…' : 'See my report'}</button></div></div>);
}

function Report({ r, next }) {
  const C = 2 * Math.PI * 54;
  return (<div className="text-center"><h2 className="text-3xl font-bold">Your Reflection Report</h2>
    <svg viewBox="0 0 120 120" className="mx-auto mt-6 h-48 w-48 -rotate-90"><circle cx="60" cy="60" r="54" fill="none" stroke="#4C0E82" strokeWidth="9" />
      <defs><linearGradient id="g"><stop stopColor="#8C18E8" /><stop offset="1" stopColor="#F20A83" /></linearGradient></defs>
      <motion.circle cx="60" cy="60" r="54" fill="none" stroke="url(#g)" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - r.totalScore / 75) }} transition={{ duration: 1.4 }} /></svg>
    <p className="-mt-32 mb-20 text-4xl font-bold">{r.totalScore}<span className="text-lg text-lavender"> / 75</span></p>
    <h3 className="text-2xl font-semibold text-magenta">{r.evaluation}</h3>
    <p className="font-ml mx-auto mt-2 max-w-md text-lavender">{r.description}</p>
    <div className="card mt-6 space-y-4 text-left">{r.breakdown.map((b) => (<div key={b.label}><div className="mb-1 flex justify-between text-sm"><span>{b.label}</span><span>{b.score}/{b.max}</span></div>
      <div className="h-2 rounded-full bg-midnight"><motion.div className="h-full rounded-full bg-gradient-to-r from-violet to-magenta" initial={{ width: 0 }} animate={{ width: `${(b.score / b.max) * 100}%` }} transition={{ duration: 1 }} /></div></div>))}</div>
    <p className="card mt-4 text-left">{r.opinion}</p>
    <p className="mt-3 text-xs text-lavender">{r.note} Submission ID: {r.submissionId}</p>
    <button className="btn-p mt-6" onClick={next}>Continue your journey</button></div>);
}

function Flash({ c }) {
  const [on, setOn] = useState(false); const Ic = Icons[c.icon];
  return (<button onClick={() => setOn(!on)} aria-label={`${c.title}: flip card`} className="flip h-80 w-full text-left">
    <motion.div className="relative h-full w-full" animate={{ rotateY: on ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
      <div className="face card absolute inset-0 grid place-content-center text-center"><Ic size={44} className="mx-auto text-magenta" /><h3 className="mt-3 text-2xl font-bold">{c.title}</h3><p className="text-lavender">{c.tag}</p><p className="mt-4 text-sm">{c.sub}</p><p className="mt-2 text-xs text-lavender/70">Tap to flip</p></div>
      <div className="face card absolute inset-0 overflow-auto bg-royal/60" style={{ transform: 'rotateY(180deg)' }}>
        <h4 className="mb-2 font-semibold">{c.sub}</h4><ul className="space-y-1 text-sm">{c.points.map((p) => <li key={p}>• {p}</li>)}</ul>
        {c.quote && <p className="mt-3 text-center text-lg" dir="rtl">{c.quote}<span dir="ltr" className="font-ml mt-1 block text-xs text-lavender">{c.ml}</span></p>}
        <p className="mt-3 text-sm italic text-magenta">{c.msg}</p></div></motion.div></button>);
}

function Final({ restart }) {
  return (<div className="text-center"><h2 className="text-3xl font-bold">Continue Your Journey</h2><p className="mb-6 text-lavender">Tap each card to explore.</p>
    <div className="grid gap-4 sm:grid-cols-3">{CARDS.map((c) => <Flash key={c.id} c={c} />)}</div>
    <p className="mt-10 text-xl font-semibold">Your journey towards improvement begins with awareness.</p>
    <p className="mt-2 text-lavender">Thank you for taking the time to reflect.</p>
    <div className="mt-6 flex justify-center gap-3"><button className="btn-p" onClick={restart}>Return Home</button><button className="btn-g" onClick={restart}>Restart Reflection</button></div></div>);
}

export default function Participant() {
  const [step, setStep] = useState(0), [info, setInfo] = useState({}), [answers, setAnswers] = useState([]), [refl, setRefl] = useState(['', '', '']);
  const [result, setResult] = useState(null), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const go = (n) => { setStep(n); window.scrollTo(0, 0); };
  const send = async () => { setBusy(true); setErr(''); try { setResult(await submit({ participant: info, answers: Array.from({ length: 15 }, (_, i) => answers[i]), reflections: refl })); go(4); } catch (e) { setErr(e.message); } setBusy(false); };
  const restart = () => { setInfo({}); setAnswers([]); setRefl(['', '', '']); setResult(null); go(0); };
  return (<Shell><AnimatePresence mode="wait"><motion.div key={step} {...fade}>
    {step === 0 && <Landing next={() => go(1)} />}
    {step === 1 && <Info data={info} set={setInfo} next={() => go(2)} />}
    {step === 2 && <Quiz answers={answers} setAnswers={setAnswers} next={() => go(3)} back={() => go(1)} />}
    {step === 3 && <Reflect refl={refl} setRefl={setRefl} send={send} back={() => go(2)} busy={busy} err={err} />}
    {step === 4 && result && <Report r={result} next={() => go(5)} />}
    {step === 5 && <Final restart={restart} />}
  </motion.div></AnimatePresence></Shell>);
}
