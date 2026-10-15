"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AccountAuthLayout from "../../components/AccountAuthLayout";
import { meOrNull, desktopApprove, errorMessage } from "../../lib/api";
function Authorize() {
  const params = useSearchParams(),
    router = useRouter(),
    id = params.get("request") || "";
  const [user, setUser] = useState(null),
    [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (!/^[a-f0-9-]{36}$/i.test(id)) {
      setError("This desktop sign-in has expired. Start again in Merger.");
      return;
    }
    meOrNull()
      .then((u) => {
        if (u) setUser(u);
        else
          router.replace(
            "/login?next=" +
              encodeURIComponent("/desktop/authorize?request=" + id),
          );
      })
      .catch((e) => setError(errorMessage(e)));
  }, [id, router]);
  async function approve() {
    setBusy(true);
    try {
      await desktopApprove(id);
      setDone(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AccountAuthLayout>
      <p className="eyebrow">Merger for desktop</p>
      <h1>{done ? "You’re connected." : "Sign in to your app."}</h1>
      {done ? (
        <p className="lede" role="status">
          Return to Merger. Your account is connected; your existing
          verification, invitation and membership status stays the same.
        </p>
      ) : (
        <>
          <p className="lede">
            Continue as <strong>{user?.email || "your Merger account"}</strong>.
            Only approve this if you just started sign-in in your Merger desktop
            app.
          </p>
          {user && (
            <button
              className="btn btn-primary btn-block"
              disabled={busy}
              onClick={approve}
            >
              {busy ? "Connecting…" : "Connect Merger desktop"}
            </button>
          )}
          <p className="field-hint">
            This signs in to Merger. It does not subscribe you, grant Google
            Calendar access, or start your trial.
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="alert alert-error">
          {error}
        </p>
      )}
    </AccountAuthLayout>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Authorize />
    </Suspense>
  );
}
