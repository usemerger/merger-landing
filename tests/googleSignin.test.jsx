import {render,screen,waitFor,fireEvent} from '@testing-library/react';
import {beforeEach,expect,it,vi} from 'vitest';
vi.mock('next/link',()=>({default:({children,...props})=><a {...props}>{children}</a>}));
vi.mock('../app/components/MergeHero',()=>({default:()=>null}));
vi.mock('../app/lib/api',async original=>({...await original(),googleSigninStatus:vi.fn(),googleSigninComplete:vi.fn(),googleSigninLink:vi.fn()}));
import {ApiError,googleSigninStatus,googleSigninComplete,googleSigninLink} from '../app/lib/api';
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
it('offers password confirmation in place and retains the desktop request',async()=>{
 window.history.replaceState({},'','/auth/finish#ticket=synthetic-link-ticket');
 const next='/desktop/authorize?request=11111111-1111-4111-8111-111111111111';
 googleSigninComplete.mockResolvedValue({requiresLink:true,email:'existing@gmail.com',next});
 googleSigninLink.mockRejectedValue(new ApiError(401,'invalid_credentials'));
 render(<Finish/>);
 expect(await screen.findByRole('heading',{name:'Connect Google to your account.'})).toBeVisible();
 expect(screen.getByText(/existing@gmail.com/)).toBeVisible();
 expect(screen.getByRole('link',{name:'Use another sign-in method'})).toHaveAttribute('href','/login?next='+encodeURIComponent(next));
 expect(window.location.hash).toBe('');
 fireEvent.change(screen.getByLabelText('Merger password'),{target:{value:'wrong-password'}});
 fireEvent.click(screen.getByRole('button',{name:'Connect Google and sign in'}));
 await waitFor(()=>expect(googleSigninLink).toHaveBeenCalledWith('synthetic-link-ticket','wrong-password'));
 expect(await screen.findByRole('alert')).toHaveTextContent(/password/i);
 expect(screen.getByLabelText('Merger password')).toHaveValue('');
 expect(screen.getByRole('button',{name:'Connect Google and sign in'})).toBeEnabled();
});
it('stops offering password retries when the Google link expires',async()=>{
 window.history.replaceState({},'','/auth/finish#ticket=synthetic-link-ticket');
 googleSigninComplete.mockResolvedValue({requiresLink:true,email:'existing@gmail.com',next:'/dashboard'});
 googleSigninLink.mockRejectedValue(new ApiError(400,'google_signin_expired'));
 render(<Finish/>);
 fireEvent.change(await screen.findByLabelText('Merger password'),{target:{value:'offline-password'}});
 fireEvent.click(screen.getByRole('button',{name:'Connect Google and sign in'}));
 expect(await screen.findByRole('link',{name:'Back to sign in'})).toBeVisible();
 expect(screen.queryByLabelText('Merger password')).toBeNull();
 expect(screen.getByRole('alert')).toHaveTextContent('expired');
});
