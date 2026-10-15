"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SingularityButton from "./SingularityButton";
import { captureRef } from "../lib/waitlist";
import "./waitlist.css";
export default function WaitlistForm() {
  const [ref, setRef] = useState(null);
  useEffect(() => {
    setRef(captureRef());
  }, []);
  return (
    <div className="wl-slot">
      <SingularityButton
        className="wl-submit"
        href={"/signup" + (ref ? "?ref=" + encodeURIComponent(ref) : "")}
      >
        Create your account
      </SingularityButton>
      <p className="wl-terms">
        Free to join. No card required. Verify your email to join the waitlist.
        Your trial starts after an invitation and activation.
      </p>
      <p className="wl-terms">
        Already have an account? <Link href="/login">Sign in</Link>.
      </p>
    </div>
  );
}
