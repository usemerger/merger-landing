import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import Receiver from '../app/deal-preview/riverfront/Receiver';
import * as api from '../app/lib/api';
vi.mock('../app/components/GoogleAccountButton', () => ({default:()=>null}));
vi.mock('../app/lib/api', () => ({
  meOrNull:vi.fn(), startInviteEmail:vi.fn(), checkInviteEmail:vi.fn(), signInInviteEmail:vi.fn(), finishInviteSignup:vi.fn()
}));
beforeEach(()=>{
  // jsdom lacks native dialog methods. Chromium covers top-layer focus and navigation.
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  vi.resetAllMocks();
  api.meOrNull.mockResolvedValue(null);
});
describe('in-deal authentication',()=>{
  it('keeps the original conversation mounted and preserves an unsent guest draft across sign-in',async()=>{
    render(<Receiver/>);
    const room = screen.getByRole('log', {hidden:true});
    fireEvent.click(screen.getByRole('button',{name:'Continue as a guest'}));
    fireEvent.change(screen.getByLabelText('Your name'),{target:{value:'Local reviewer'}});
    fireEvent.click(screen.getByRole('button',{name:'Join deal'}));
    fireEvent.change(screen.getByLabelText('Message Kai'),{target:{value:'My unsent draft'}});
    fireEvent.click(screen.getByRole('button',{name:'Sign in'}));
    fireEvent.click(screen.getByRole('button',{name:'Continue with email'}));
    const email=await screen.findByLabelText('Email address');
    fireEvent.change(email,{target:{value:'returning@example.com'}});
    api.startInviteEmail.mockResolvedValue({challengeId:'fixture'});
    fireEvent.click(screen.getByRole('button',{name:'Send verification code'}));
    const code=await screen.findByRole('textbox',{name:'Digit 1 of 6'});
    fireEvent.change(code,{target:{value:'123456'}});
    api.checkInviteEmail.mockResolvedValue({ok:true,status:'existing_account',signInWithCode:true});
    fireEvent.click(screen.getByRole('button',{name:'Verify email'}));
    await screen.findByRole('heading',{name:'Welcome back'});
    api.signInInviteEmail.mockResolvedValue({ok:true});
    api.meOrNull.mockResolvedValue({email:'returning@example.com',displayName:'Morgan',emailVerified:true,userId:'verified'});
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Sign in'}));
    await screen.findByRole('button',{name:'Morgan'});
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('log')).toBe(room);
    expect(screen.getByLabelText('Message Kai')).toHaveValue('My unsent draft');
    expect(api.finishInviteSignup).not.toHaveBeenCalled();
  });
});
