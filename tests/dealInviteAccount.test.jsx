import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from '../app/auth/deal/page';
import * as api from '../app/lib/api';

vi.mock('next/navigation', () => ({useSearchParams: () => new URLSearchParams('from=desktop-preview&entry=document')}));
vi.mock('../app/components/GoogleAccountButton', () => ({default: () => null}));
vi.mock('../app/lib/api', () => ({
  meOrNull:vi.fn(), startInviteEmail:vi.fn(), checkInviteEmail:vi.fn(), signInInviteEmail:vi.fn(), finishInviteSignup:vi.fn()
}));

const email = 'returning@example.com';
const account = {email, userId:'fixture', emailVerified:true};
const click = name => fireEvent.click(screen.getByRole('button',{name}));
const fill = (label,value) => fireEvent.change(screen.getByLabelText(label),{target:{value}});
async function verify() {
  render(<Page/>);
  await screen.findByLabelText('Email address');
  fill('Email address', email.toUpperCase());
  click('Send verification code');
  await screen.findByLabelText('Verification code');
  expect(screen.queryByLabelText('New password')).toBeNull();
  fill('Verification code','123456');
  click('Verify email');
}
beforeEach(() => {
  vi.resetAllMocks();
  api.meOrNull.mockResolvedValue(null);
  api.startInviteEmail.mockResolvedValue({challengeId:'challenge'});
});
describe('invitation account routing', () => {
  it('signs the existing account in and returns to the shared document in the same tab', async () => {
    api.checkInviteEmail.mockResolvedValue({ok:true,status:'existing_account',signInWithCode:true});
    api.signInInviteEmail.mockResolvedValue({ok:true});
    await verify();
    await screen.findByText('Welcome back');
    expect(screen.queryByText('Create account')).toBeNull();
    api.meOrNull.mockResolvedValue(account);
    click('Sign in');
    const link=await screen.findByRole('link',{name:'Return to the deal'});
    expect(link).toHaveAttribute('href','http://127.0.0.1:18471/r/document?return=deal');
    expect(link).not.toHaveAttribute('target','_blank');
    expect(api.startInviteEmail).toHaveBeenCalledWith(email);
    expect(api.signInInviteEmail).toHaveBeenCalledWith('challenge','123456');
    expect(api.finishInviteSignup).not.toHaveBeenCalled();
  });
  it('offers signup only with proof for a verified new address', async () => {
    api.checkInviteEmail.mockResolvedValue({ok:true,proof:'a'.repeat(43)});
    await verify();
    await screen.findByText('Create your Merger account');
    fill('New password','fixture-password');
    fireEvent.click(screen.getByRole('checkbox'));
    api.finishInviteSignup.mockResolvedValue({ok:true});
    api.meOrNull.mockResolvedValue(account);
    click('Create account');
    await screen.findByText('You’re signed in');
    expect(api.finishInviteSignup).toHaveBeenCalledWith('challenge','a'.repeat(43),'fixture-password',true);
  });
  it.each([{}, {ok:true}, {ok:true,status:'unknown',proof:'a'.repeat(43)}])('keeps signup closed on an inconclusive response',async result=>{
    api.checkInviteEmail.mockResolvedValue(result);
    await verify();
    await screen.findByRole('alert');
    expect(screen.queryByLabelText('New password')).toBeNull();
  });
  it('keeps an existing unavailable account out of signup',async()=>{
    api.checkInviteEmail.mockResolvedValue({ok:true,status:'existing_account',signInWithCode:false});
    await verify();
    await screen.findByText('Sign-in help');
    expect(screen.queryByLabelText('New password')).toBeNull();
  });
});
