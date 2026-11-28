import { issueInvite, openInvite, recipientAddress } from '../inviteCrypto';
export const dynamic = 'force-dynamic';
function reply(body, status = 200) {
  return Response.json(body, {status, headers:{'Cache-Control':'private, no-store'}});
}
async function getAccount(request) {
  const origin = process.env.MERGER_API_ORIGIN || 'https://api.buildmerger.com';
  const localQA = process.env.NODE_ENV === 'development' && origin === 'http://127.0.0.1:18474';
  const cookieName = localQA ? 'merger_invite_qa_session' : 'merger_session';
  const session = request.cookies.get(cookieName)?.value;
  if (!session) return null;
  const response = await fetch(new URL('/api/auth/me', origin), {
    headers:{Cookie:cookieName + '=' + encodeURIComponent(session)}, redirect:'error',
    cache:'no-store', signal:AbortSignal.timeout(10000)
  });
  if (response.status === 401) return null;
  if (!response.ok) throw Error('Account service unavailable');
  return response.json();
}
export async function POST(request) {
  const origin = request.headers.get('origin');
  const sameSite = origin === 'https://usemerger.com' || (process.env.NODE_ENV === 'development' && origin === 'http://127.0.0.1:18473');
  if (!sameSite || !request.headers.get('content-type')?.startsWith('application/json')) return reply({},403);
  let data;
  try { data = await request.json(); } catch { return reply({},400); }
  try {
    if (!['issue','enter'].includes(data?.action)) return reply({},400);
    const invite = data.action === 'enter' ? openInvite(data.token) : null;
    if (data.action === 'enter' && !invite) return reply({error:'ended'},410);
    const user = await getAccount(request);
    if (!user?.userId) return reply({error:'signin'},401);
    if (user.emailVerified !== true || !recipientAddress(user.email)) return reply({error:'account'},403);
    if (data.action === 'issue') {
      const email = recipientAddress(data.email);
      if (!email) return reply({error:'address'},400);
      // This service creates invitations exclusively for the fictional Riverfront workspace.
      return reply({token:issueInvite(email)});
    }
    if (invite.recipient !== recipientAddress(user.email)) return reply({error:'account'},403);
    return reply({account:{userId:user.userId,displayName:user.displayName,handle:user.handle,email:user.email,emailVerified:true},expires:invite.expires});
  } catch { return reply({error:'unavailable'},503); }
}
