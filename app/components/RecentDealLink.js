'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {readRecent,dealURL} from '../deal-preview/previewLinks';
export default function RecentDealLink({userId}) {
  const [recent,setRecent] = useState(null);
  useEffect(()=>{const item=readRecent(userId);setRecent(item ? {userId,href:dealURL(item.token)} : null);},[userId]);
  if (!recent || recent.userId!==userId) return null;
  return <Link className="btn btn-ghost btn-sm" href={recent.href}>Return to Riverfront acquisition →</Link>;
}
