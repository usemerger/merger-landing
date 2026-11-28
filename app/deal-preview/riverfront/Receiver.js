'use client';
import { useEffect, useRef, useState } from 'react';
import InviteAccountForm from '../../components/InviteAccountForm';
import GoogleAccountButton from '../../components/GoogleAccountButton';
import MarketingMark from '../../components/MarketingMark';
import { meOrNull } from '../../lib/api';

const path = '/deal-preview/riverfront';
const title = 'Riverfront acquisition';
const documentName = 'Indicative term sheet';
const openingMessage = 'I’ve shared the indicative terms. Would ten business days give your team enough time for diligence?';
const stages = ['Protect', 'Engage', 'Qualify', 'Offer', 'Diligence', 'Contract & Close', 'Payout'];

function ShareDialog({ screen, setScreen, join, account, pending, onClose }) {
  const dialog = useRef(null);
  const heading = useRef(null);
  const [name, setName] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  useEffect(() => {
    if (screen === 'guest') dialog.current.querySelector('input')?.focus();
    else if (screen === 'welcome') heading.current?.focus();
  }, [screen]);
  return <dialog ref={dialog} className="rv-modal" aria-label="Deal invitation" onCancel={event => { event.preventDefault(); onClose(); }}>
    <button type="button" className="rv-dismiss" onClick={onClose} aria-label="Close sign-in">×</button>
    <section className="rv-form">
      {screen !== 'welcome' && <button className="rv-back" type="button" onClick={() => setScreen('welcome')}>‹ Back</button>}
      {screen === 'email' ? <InviteAccountForm next={path} onJoin={user => join(user.displayName || user.handle || 'Merger member', user.userId)}/>
        : screen === 'guest' ? <form onSubmit={event => { event.preventDefault(); if(name.trim()) join(name.trim()); }}>
          <h1>What should we call you?</h1><p>This name appears beside your messages.</p>
          <label htmlFor="rv-guest">Your name</label><input id="rv-guest" autoComplete="name" maxLength={60} required value={name} onChange={e=>setName(e.target.value)}/>
          <button className="rv-primary" disabled={!name.trim()}>Join deal</button>
        </form> : <>
          <h1 tabIndex={-1} ref={heading}>You’re invited to a deal.</h1>
          <p>Kai invited you to collaborate on Riverfront acquisition.</p>
          {account ? <button className="rv-primary" onClick={()=>join(account.displayName || account.handle || 'Merger member', account.userId)}>Continue as {account.displayName || account.handle || account.email}</button> : <>
            <GoogleAccountButton mode="login" next={path}/>
            <button className="rv-primary" onClick={()=>setScreen('email')}>Continue with email</button>
          </>}
          <button className="rv-secondary" onClick={()=>setScreen('guest')}>Continue as a guest</button>
          {!pending && !account && <p className="rv-foot">Already on Merger? <button onClick={()=>setScreen('email')}>Sign in</button></p>}
        </>}
    </section>
    <aside className="rv-art"><article><MarketingMark size={31}/><small>DEAL DESK</small><h2>{title}</h2><div>Invited by <strong>Kai</strong></div></article></aside>
  </dialog>;
}

export default function Receiver() {
  const [screen,setScreen] = useState('welcome');
  const [account,setAccount] = useState(null);
  const [pending,setPending] = useState(true);
  const [participant,setParticipant] = useState(null);
  const [section,setSection] = useState('Documents');
  const [documentOpen,setDocumentOpen] = useState(false);
  const [draft,setDraft] = useState('');
  const [messages,setMessages] = useState([]);
  const composer = useRef(null);
  useEffect(()=>{
    let current = true;
    meOrNull().then(user => { if(current)setAccount(user); }).catch(()=>{}).finally(()=>{ if(current)setPending(false); });
    return ()=>{ current=false; };
  },[]);
  function join(name,id) {
    if(id)setAccount({displayName:name,userId:id});
    setParticipant({name,member:!!id}); setScreen(null);
    requestAnimationFrame(()=>composer.current?.focus());
  }
  function close() {
    if(participant) setScreen(null);
    else setScreen(screen==='guest'?'welcome':'guest');
  }
  function send(event) {
    event.preventDefault();
    if(!participant || !draft.trim())return;
    setMessages(items=>[...items,{id:crypto.randomUUID(),text:draft.trim()}]);setDraft('');
  }
  return <main className="rv">
    <header className="rv-header"><div className="rv-brand"><MarketingMark size={25}/> MERGER</div><div><h2>{title}</h2><small>Real estate</small></div>
      <nav aria-label="Deal tools">{['Deal info','Timeline','People','Documents'].map(item=><button key={item} aria-pressed={section===item} onClick={()=>setSection(s=>s===item?null:item)}>{item}</button>)}</nav>
      {participant && <button className="rv-account" onClick={()=>setScreen('welcome')}>{participant.member?participant.name:'Sign in'}</button>}
    </header>
    <div className="rv-strip"><span className="rv-avatar">K</span><div><strong>Kai</strong><small>Merger DMs · Preview conversation</small></div></div>
    <div className="rv-workspace">
      {documentOpen && <article className="rv-paper"><button onClick={()=>setDocumentOpen(false)} aria-label="Close document">×</button><small>RIVERFRONT ACQUISITION</small><h2>{documentName}</h2><h3>Purchase price</h3><p>$12,000,000 for 48 residential units.</p><h3>Diligence</h3><p>Ten business days from delivery of the diligence package.</p></article>}
      <section className="rv-thread" aria-label="Buyer party chat"><div className="rv-log" role="log"><span className="rv-incoming">{openingMessage}</span>{messages.map(m=><span className="rv-outgoing" key={m.id}>{m.text}</span>)}</div>
      <form className="rv-compose" onSubmit={send}><input ref={composer} aria-label="Message Kai" placeholder="Write a preview message…" maxLength={2000} value={draft} onChange={e=>setDraft(e.target.value)}/><button disabled={!draft.trim()||!participant}>Send</button></form></section>
      {section && <aside className="rv-inspector"><header><strong>{section}</strong><button onClick={()=>setSection(null)} aria-label="Close details">×</button></header>
      {section==='Documents'?<><small>Shared with you</small><p>{documentName}</p><button onClick={()=>setDocumentOpen(true)}>Open document</button></>:
      section==='Deal info'?<><small>Terms</small><p>$12M asking · 48 residential units</p><small>Next step</small><p>Confirm the diligence window with the seller.</p></>:
      section==='Timeline'?<ol>{stages.map(s=><li key={s}>{s}{s==='Diligence'?' · Current':''}</li>)}</ol>:<><p>Kai · Deal owner</p>{participant&&<p>{participant.name} · {participant.member?'Merger member':'Guest'}</p>}</>}
      </aside>}
    </div>
    {screen&&<ShareDialog screen={screen} setScreen={setScreen} join={join} account={account} pending={pending} onClose={close}/>}
  </main>;
}
