"use client";
import "./account-auth.css";
import { useEffect, useState } from "react";
import {
  googleSigninStatus,
  googleSigninStart,
  errorMessage,
} from "../lib/api";
export function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.72 5.99c4.51-4.18 7.08-10.36 7.08-17.64Z"
      />
      <path
        fill="#FBBC05"
        d="M10.49 28.68a14.4 14.4 0 0 1 0-9.36L2.6 13.2a24 24 0 0 0 0 21.6l7.89-6.12Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.82l-7.72-5.99c-2.15 1.45-4.92 2.31-8.19 2.31-6.27 0-11.58-4.13-13.48-9.82L2.6 34.8C6.5 42.6 14.6 48 24 48Z"
      />
    </svg>
  );
}
export default function GoogleAccountButton({
  mode = "login",
  next = "/dashboard",
  referral,
  label,
}) {
  const [available, setAvailable] = useState(false),
    [linked, setLinked] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    googleSigninStatus()
      .then((r) => {
        if (live) {setAvailable(r.enabled === true);setLinked(r.linked === true);}
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  async function begin() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await googleSigninStart({
        mode,
        next,
        ref: referral || null,
        termsVersion: "2026-09-21",
        privacyVersion: "2026-10-18",
      });
      const url = new URL(result.url);
      if (
        url.origin !== "https://api.buildmerger.com" ||
        url.pathname !== "/api/auth/google/launch"
      )
        throw new Error("Invalid sign-in destination");
      window.location.assign(url.href);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }
  return (
    <>
      {available && (
        <>
          <button
            type="button"
            className="auth-google"
            disabled={busy || (mode === 'link' && linked)}
            onClick={begin}
          >
            <GoogleGlyph />
            {mode === 'link' && linked ? 'Google connected' : busy ? "Opening Google…" : label || "Continue with Google"}
          </button>
          {mode !== "link" && (
            <div className="auth-divider">or continue with email</div>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
    </>
  );
}
