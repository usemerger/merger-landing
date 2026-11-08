import {describe,it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {readFileSync,existsSync} from 'node:fs';
import {load} from 'cheerio';
import Purchase from '../app/funnel/Purchase';
import {ALPHA_OFFER,ANNUAL_OFFER} from '../app/lib/billingOffer';
import content from '../app/funnel/content.json';
vi.mock('../app/lib/waitlist',()=>({captureRef:()=> 'funnel_ref'}));
afterEach(cleanup);

describe('homepage migration contracts',()=>{
 const html=content.main+content.offerBefore+content.offerAfter+content.footer;
 const $=load(html);
 it('preserves legacy entry anchors and complete story chapters',()=>{
  for(const id of ['workflow','pricing','faq','download','waitlist','deal-desk','documents'])expect($(`#${id}`).length,id).toBe(1);
  expect($('.origin-scene').length).toBe(9);
  expect($('#origin-title-3').text()).toContain("So we built a system that detects deals as they're sent to you.");
 });
 it('ships real routes, no editors, local-storage copy or source-art controls',()=>{
  expect($('#review-index,.review-dock,[data-closing-form],textarea,iframe,[data-tray-export],[data-vault-export]').length).toBe(0);
  const anchors=$('a').map((_,e)=>$(e).attr('href')).get();
  expect(anchors.filter(a=>/localhost|127\.0\.0\.1|review|https:\/\/usemerger.com/.test(a))).toEqual([]);
  for(const route of ['/download','/support','/privacy','/terms','/developers','/playbooks','/for'])expect(anchors).toContain(route);
 });
 it('keeps future capabilities labelled and FAQ schema faithful to the page',()=>{
  for(const id of ['origin-identity','origin-match','origin-escrow'])expect($('#'+id).text().toLowerCase()).toContain('planned');
  expect(content.faq).toHaveLength(6);
  for(const item of content.faq){expect(item.question.length).toBeGreaterThan(5);expect(item.answer.length).toBeGreaterThan(10);}
 });
 it('includes every declared image, video and poster',()=>{
  const missing=[];$('[src],[data-src],[poster]').each((_,el)=>{for(const attr of ['src','data-src','poster']){const url=$(el).attr(attr);if(url?.startsWith('/funnel-v3/')&&!existsSync('public'+url))missing.push(url);}});
  expect(missing).toEqual([]);
 });
 it('leaves the original homepage available to rollback',()=>{
  const page=readFileSync('app/page.js','utf8');expect(page).toContain("MERGER_FUNNEL_VERSION==='3'");expect(page).toContain('<LegacyHome/>');
 });
 it('compares current prices and carries referrals to the existing signup flow',()=>{
  render(<Purchase/>);
  expect(screen.getByText(ALPHA_OFFER.billingNotice)).toBeTruthy();
  fireEvent.click(screen.getByRole('radio',{name:/Annual membership/}));
  expect(screen.getByText(ANNUAL_OFFER.billingNotice)).toBeTruthy();
  expect(screen.getByText(ANNUAL_OFFER.rateNotice,{exact:false})).toBeTruthy();
  expect(screen.getByRole('link',{name:/Make Merger yours/}).getAttribute('href')).toBe('/signup?ref=funnel_ref');
 });
});
