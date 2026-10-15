"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AccountAuthLayout from "../../components/AccountAuthLayout";
import { googleSigninComplete, googleSigninLink, errorMessage } from "../../lib/api";
import PasswordField from "../../components/PasswordField";
import { safeReturnPath } from "../../lib/authFlow";
export default function Finish() {
  const started = useRef(false),
    ticketRef = useRef(null),
    pending = useRef(false),
    [linkEmail, setLinkEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [next, setNext] = useState('/dashboard');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const ticket = new URLSearchParams(window.location.hash.slice(1)).get(
      "ticket",
    );
    window.history.replaceState({}, "", window.location.pathname);
    ticketRef.current = ticket;
    if (!ticket) {
      setError("This sign-in link has expired. Start again.");
      return;
    }
    googleSigninComplete(ticket)
      .then((r) => {
        if (r.requiresLink) {
          setNext(safeReturnPath(r.next));
          setLinkEmail(r.email);
        } else if (r.ok) {
          ticketRef.current = null;
          window.location.replace(safeReturnPath(r.next));
        } else setError("Sign-in could not be completed. Start again.");
      })
      .catch((e) => {setError(errorMessage(e));setNext(safeReturnPath(e.body?.next));});
  }, []);
  async function connect(e) {
    e.preventDefault();
    if (pending.current) return;
    if (!password) { setError("Enter your Merger password."); return; }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await googleSigninLink(ticketRef.current, password);
      setPassword("");
      ticketRef.current = null;
      window.location.replace(safeReturnPath(r.next));
    } catch (e) {
      setPassword("");
      setError(errorMessage(e));
      setBusy(false);
      pending.current = false;
      if ([400, 403, 409, 503].includes(e.status)) { ticketRef.current = null; setLinkEmail(""); }
    }
  }
  return (
    <AccountAuthLayout>
      <h1>{linkEmail ? "Connect Google to your account." : error ? "Let’s try that again." : "Finishing sign-in…"}</h1>
      {linkEmail ? (
        <>
          <p className="lede">You already have a Merger account for <strong>{linkEmail}</strong>. Enter your Merger password once to connect Google and keep your membership, contacts, and deals together.</p>
          <form onSubmit={connect} aria-busy={busy}>
            <input type="hidden" name="username" autoComplete="username" value={linkEmail}/>
            <PasswordField id="link-password" label="Merger password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} autoComplete="current-password" autoFocus/>
            {error && <p role="alert" className="alert alert-error">{error}</p>}
            <button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? "Connecting…" : "Connect Google and sign in"}</button>
          </form>
          <p className="field-hint">Next time, you can sign in with Google directly.</p>
          <p className="form-foot"><Link href={'/forgot-password?next='+encodeURIComponent(next)}>Forgot your password?</Link></p>
          <Link href={'/login?next='+encodeURIComponent(next)}>Use another sign-in method</Link>
        </>
      ) : error ? (
        <>
          <p role="alert">{error}</p>
          <Link href={'/login?next='+encodeURIComponent(next)}>Back to sign in</Link>
        </>
      ) : (
        <p className="lede" role="status">
          Securely connecting your Merger account.
        </p>
      )}
    </AccountAuthLayout>
  );
}
