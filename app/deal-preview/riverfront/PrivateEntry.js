'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import MarketingMark from '../../components/MarketingMark';
import InviteAccountForm from '../../components/InviteAccountForm';
import GoogleAccountButton from '../../components/GoogleAccountButton';
import {logout} from '../../lib/api';
import {clearSessionHint} from '../../lib/useSession';
import {previewRequest} from '../privateRequest';
import {dealURL} from '../previewLinks';
import Receiver from './Receiver';

export default function PrivateEntry({token}) {
  const [state, setState] = useState('checking');
  const [admission, setAdmission] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const check = useCallback(async () => {
    const attempt = ++generation.current;
    try {
      const result = await previewRequest({action:'enter',token});
      if (attempt !== generation.current) return false;
      setAdmission(result); setState('open'); return true;
    } catch (err) {
      if (attempt === generation.current) {
        setAdmission(null); setState(previous=> previous==='email' && err.message==='signin' ? 'email' : ['ended','account','signin'].includes(err.message) ? err.message : 'retry');
      }
      return false;
    }
  },[token]);
  useEffect(()=>{
    check();
    function visible() { if (!document.hidden) check(); }
    document.addEventListener('visibilitychange',visible);
    window.addEventListener('pageshow',visible);
    window.addEventListener('focus',visible);
    return ()=>{ ++generation.current; document.removeEventListener('visibilitychange',visible); window.removeEventListener('pageshow',visible); window.removeEventListener('focus',visible); };
  },[check]);
  useEffect(()=>{
    if (!admission) return;
    const timer = setTimeout(check, Math.max(0, admission.expires - Date.now()));
    return ()=>clearTimeout(timer);
  },[admission,check]);
  async function switchAccount() {
    setBusy(true); setError('');
    try { await logout(); clearSessionHint(); await check(); }
    catch { setError('Could not switch accounts. Try again.'); }
    finally { setBusy(false); }
  }
  if (admission && state==='open') return <Receiver key={admission.account.userId} initialAccount={admission.account} token={token} checkAccess={check}/>;
  const titles = {checking:'Checking your invitation…',signin:'Open your private invitation',account:'Use the invited email',ended:'This invitation has ended',retry:'Couldn’t check this invitation'};
  return <main className="rv rv-gate"><header className="rv-brand"><MarketingMark size={25}/> MERGER</header>
    <section className="rv-form rv-gate-card" key={state}><small>PRIVATE INVITATION</small>
    {state==='email' ? <><button className="rv-back" onClick={()=>setState('signin')}>‹ Back</button><InviteAccountForm next={dealURL(token)} onJoin={check}/></> :
    <><h1 aria-live="polite">{titles[state]}</h1>
    {state==='signin' && <><p>Sign in with the email address your invitation was sent to.</p>
      <GoogleAccountButton mode="login" next={'/dashboard?resumeInvite='+encodeURIComponent(token)}/>
      <button className="rv-primary" onClick={()=>setState('email')}>Continue with email</button></>}
    {state==='account' && <><p>This account doesn’t have access. Sign in with the verified email the sender invited.</p><button disabled={busy} className="rv-primary" onClick={switchAccount}>{busy?'Switching…':'Switch account'}</button></>}
    {state==='ended' && <p>Ask the sender for a fresh link.</p>}
    {state==='retry' && <button className="rv-primary" onClick={()=>{setState('checking');check();}}>Try again</button>}</>}
    {error && <p role="alert">{error}</p>}</section></main>;
}
