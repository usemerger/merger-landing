'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import GoogleAccountButton from './GoogleAccountButton';
import { meOrNull, startInviteEmail, checkInviteEmail, signInInviteEmail, finishInviteSignup } from '../lib/api';

export default function InviteAccountForm({next, returnURL, preview, onJoin}) {
  const [step, setStep] = useState('email');
  const [email,setEmail] = useState('');
  const [challenge,setChallenge] = useState('');
  const [code,setCode] = useState('');
  const [proof,setProof] = useState('');
  const [password,setPassword] = useState('');
  const [accepted,setAccepted] = useState(false);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const pending = useRef(false);
  const [member,setMember] = useState(null);
  const [ready,setReady] = useState(false);
  const [retry,setRetry] = useState(0);
  const expectedEmail = useRef(null);
  const card = useRef(null);
  useEffect(()=>{
    if (onJoin && ready) card.current?.querySelector('input:not([type="checkbox"])')?.focus();
    if (onJoin && ready && !card.current?.querySelector('input:not([type="checkbox"])')) card.current?.querySelector('h1')?.focus();
  },[step,ready,member]);
  useEffect(() => {
    let current = true;
    meOrNull().then(account => {
      if (!current) return;
      if (expectedEmail.current && (!account?.userId || account.emailVerified !== true || account.email?.toLowerCase() !== expectedEmail.current)) {
        setError('Your sign-in could not be confirmed. Please verify your email again.');
        setReady(true);
        return;
      }
      setMember(account); setReady(true);
    }).catch(() => { if (current) setError('Could not check your session. Please try again.'); });
    return () => { current = false; };
  }, [retry]);
  function restart() {
    expectedEmail.current = null; setReady(true); setStep('email'); setProof(''); setPassword(''); setCode(''); setAccepted(false); setChallenge(''); setError('');
  }
  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      if (step === 'email') {
        const address = email.trim().toLowerCase();
        const result = await startInviteEmail(address);
        if (!result?.challengeId) throw Error();
        setEmail(address); setChallenge(result.challengeId); setStep('code');
      } else if (step === 'code') {
        const result = await checkInviteEmail(challenge, code);
        if (result.ok !== true) throw Error();
        if (result.status === 'existing_account') {
          if (result.signInWithCode !== true) { setStep('unavailable'); return; }
          setStep('existing');
        } else if (result.status === undefined && typeof result.proof === 'string' && /^[\w-]{43}$/.test(result.proof)) {
          setProof(result.proof); setCode(''); setStep('new');
        } else throw Error();
      } else if (step === 'existing' || step === 'new') {
        const result = step === 'existing' ? await signInInviteEmail(challenge, code) : await finishInviteSignup(challenge, proof, password, accepted);
        if (result.ok !== true) throw Error();
        expectedEmail.current = email; setCode(''); setPassword(''); setProof(''); setStep('session');
        const account = await meOrNull();
        if (!account?.userId || account.emailVerified !== true || account.email?.toLowerCase() !== email) throw Error();
        if (onJoin) onJoin(account);
        else setMember(account);
      }
    } catch (err) {
      if (err.code === 'email_taken') { restart(); setError('That account already exists. Verify your email again to sign in.'); }
      else if (err.status === 429) setError('Too many requests. Please wait before trying again.');
      else if (err.code === 'invalid_or_expired_code' || err.code === 'invalid_proof') setError('That verification has expired or is incorrect. Try again or request a new code.');
      else setError('Merger could not complete this step. Please try again.');
    } finally { pending.current = false; setBusy(false); }
  }
  const title = { email:onJoin?'Continue with email':'Continue to your deal', code:'Check your email', existing:'Welcome back', new:'Create your Merger account', unavailable:'Sign-in help', session:'Check your session' };
  return <div ref={card} key={member ? 'member' : ready ? step : 'checking'} className="auth-card rv-account-step">
    {member ? <><h1 tabIndex={-1}>You’re signed in</h1><p className="lede">{member.displayName || member.email}</p>
      {onJoin ? <button type="button" className="btn btn-primary btn-block" onClick={()=>onJoin(member)}>Join deal</button> : preview ? <a className="btn btn-primary btn-block" href={returnURL} rel="noreferrer">Return to the deal</a> : <Link className="btn btn-primary btn-block" href="/dashboard">Open Merger</Link>}</>
    : !ready || step==='session' ? <><p role="status">Checking your Merger session…</p>{error&&<button type="button" onClick={()=>{setError('');setReady(false);setRetry(v=>v+1);}}>Check again</button>}{step==='session' && error && <button type="button" onClick={restart}>Verify again</button>}</>
    : <><h1 tabIndex={-1}>{title[step]}</h1>
      {!onJoin && step==='email' && <GoogleAccountButton mode="login" next={next}/>}
      <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy} style={{border:0,margin:0,padding:0,minWidth:0}}>
        {step==='email'&&<><p className="lede">Enter your email. We’ll send a code to check your account.</p><div className="field"><label htmlFor="deal-email">Email address</label><input id="deal-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} /></div></>}
        {step==='code'&&<><p className="lede">Enter the six-digit code sent to {email}.</p><div className="field"><label htmlFor="deal-code">Verification code</label><input id="deal-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value)} /></div></>}
        {step==='existing'&&<p className="lede">{email} already has a Merger account. Continue with the email you just verified.</p>}
        {step==='unavailable'&&<p className="lede">This email is already registered. {onJoin ? 'Contact Merger support for help signing in.' : <Link href={'/login?next='+encodeURIComponent(next)}>Use account sign-in</Link>}</p>}
        {step==='new'&&<><p className="lede">Your email is verified. Choose a password for {email}.</p><div className="field"><label htmlFor="deal-password">New password</label><input id="deal-password" type="password" autoComplete="new-password" minLength={8} maxLength={256} required value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <label><input type="checkbox" checked={accepted} required onChange={e=>setAccepted(e.target.checked)}/> I agree to the <Link href="/terms" target="_blank" rel="noreferrer">Terms</Link> and <Link href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</Link>.</label></>}
        {step!=='unavailable'&&<button className="btn btn-primary btn-block" disabled={busy}>{busy?'Please wait…':step==='new'?'Create account':step==='existing'?'Sign in':step==='code'?'Verify email':'Send verification code'}</button>}
        {step!=='email'&&<button type="button" className="btn btn-ghost" disabled={busy} onClick={restart}>Start again</button>}
      </fieldset></form></>}
    {error&&<p className="alert alert-error" role="alert">{error}</p>}
  </div>;
}
