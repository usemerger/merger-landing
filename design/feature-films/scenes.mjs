import brandIcons from './channel-icons.mjs';
import {createMessagingScenes} from './messaging-scenes.mjs';

export const FILMS = [
  {id:'channels',title:'Every channel. One workspace.',duration:16,poster:13.5,description:'Eleven offered channels converge into Merger, followed by a reply and a linked deal.'},
  {id:'deals',title:'The next deal is already in your messages.',duration:18,poster:14,description:'Claude identifies an opportunity, shows its source, and the user approves filing it.'},
  {id:'documents',title:'The right people. The right paperwork.',duration:20,poster:13.5,description:'Review deal participants, prepare a DocuSign envelope, and send after review.'},
];
export const CHANNELS=[
 ['WhatsApp','siWhatsapp'],['Telegram','siTelegram'],['Signal','siSignal'],['Discord','siDiscord'],
 ['Slack','slack'],['Instagram','siInstagram'],['Messenger','siMessenger'],['LinkedIn','linkedin'],
 ['X','siX'],['LINE','siLine'],['Google Chat','siGooglechat'],
];
const C={bg:'#090b0f',panel:'#121720',panel2:'#191f29',line:'#2a313c',white:'#f3f0e9',muted:'#a2aab8',gold:'#d4b474',gold2:'#f0d69e',green:'#91c9ae'};
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const p=(t,start,d=0.6)=>ease((t-start)/d);
const f=x=>Number(x.toFixed(3));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const txt=(x,y,s,size=20,color=C.white,weight=400,extra='')=>`<text x="${f(x)}" y="${f(y)}" fill="${color}" font-size="${size}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
const box=(x,y,w,h,r=12,fill=C.panel,stroke=C.line,extra='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const line=(x1,y1,x2,y2,color=C.line,width=1)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
const circle=(x,y,r,fill,extra='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}" ${extra}/>`;
const group=(content,opacity=1,x=0,y=0,scale=1)=>`<g opacity="${f(clamp(opacity))}" transform="translate(${f(x)} ${f(y)}) scale(${f(scale)})">${content}</g>`;
const enter=(content,t,start=0,d=.6,dy=16)=>group(content,p(t,start,d),0,(1-p(t,start,d))*dy);
const badge=(x,y,label,color=C.gold,width)=>box(x,y,width??(label.length*8+26),29,7,color+'15',color+'35')+txt(x+12,y+20,label,13,color,550);
const check=(x,y,color=C.green,size=18)=>`<path d="M${x} ${y+size*.5}l${size*.32} ${size*.3}l${size*.68} -${size*.75}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const avatar=(x,y,initials,color='#425e58',r=19)=>circle(x,y,r,color)+txt(x,y+6,initials,14,C.white,600,'text-anchor="middle"');
const pillButton=(x,y,w,label,active=true)=>box(x,y,w,43,8,active?'url(#gold)':C.panel2,active?C.gold:C.line)+txt(x+w/2,y+28,label,16,active?'#191711':C.white,600,'text-anchor="middle"');
const logo=(x,y,size=30)=>`<g transform="translate(${x} ${y}) scale(${size/1000})" fill="url(#gold)" stroke="#ecd6a4" stroke-width="6"><path d="M460 72L140 403L296 503Z"/><path d="M500 56L322 505L500 540L678 505Z"/><path d="M540 72L860 403L704 503Z"/><path d="M148 432L296 522L439 900Z"/><path d="M322 530L487 562L487 944Z"/><path d="M678 530L513 562L513 944Z"/><path d="M852 432L704 522L561 900Z"/></g>`;
function icon(name,x,y,size=24,monochrome=false){
  const data=brandIcons[name];
  if(data)return `<g transform="translate(${x} ${y}) scale(${size/24})"><path fill="${monochrome?C.gold:name==='siX'?'#edf0f5':name==='siSignal'?'#7399ff':'#'+data.hex}" d="${data.path}"/></g>`;
  if(name==='linkedin')return box(x,y,size,size,4,'#0a66c2','none')+txt(x+size/2,y+size*.76,'in',size*.7,'#fff',700,'text-anchor="middle"');
  if(name==='slack')return `<g transform="translate(${x} ${y}) scale(${size/24})"><rect x="9" y="1" width="4" height="10" rx="2" fill="#36c5f0"/><rect x="1" y="11" width="10" height="4" rx="2" fill="#e01e5a"/><rect x="11" y="13" width="4" height="10" rx="2" fill="#ecb22e"/><rect x="13" y="9" width="10" height="4" rx="2" fill="#2eb67d"/><circle cx="5" cy="3" r="2" fill="#36c5f0"/><circle cx="3" cy="19" r="2" fill="#e01e5a"/><circle cx="19" cy="21" r="2" fill="#ecb22e"/><circle cx="21" cy="5" r="2" fill="#2eb67d"/></g>`;
  return '';
}
function cursor(t,points,start,end){
  if(t<start||t>end)return '';
  let a=points[0],b=points.at(-1);
  for(let i=0;i<points.length-1;i++){if(t>=points[i][0]&&t<=points[i+1][0]){a=points[i];b=points[i+1];break}}
  const q=p(t,a[0],Math.max(.01,b[0]-a[0]));
  const x=a[1]+(b[1]-a[1])*q,y=a[2]+(b[2]-a[2])*q;
  const clicks=points.filter(k=>k[3]);let rings='';
  for(const k of clicks){const z=(t-k[0])/.55;if(z>=0&&z<=1)rings+=circle(x,y,8+24*z,'none',`stroke="${C.gold}" stroke-width="2" opacity="${1-z}"`)}
  return rings+group('<path d="M0 0L3 26L10 19L17 32L23 29L16 16L26 15Z" fill="#f4f2ed" stroke="#11151c" stroke-width="2"/>',Math.min(p(t,start,.2),1-p(t,end-.2,.2)),x,y);
}
const defs=`<defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eed49d"/><stop offset="1" stop-color="#b98f4d"/></linearGradient><radialGradient id="ambient"><stop stop-color="#c3a16a" stop-opacity=".105"/><stop offset="1" stop-color="#c3a16a" stop-opacity="0"/></radialGradient><linearGradient id="scan" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#d4b474" stop-opacity="0"/><stop offset="1" stop-color="#d4b474" stop-opacity=".19"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="22" flood-color="#000" flood-opacity=".25"/></filter><clipPath id="appClip"><rect x="64" y="178" width="1312" height="594" rx="18"/></clipPath></defs>`;
const shell=(name='Messages')=>box(64,178,1312,594,18,C.panel,C.line)+line(64,231,1376,231)+logo(81,190,29)+txt(121,212,'merger',21,C.white,600)+txt(231,211,'/   '+name,15,C.muted)+circle(1303,205,4,'#343b45')+circle(1322,205,4,'#343b45')+circle(1341,205,4,'#343b45');
const {messageWorkspace,dealWorkspace}=createMessagingScenes({box,txt,line,circle,icon,avatar,logo,group,enter,p,cursor,check});

function channels(t){
  let intro='';
  const positions=CHANNELS.map((_,i)=>{const a=-Math.PI/2+i*Math.PI*2/11;return [720+480*Math.cos(a),458+208*Math.sin(a)]});
  positions.forEach(([x,y],i)=>{
    const q=p(t,4.25+i*.055,.9),xx=x+(720-x)*q,yy=y+(454-y)*q;
    const a=p(t,.18+i*.055,.6)*(1-q);
    intro+=group(`<path d="M${x} ${y}Q720 ${y} 720 454" fill="none" stroke="#c3a16a" stroke-opacity=".2"/>`,p(t,1,.8)*(1-q));
    if(t>1.6&&t<4.5){const z=clamp((t-1.6-i*.09)/1.8);if(z>0&&z<1){const px=(1-z)**2*x+2*(1-z)*z*720+z*z*720,py=(1-z)**2*y+2*(1-z)*z*y+z*z*454;intro+=circle(px,py,3.3,C.gold,`opacity="${Math.sin(Math.PI*z)}"`)}}
    intro+=group(box(-77,-31,154,62,14,'#141921','#333946')+icon(CHANNELS[i][1],-60,-12,24)+txt(-23,7,CHANNELS[i][0],15,C.white,500),a,xx,yy,1-.65*q);
  });
  intro+=group(circle(720,454,81,'#0d1118','stroke="#d4b47455"')+circle(720,454,95,'none','stroke="#d4b47413"')+logo(679,407,82)+txt(720,591,'One workspace.',24,C.white,500,'text-anchor="middle"'),p(t,.2,.8));
  intro=group(intro,1-p(t,5.5,.8));
  const toDesk=p(t,11.25,.6);
  const app=group(messageWorkspace(t),1-toDesk)+group(dealWorkspace(t,{filed:true}),toDesk);
  return intro+enter(app,t,5.7,.75,22);
}

function deals(t){
  const toDesk=p(t,6.1,.6);
  return group(messageWorkspace(t,{scan:true}),1-toDesk)+group(dealWorkspace(t),toDesk);
}

function documents(t){
  let out=shell('Oak Street acquisition / Documents')+line(481,231,481,772);
  out+=txt(94,273,'PEOPLE IN THIS DEAL',12,C.gold,550,'letter-spacing="1.7"')+txt(94,311,'Oak Street acquisition',25,C.white,550);
  const people=[['ME','Morgan Ellis','Oak Street Partners','morgan@example.com','#425e58'],['AC','Avery Chen','Northline Capital','avery@example.com','#514660'],['JL','Jordan Lee','Legal counsel','jordan@example.com','#45516a']];
  people.forEach((person,i)=>{
    const y=338+i*94,selected=i===0&&t>2.1||i===1&&t>3.05;
    let row=box(91,y,361,80,10,selected?'#d4b4740d':'#151b24',selected?'#8c744b':C.line)+avatar(121,y+30,person[0],person[4])+txt(150,y+28,person[1],17,C.white,550)+txt(150,y+52,person[2],12,C.muted)+box(418,y+27,18,18,4,selected?C.gold:'#0b0f15',selected?C.gold:'#53606c');
    if(selected)row+=check(421,y+28,'#14130f',12);
    out+=enter(row,t,.3+i*.16,.5,9);
  });
  out+=enter(box(91,648,361,88,10,'#111923','#334339')+txt(110,679,'2 recipients selected',19,C.green,500)+txt(110,708,'Name and email are ready to use.',13,C.muted),t,3.2);
  const panelProgress=p(t,4,.65);
  let doc=txt(514,271,'DocuSign',23,C.white,600)+badge(1167,248,'YOUR ACCOUNT',C.gold,171)+line(511,291,1347,291);
  doc+=box(513,311,296,395,10,'#171e28','#333c48')+txt(534,344,'Recipient details',19,C.white,550)+line(533,363,789,363);
  doc+=txt(535,394,'NAME',10,C.muted,600,'letter-spacing="1.1"')+txt(535,425,'Morgan Ellis',19,C.white,500)+txt(535,460,'EMAIL',10,C.muted,600,'letter-spacing="1.1"')+txt(535,490,'morgan@example.com',16,C.white)+pillButton(534,516,113,t>=7?'Copied':'Copy email',false);
  if(t>=7&&t<8.4)doc+=check(662,527,C.green,16);
  doc+=line(534,584,789,584)+txt(535,615,'NEXT RECIPIENT',10,C.muted,600,'letter-spacing="1.1"')+txt(535,647,'Avery Chen',19,C.white,500)+txt(535,675,'avery@example.com',15,C.muted);
  doc+=box(832,311,514,397,10,'#eeeae2','#d7d2c8')+txt(860,348,'ENVELOPE / RECIPIENTS',11,'#74736f',600,'letter-spacing="1.1"')+txt(860,387,'Oak Street investment terms',25,'#22262b',550);
  doc+=line(860,412,1317,412,'#cecbc3')+txt(860,442,'Recipient name',12,'#666a6f')+box(858,454,459,42,6,'#fff','#c7c5bd')+txt(871,482,t>5.9?'Morgan Ellis':'',17,'#232831');
  doc+=txt(860,526,'Email address',12,'#666a6f')+box(858,538,459,43,6,'#fff',t>7.5&&t<9.3?'#b38e4b':'#c7c5bd')+txt(871,567,t>8.2?'morgan@example.com':'',17,'#232831');
  doc+=enter(txt(860,618,'Avery Chen',17,'#232831',550)+txt(860,647,'avery@example.com',15,'#666a6f')+check(1288,615,'#40775b',17),t,9.3,.5,8);
  doc+=enter(pillButton(1167,720,178,'Review envelope'),t,10,.5,0);
  out+=group(doc,panelProgress*(1-p(t,11.65,.6)),(1-panelProgress)*24,0);
  out+=cursor(t,[[1.5,563,392],[2.1,426,376,true],[3.05,426,470,true],[5.8,1014,476],[6.8,587,538],[7,587,538,true],[8.2,1067,559,true],[10.5,1247,741],[11.4,1247,741,true]],1.5,11.6);
  let review=box(499,244,857,512,12,'#131922','#36404c')+txt(524,282,'DocuSign',23,C.white,600)+badge(1184,258,'FINAL REVIEW',C.gold,143)+line(522,302,1332,302);
  review+=box(525,329,184,276,8,'#eeeae2','#d7d2c8')+txt(547,368,'OAK STREET',12,'#6e6655',600)+txt(547,408,'Investment',21,'#242932',550)+txt(547,436,'terms',21,'#242932',550);
  for(let i=0;i<6;i++)review+=line(548,469+i*15,685-(i%3)*15,469+i*15,'#c6c2b9',2);
  review+=txt(744,359,'Ready for their next step.',27,C.white,550)+txt(744,394,'Oak Street investment terms.pdf',16,C.muted);
  review+=avatar(765,445,'ME')+txt(797,443,'Morgan Ellis',18,C.white,500)+txt(797,468,'morgan@example.com · Needs to sign',14,C.muted)+avatar(765,520,'AC','#514660')+txt(797,519,'Avery Chen',18,C.white,500)+txt(797,544,'avery@example.com · Needs to sign',14,C.muted);
  review+=pillButton(1118,649,209,'Send for signature')+txt(745,623,'You review. You send.',15,C.gold);
  const revAlpha=p(t,11.65,.6)*(1-p(t,15.8,.6));out+=group(review,revAlpha,0,(1-p(t,11.65,.6))*12);
  out+=cursor(t,[[14,1056,591],[15,1215,670],[15.65,1215,670,true]],14,15.85);
  let sent=box(499,244,857,512,12,'#101b18','#3b5a4d')+circle(927,377,38,'#203c30')+check(908,361,C.green,37)+txt(927,458,'Sent for signature.',36,C.white,550,'text-anchor="middle"')+txt(927,500,'Oak Street investment terms',20,C.muted,400,'text-anchor="middle"')+avatar(864,556,'ME')+avatar(912,556,'AC','#514660')+txt(949,563,'2 recipients',17,C.green)+txt(927,657,'The people and paperwork stay connected.',18,C.white,400,'text-anchor="middle"');
  out+=enter(sent,t,15.9,.65,16);
  return out;
}

export function caption(id,t){
  if(id==='channels')return t<5.7?'Your conversations come from everywhere.':t<10.5?'Read and reply from one connected inbox.':'Keep every deal connected to its conversations.';
  if(id==='deals')return t<2?'Opportunities are already in the conversation.':t<6.5?'Claude scans your messages for potential deals.':t<11.7?'See the opportunity. Check the source.':'You approve what becomes a deal.';
  return t<4?'Start with the people already in your deal.':t<10?'Keep names and emails beside your document.':t<15.9?'Review your document and recipients in DocuSign.':'Prepare, review, and send with the context beside you.';
}

export function renderFrame(id,time,{width=1440,height=900}={}){
  const film=FILMS.find(f=>f.id===id);if(!film)throw new Error('Unknown film');
  const t=Math.max(0,Math.min(film.duration,time));
  const scene=id==='channels'?channels:id==='deals'?deals:documents;
  const reset=p(t,film.duration-.65,.65);
  const body=reset>0?group(scene(t),1-reset)+group(scene(0),reset):scene(t);
  const index=FILMS.indexOf(film)+1;
  const qualifier=id==='channels'?'Available networks and actions vary by service during alpha.':id==='deals'?'Claude features use your Anthropic API key. Usage billed separately.':'Uses your DocuSign account. Sample workflow; no documents are sent.';
  const captions=reset>0?group(txt(64,827,caption(id,t),24,C.white,450),1-reset)+group(txt(64,827,caption(id,0),24,C.white,450),reset):txt(64,827,caption(id,t),24,C.white,450);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1440 900" role="img" aria-label="${esc(film.description)}" style="font-family:Geist,Segoe UI,Arial,sans-serif">${defs}<rect width="1440" height="900" fill="${C.bg}"/><ellipse cx="1090" cy="430" rx="700" ry="500" fill="url(#ambient)"/>${txt(64,54,'MERGER / '+(['CONNECTED CONVERSATIONS','DEAL INTELLIGENCE','DOCUMENT WORKFLOW'][index-1]),12,C.gold,500,'font-family="Geist Mono,monospace" letter-spacing="2.0"')}${txt(64,117,film.title,44,C.white,550,'font-family="Geist,Segoe UI,sans-serif" letter-spacing="-1.4"')}${txt(1376,54,'0'+index+' / 03',12,C.muted,500,'text-anchor="end" font-family="Geist Mono,monospace" letter-spacing="1.5"')}${body}${captions}${txt(64,861,qualifier,12,C.muted)}${txt(1376,861,'ILLUSTRATIVE DEMO',10,'#77808d',500,'text-anchor="end" font-family="Geist Mono,monospace" letter-spacing="1.5"')}</svg>`;
}
