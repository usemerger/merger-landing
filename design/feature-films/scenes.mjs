import brandIcons from './channel-icons.mjs';

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
function sidebar(selected='Morgan Ellis'){
  let out=box(65,232,69,538,0,'#0d1117','none')+line(134,232,134,772)+line(404,232,404,772);
  out+=box(80,254,38,38,10,'#d4b47418','#d4b47455')+txt(99,280,'◇',26,C.gold,400,'text-anchor="middle"');
  out+=circle(99,331,17,'#202732')+txt(99,338,'↗',21,C.muted,500,'text-anchor="middle"');
  out+=icon('siWhatsapp',88,376,22)+icon('siTelegram',88,425,22)+icon('slack',88,475,22)+avatar(99,733,'Y','#594c35',15);
  out+=txt(156,271,'Messages',19,C.white,600)+box(151,290,236,34,7,'#0c1016',C.line)+txt(165,313,'Search conversations',13,C.muted);
  [['Morgan Ellis','Oak Street Partners','siTelegram'],['Avery Chen','The terms look good.','siWhatsapp'],['Oak Street deal team','Documents ready for review.','slack']].forEach((r,i)=>{
    const y=341+i*84;
    if(r[0]===selected)out+=box(143,y-10,253,76,8,'#d4b47410','#d4b47425');
    out+=icon(r[2],156,y+8,20)+txt(187,y+23,r[0],15,C.white,550)+txt(157,y+50,r[1],12,C.muted);
  });
  out+=line(153,615,384,615)+txt(157,644,'DEAL DESK',11,C.gold,600,'letter-spacing="1.5"')+txt(158,678,'Oak Street acquisition',15,C.white,500)+txt(158,703,'All the context, together.',12,C.muted);
  return out;
}
const dealCard=(x,y,w=338)=>box(x,y,w,272,12,'#151c25',C.line)+badge(x+20,y+20,'ACTIVE DEAL',C.gold,116)+txt(x+20,y+79,'Oak Street acquisition',24,C.white,600)+txt(x+20,y+119,'$500,000',30,C.gold,550)+txt(x+20,y+146,'Proposed allocation',14,C.muted)+line(x+20,y+168,x+w-20,y+168)+avatar(x+38,y+204,'ME')+avatar(x+72,y+204,'AC','#514660')+avatar(x+106,y+204,'JL','#45516a')+txt(x+20,y+248,'3 participants · linked conversations',13,C.muted);

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
  let app=shell()+sidebar()+line(970,231,970,772)+avatar(445,268,'ME')+txt(477,265,'Morgan Ellis',19,C.white,600)+txt(477,290,'Telegram · Oak Street Partners',13,C.muted)+line(405,311,970,311);
  app+=txt(994,270,'DEAL CONTEXT',12,C.gold,550,'letter-spacing="1.5"');
  app+=enter(box(432,340,505,98,12,'#202733','none')+txt(452,374,'We have a $500,000 allocation for Oak Street.',17)+txt(452,404,'Can you send the terms this week?',17),t,6.3);
  const reply='I’ll prepare the terms and keep the team updated.';
  const typed=reply.slice(0,Math.floor(clamp((t-7.5)/1.8)*reply.length));
  app+=box(427,664,518,83,12,'#0e131b','#3b4551')+txt(445,696,t<9.6?typed:'Message Morgan on Telegram…',14,t<9.6?C.white:C.muted)+pillButton(840,705,88,'Send');
  app+=enter(box(486,472,451,92,12,'#413723','#806b42')+txt(504,505,'I’ll prepare the terms and keep the team',16,C.white)+txt(504,531,'updated.',16,C.white)+txt(890,550,'Sent',11,C.gold),t,9.65,.4,9);
  app+=enter(dealCard(991,309,361),t,10.8,.7,20);
  app+=enter(box(991,600,361,103,10,'#0e151b','#31493f')+check(1011,623)+txt(1043,639,'Conversation linked',16,C.green,550)+txt(1011,675,'Reply and manage the deal in one place.',13,C.muted),t,12,.55);
  app+=cursor(t,[[8.8,746,605],[9.5,883,723,true],[10.5,1056,387],[12.6,1143,620]],8.8,13.1);
  return intro+enter(app,t,5.7,.75,22);
}

function deals(t){
  let out=shell('Deal intelligence')+line(777,231,777,772);
  out+=avatar(111,269,'ME')+txt(144,265,'Morgan Ellis',20,C.white,600)+txt(144,290,'Telegram · Oak Street Partners',13,C.muted)+badge(562,252,'CONNECTED MESSAGES',C.gold,192);
  out+=line(65,313,777,313);
  out+=enter(box(97,341,648,105,12,'#202733','none')+txt(120,376,'Hi, I’m Morgan Ellis at Oak Street Partners.',20)+txt(120,411,'You can reach me at morgan@example.com.',20),t,.3);
  out+=enter(box(97,466,648,140,12,'#202733','none')+txt(120,504,'We have a $500,000 allocation for the',22)+txt(120,541,'Oak Street acquisition.',22)+txt(120,578,'Can you send the terms this week?',22),t,1);
  const scanAlpha=p(t,2,.4)*(1-p(t,6,.5));
  out+=group(box(97,341+(t-2)*56,648,54,0,'url(#scan)','none'),scanAlpha);
  [[236,480,102,30,3.2],[118,518,244,30,4.1],[380,555,116,30,5.0]].forEach(([x,y,w,h,start])=>{out+=group(box(x,y,w,h,5,'#d4b47424','#d4b47470'),p(t,start,.4));});
  const scanning=t<6.5;
  out+=group(circle(116,650,5,C.gold)+txt(137,657,scanning?'Claude is reviewing your messages…':'Opportunity found in this conversation.',17,C.gold),p(t,2,.45));
  out+=txt(98,737,'Your messages remain the source of truth.',14,C.muted);
  if(t<6.6)out+=group(logo(1036,382,66)+txt(1068,499,'The next opportunity',22,C.muted,500,'text-anchor="middle"')+txt(1068,531,'might already be here.',22,C.muted,500,'text-anchor="middle"'),1-p(t,5.8,.8));
  let card=badge(810,264,t<11.7?'POSSIBLE DEAL':'ADDED TO DEAL DESK',t<11.7?C.gold:C.green,t<11.7?136:189)+txt(810,337,'Oak Street acquisition',30,C.white,550);
  card+=txt(810,390,'$500,000',38,C.gold,500)+txt(810,423,'Allocation',16,C.muted)+line(810,451,1335,451);
  card+=txt(810,484,'NEXT STEP',11,C.muted,600,'letter-spacing="1.4"')+txt(810,515,'Send terms this week',20,C.white,500);
  card+=box(810,543,527,76,9,'#0c1118','#333b46')+txt(829,572,'Source · Morgan Ellis on Telegram',14,C.muted)+txt(829,599,'“We have a $500,000 allocation…”',17,C.white);
  if(t<11.7)card+=pillButton(810,650,202,'Add to Deal Desk')+txt(1042,678,'Dismiss',15,C.muted);
  else card+=enter(box(810,645,527,70,10,'#14211d','#36564a')+check(831,667)+txt(865,680,'Filed with its source conversation',18,C.green,500),t,11.7,.5,8);
  out+=enter(card,t,6.35,.75,24);
  out+=cursor(t,[[9.2,1240,657],[10.1,1150,582],[11.1,916,672],[11.65,916,672,true],[12.4,1180,710]],9.2,12.7);
  out+=enter(badge(1084,259,'REVIEWED BY YOU',C.green,175),t,12.1,.5,0);
  return out;
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
