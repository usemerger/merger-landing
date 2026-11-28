'use client';
import {useEffect,useRef,useState} from 'react';
import {previewRequest} from '../privateRequest';
import {dealURL} from '../previewLinks';
export default function ProfileControls({participant,account,onSignIn,privateLink,onSignOut}) {
  const [open,setOpen] = useState(false);
  const [sharing,setSharing] = useState(false);
  const [level,setLevel] = useState('private');
  const [email,setEmail] = useState('');
  const [url,setUrl] = useState('');
  const [busy,setBusy] = useState(false);
  const [feedback,setFeedback] = useState('');
  const requestId = useRef(0);
  const root = useRef(null);
  const trigger = useRef(null);
  const field = useRef(null);
  function close(restore=false) {
    requestId.current++;setBusy(false);setOpen(false);setSharing(false);setFeedback('');
    if (restore) trigger.current?.focus();
  }
  useEffect(()=>{
    if (!open) return;
    function outside(e) { if (!root.current?.contains(e.target)) close(); }
    function escape(e) { if (e.key==='Escape') close(true); }
    document.addEventListener('pointerdown',outside); document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open]);
  useEffect(()=>{if(sharing)field.current?.focus();},[sharing,level]);
  async function create(e) {
    e.preventDefault();const attempt=++requestId.current;setBusy(true);setFeedback('');
    try {
      const data = await previewRequest({action:'issue',email});
      if(attempt!==requestId.current)return;
      setUrl(new URL(dealURL(data.token),location.origin).href);setFeedback('Link ready. Only the invited email can open it.');
    } catch(err) {if(attempt===requestId.current)setFeedback(err.message==='account' || err.message==='signin'?'Sign in with a verified email to create a link.':'Couldn’t create the link. Try again.');}
    finally {if(attempt===requestId.current)setBusy(false);}
  }
  async function copy() {
    try {await navigator.clipboard.writeText(url);setFeedback('Link copied.');}
    catch {field.current?.focus();field.current?.select();setFeedback('Select and copy the link below.');}
  }
  async function signOut() {
    setBusy(true);setFeedback('');
    try {await onSignOut();close();}
    catch {setFeedback('Couldn’t sign out. Try again.');}
    finally {setBusy(false);}
  }
  const member = participant.member && account;
  return <div className="rv-profile" ref={root} onBlur={e=>{if(e.relatedTarget&&!root.current?.contains(e.relatedTarget)) close();}}>
    {member && !privateLink && <button className="rv-share" aria-expanded={open && sharing} onClick={()=>{
      if(open && sharing){close(true);return;}
      setOpen(true);setSharing(true);setEmail('');setUrl('');setLevel('private');setFeedback('');
    }}>Share</button>}
    {!member && <button onClick={onSignIn}>Sign in</button>}
    <button ref={trigger} className="rv-avatar-button" aria-label={participant.name} title="Account options" aria-expanded={open && !sharing} aria-controls="rv-account-panel" onClick={()=>{if(open && !sharing){close();return;}setSharing(false);setFeedback('');setOpen(true);}}>{participant.name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase()}</button>
    {open && <section id="rv-account-panel" aria-label="Account options" className="rv-pop">
      {sharing ? <><strong>Share deal</strong><div className="rv-levels" role="group" aria-label="Access level">
        {[['private','Private'],['anyone','Anyone with the link']].map(([value,label])=><button key={value} disabled={busy} aria-pressed={level===value} onClick={()=>{setLevel(value);setUrl(value==='anyone'?new URL(dealURL(null),location.origin).href:'');setFeedback('');}}>{label}</button>)}</div>
        <small>{level==='private'?'Only this verified email can open the link. It expires in seven days.':'Anyone with the link can open this preview and join as a guest.'}</small>
        {level==='private' && <form onSubmit={create}><label htmlFor="rv-recipient">Recipient email</label><input ref={url?null:field} id="rv-recipient" type="email" maxLength={254} required disabled={busy} value={email} onChange={e=>{setEmail(e.target.value);setUrl('');setFeedback('');}}/>
        {!url && <button className="rv-menu-action" disabled={busy}>{busy?'Creating link…':'Create private link'}</button>}</form>}
        {url && <><input ref={field} aria-label={level==='private'?'Private invite link':'Public invite link'} readOnly value={url} onFocus={e=>e.target.select()}/><button className="rv-menu-action" onClick={copy}>Copy link</button></>}</> :
        <><strong>{participant.name}</strong><small>{member?account.email:'Guest on this deal'}</small>
        {member?<><a href="/profile">Profile &amp; security</a><a href="/dashboard">My account</a>
          {!privateLink && <button onClick={()=>{setSharing(true);setLevel('private');setEmail('');setUrl('');setFeedback('');}}>Create private invite</button>}
          <button disabled={busy} onClick={signOut}>{busy?'Signing out…':'Sign out'}</button></>:<button onClick={()=>{close();onSignIn();}}>Sign in to Merger</button>}</>}
      {feedback&&<small role="status">{feedback}</small>}
    </section>}
  </div>;
}
