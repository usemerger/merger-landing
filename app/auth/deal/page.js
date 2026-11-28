'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AccountAuthLayout from '../../components/AccountAuthLayout';
import InviteAccountForm from '../../components/InviteAccountForm';

function Entry() {
  const params = useSearchParams();
  const preview = params.get('from') === 'desktop-preview';
  const entry = ['deal','document'].includes(params.get('entry')) ? params.get('entry') : 'invite';
  const next = '/auth/deal' + (preview ? '?from=desktop-preview&entry='+entry : '');
  const returnURL = preview ? 'http://127.0.0.1:18471/r/'+entry+'?return=deal' : '/dashboard';
  return <AccountAuthLayout><InviteAccountForm next={next} preview={preview} returnURL={returnURL}/></AccountAuthLayout>;
}
export default function Page() { return <Suspense><Entry/></Suspense>; }
