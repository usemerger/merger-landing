'use client';
import { useEffect } from 'react';
import { captureFirstTouch } from '../lib/attribution';

/** Records how this browser first arrived. Renders nothing. */
export default function FirstTouch() {
  useEffect(() => { captureFirstTouch(); }, []);
  return null;
}
