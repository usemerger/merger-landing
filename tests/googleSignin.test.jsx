import {render,screen,waitFor} from '@testing-library/react';
import {beforeEach,expect,it,vi} from 'vitest';
vi.mock('next/link',()=>({default:({children,...props})=><a {...props}>{children}</a>}));
vi.mock('../app/components/MergeHero',()=>({default:()=>null}));
vi.mock('../app/lib/api',async original=>({...await original(),googleSigninStatus:vi.fn(),googleSigninComplete:vi.fn()}));
import {ApiError,googleSigninStatus,googleSigninComplete} from '../app/lib/api';
import GoogleAccountButton from '../app/components/GoogleAccountButton';
import Finish from '../app/auth/finish/page';
beforeEach(()=>{vi.clearAllMocks();window.history.replaceState({},'','/');});
it('shows Google sign-in only when the server has configured it',async()=>{
 googleSigninStatus.mockResolvedValue({enabled:true,linked:false});
 render(<GoogleAccountButton/>);
 expect(await screen.findByRole('button',{name:'Continue with Google'})).toBeEnabled();
});
it('shows an existing account link as connected without offering to link again',async()=>{
 googleSigninStatus.mockResolvedValue({enabled:true,linked:true});
 render(<GoogleAccountButton mode="link"/>);
 expect(await screen.findByRole('button',{name:'Google connected'})).toBeDisabled();
});
it('keeps the pending desktop request when an existing password account needs linking',async()=>{
 window.history.replaceState({},'','/auth/finish#ticket=synthetic-ticket');
 const next='/desktop/authorize?request=11111111-1111-4111-8111-111111111111';
 googleSigninComplete.mockRejectedValue(new ApiError(409,'account_exists_link_google',{next}));
 render(<Finish/>);
 await waitFor(()=>expect(screen.getByRole('link',{name:'Back to sign in'})).toHaveAttribute('href','/login?next='+encodeURIComponent(next)));
 expect(window.location.hash).toBe('');
 expect(screen.getByRole('alert')).toHaveTextContent('keep your membership and data together');
});
