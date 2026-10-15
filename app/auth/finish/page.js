"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AccountAuthLayout from "../../components/AccountAuthLayout";
import { googleSigninComplete, errorMessage } from "../../lib/api";
import { safeReturnPath } from "../../lib/authFlow";
export default function Finish() {
  const started = useRef(false),
    [error, setError] = useState(""),
    [next, setNext] = useState('/dashboard');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const ticket = new URLSearchParams(window.location.hash.slice(1)).get(
      "ticket",
    );
    window.history.replaceState({}, "", window.location.pathname);
    if (!ticket) {
      setError("This sign-in link has expired. Start again.");
      return;
    }
    googleSigninComplete(ticket)
      .then((r) => window.location.replace(safeReturnPath(r.next)))
      .catch((e) => {setError(errorMessage(e));setNext(safeReturnPath(e.body?.next));});
  }, []);
  return (
    <AccountAuthLayout>
      <h1>{error ? "Let’s try that again." : "Finishing sign-in…"}</h1>
      {error ? (
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
