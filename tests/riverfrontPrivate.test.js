import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {randomBytes} from 'node:crypto';
import {NextRequest} from 'next/server';
import {POST} from '../app/deal-preview/access/route';
import {readRecent,rememberDeal} from '../app/deal-preview/previewLinks';
const origin='https://usemerger.com';
const owner={userId:'owner',email:'owner@example.com',emailVerified:true};
const user={userId:'reader',email:'reader@example.com',emailVerified:true};
function request(body, session=true) {
  const req=new NextRequest(origin+'/deal-preview/access',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(session?{Cookie:'merger_session=fixture'}:{})},body:JSON.stringify(body)});
  return POST(req);
}
function session(account) {vi.stubGlobal('fetch',vi.fn(async()=>Response.json(account)));}
async function issue() {
  session(owner);
  const res=await request({action:'issue',email:' Reader@Example.com '});
  expect(res.status).toBe(200);
  return (await res.json()).token;
}
beforeEach(()=>{vi.stubEnv('RIVERFRONT_INVITE_KEY',randomBytes(32).toString('hex'));});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.useRealTimers();localStorage.clear();});
describe('Riverfront preview access',()=>{
  it('requires a verified canonical account for issuance and the exact verified recipient on every admission',async()=>{
    expect((await request({action:'issue',email:user.email},false)).status).toBe(401);
    const token=await issue();
    const enter=()=>request({action:'enter',token,email:user.email});
    expect((await enter()).status).toBe(403);
    expect((await request({action:'enter',token},false)).status).toBe(401);
    session({...user,emailVerified:false});expect((await enter()).status).toBe(403);
    session(user);expect((await (await enter()).json()).account.userId).toBe('reader');
    expect((await request({action:'enter',token:'x'+token})).status).toBe(410);
    vi.useFakeTimers();vi.setSystemTime(Date.now()+8*86400000);expect((await enter()).status).toBe(410);
  });
  it('never resumes one account’s workspace for a different user',()=>{
    rememberDeal('a',null,'Timeline',false);expect(readRecent('a').section).toBe('Timeline');expect(readRecent('b')).toBeNull();
  });
});
