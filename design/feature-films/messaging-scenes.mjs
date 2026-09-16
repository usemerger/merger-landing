// App geometry follows the supplied desktop screenshots. All content is fictional.
export function createMessagingScenes({box,txt,line,circle,icon,avatar,logo,group,enter,p,cursor,check}) {
  const ink='#080d19', panel='#101626', edge='#2a354b', white='#edf2fc', muted='#93a9c9', gold='#d4b474', blue='#3451d3';
  const mono='font-family="Geist Mono,monospace"';
  const small=(x,y,s)=>txt(x,y,s,10,muted,400,mono);
  const button=(x,y,w,label,active=false)=>box(x,y,w,29,7,active?'url(#gold)':ink,active?gold:edge)+txt(x+w/2,y+19,label,12,active?ink:muted,500,'text-anchor="middle"');
  const glyph=(name,x,y,size=19,color=muted)=>{
    const paths={grid:'M2 2h7v7H2ZM14 2h7v7h-7ZM2 14h7v7H2ZM14 14h7v7h-7Z',chat:'M2 3h20v14H9l-7 5Z',search:'M16 16l6 6M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',send:'M3 12h17M13 5l7 7-7 7',clip:'M8 13l7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L13 2',smile:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M7 14q5 7 10 0M7 8h.1M17 8h.1'};
    return `<g transform="translate(${x} ${y}) scale(${size/24})"><path d="${paths[name]}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  };
  function frame(active='messages',count='1') {
    let out=box(64,178,1312,594,12,ink,edge)+box(65,179,1310,28,0,ink,'none')+logo(74,183,18)+txt(99,198,'Merger',12,white,600)+line(1277,192,1285,192,muted)+box(1301,187,8,8,0,'none',muted)+line(1325,187,1333,195,muted)+line(1333,187,1325,195,muted)+line(64,207,1376,207,edge);
    out+=box(65,208,54,563,0,'#070b13','none')+line(120,208,120,772,edge);
    const nav=(y,name,label,selected)=> (selected?box(78,y-5,29,29,7,'#d4b4740c',gold):'')+glyph(name,84,y,18,selected?gold:muted)+txt(92,y+36,label,8,selected?white:muted,500,'text-anchor="middle"');
    out+=nav(227,'grid','Deal Desk',active==='desk')+nav(291,'chat','Messages',active==='messages');
    out+=box(101,282,15,14,6,gold,'none')+txt(108.5,292,count,9,ink,600,'text-anchor="middle"')+line(76,341,108,341,edge);
    ['siMessenger','siWhatsapp','siInstagram','siTelegram','siDiscord','slack','linkedin','siX','siLine'].forEach((network,i)=>{const y=370+i*37;out+=circle(92,y,14,'#111a2a',`stroke="${edge}"`)+icon(network,83,y-9,18)});
    return out+logo(78,726,28);
  }
  function conversationList(){
    let out=box(120,208,294,563,0,panel,'none')+line(414,207,414,772,edge)+txt(139,241,'Messages',21,white,600)+small(366,239,'12');
    ['All','Unread','Pinned','Drafts','Archived'].forEach((s,i)=>out+=txt(142+i*53,279,s,10,i===0?gold:muted));
    out+=line(121,293,414,293,edge)+line(135,292,168,292,gold,2)+box(135,307,264,33,8,ink,edge)+txt(149,329,'Find a conversation…',12,muted)+glyph('search',375,315,16);
    const rows=[['ME','Morgan Ellis','Can you send the terms this week?','siTelegram','#456258'],['AC','Avery Chen','The terms look good.','siWhatsapp','#514660'],['OT','Oak Street deal team','Let’s review the documents.','slack','#324d71'],['JL','Jordan Lee','I can take a look today.','siInstagram','#45516a'],['NP','Northline Partners','Thanks for the introduction.','siLinkedin','#405367']];
    rows.forEach((r,i)=>{let y=352+i*73;out+=(i===0?box(130,y,274,64,9,'#111c3c',gold):'')+avatar(157,y+28,r[0],r[4],16)+circle(170,y+40,9,panel)+icon(r[3]==='siLinkedin'?'linkedin':r[3],164,y+34,12)+txt(185,y+24,r[1],13,white,550)+txt(185,y+45,r[2].length>29?r[2].slice(0,27)+'…':r[2],11,muted)+small(376,y+23,i===0?'now':'2h')});
    return out;
  }
  function messageWorkspace(t,{scan=false}={}) {
    const local=scan?t:t-5.7;
    let out=frame()+conversationList()+avatar(447,237,'ME','#456258',16)+txt(475,236,'Morgan Ellis',18,white,600)+icon('siTelegram',475,245,12)+txt(493,257,'Telegram',11,muted)+button(1191,225,72,'Search')+button(1273,225,83,'Details')+line(414,276,1376,276,edge);
    out+=line(439,303,825,303,edge)+small(842,307,'Today')+line(900,303,1354,303,edge);
    out+=enter(avatar(452,342,'ME','#456258',13)+box(477,326,512,77,12,panel,'none')+txt(494,353,'Hi, I’m Morgan Ellis at Oak Street Partners.',18,white)+txt(494,382,'You can reach me at morgan@example.com.',18,white),local,.1,.45,8);
    out+=enter(avatar(452,432,'ME','#456258',13)+box(477,418,568,107,12,panel,'none')+txt(494,447,'We have a $500,000 allocation for the',19,white)+txt(494,476,'Oak Street acquisition.',19,white)+txt(494,505,'Can you send the terms this week?',19,white),local,.6,.45,8);
    // Every composer control shares this rectangle's coordinate system.
    const composer={x:436,y:708,w:918,h:44};
    const reply='I’ll prepare the terms and keep the team updated.';
    const typing= !scan&&local>=1.8&&local<3.95;
    const typed=reply.slice(0,Math.floor(Math.max(0,Math.min(1,(local-1.8)/1.6))*reply.length));
    let input=box(0,0,composer.w,composer.h,22,panel,'#344560')+glyph('smile',14,13,18)+txt(45,28,typing?typed:'Message Morgan Ellis…',14,typing?white:muted)+glyph('clip',composer.w-76,14,17);
    input+=circle(composer.w-25,22,15,typing?blue:'#1d2940')+glyph('send',composer.w-34,13,18,white);
    out+=group(input,1,composer.x,composer.y);
    if(!scan){
      out+=enter(box(784,560,568,47,22,blue,'none')+txt(803,590,reply,17,white)+txt(1325,627,'Sent',10,muted),local,3.96,.35,6);
      out+=cursor(t,[[8.4,1100,651],[9.1,1328,729],[9.6,1328,729,true],[10.45,92,234],[11.1,92,234,true]],8.4,11.25);
    } else {
      const sweep=p(t,1.8,.3)*(1-p(t,4.8,.4));
      out+=group(box(477,418+Math.min(80,Math.max(0,(t-1.8)*27)),568,27,4,'url(#scan)','none'),sweep);
      out+=enter(box(1100,334,251,119,10,'#1c2030','#6b5d40')+txt(1117,363,'Claude is reviewing',16,gold,500)+txt(1117,386,'connected messages',15,white)+txt(1117,426,'Looking for potential deals',12,muted),t,1.8,.4,5);
      out+=enter(box(1100,480,251,75,10,'#242321','#776644')+txt(1117,510,'Possible deal found',16,gold,550)+txt(1117,535,'Review it in Deal Desk',13,muted),t,4.7,.45,6);
      out+=cursor(t,[[5.1,1176,581],[5.8,92,234,true]],5.1,6.15);
    }
    return out;
  }
  function dealWorkspace(t,{filed=false}={}) {
    const accepted=filed||t>=11.7;
    let out=frame('desk',accepted?'2':'1')+line(418,207,418,772,edge)+txt(137,243,'Deal Desk',21,white,600)+button(136,261,138,'Archive')+button(283,261,119,'+ New deal',true)+small(136,316,accepted?'2 threads · color = vertical':'1 thread · color = vertical');
    let list='';
    if(!accepted){
      list+=box(133,332,270,241,11,'#252423','#695b3e')+circle(150,351,3,gold)+txt(162,355,'AI DETECTED · 1 NEW OFFER',10,gold,500,mono)+line(146,368,390,368,edge)+icon('siTelegram',146,382,15)+small(169,394,'Morgan Ellis')+small(357,394,'85%');
      list+=txt(147,421,'Oak Street acquisition',17,white,600)+txt(147,446,'$500,000 allocation',15,gold)+txt(147,475,'“We have a $500,000 allocation',13,muted)+txt(147,495,'for the Oak Street acquisition…”',13,muted);
      list+=button(146,524,118,'File as deal',true)+button(273,524,114,'Dismiss');
    } else {
      list+=box(121,332,296,105,0,panel,'none')+box(121,332,3,105,0,'#f19c65','none')+txt(137,360,'Oak Street acquisition',17,white,600)+txt(137,386,'Real Estate',11,'#f19c65',500,mono)+txt(137,414,'$500,000 allocation',13,muted)+icon('siTelegram',379,391,16);
    }
    const oldY=accepted?458:600;
    list+=line(121,oldY-17,417,oldY-17,edge)+txt(137,oldY+9,'Northline expansion',16,white,550)+txt(137,oldY+35,'DTC / Ecom',11,'#54ccaa',500,mono)+txt(137,oldY+62,'Next steps this week',12,muted);
    out+=list+line(121,738,417,738,edge)+small(143,758,'PRE-IPO   REAL   DTC   PE')+box(133,751,5,5,1,'#639be5','none')+box(197,751,5,5,1,'#f19c65','none')+box(245,751,5,5,1,'#54ccaa','none')+box(287,751,5,5,1,'#cb83a8','none');
    const title=accepted?'Oak Street acquisition':'Review a detected deal';
    out+=box(419,208,747,3,0,accepted?'#f19c65':gold,'none')+txt(438,244,title,23,white,600)+button(438,263,48,'Edit')+button(494,263,137,accepted?'Conversations · 1':'Conversations · 0')+button(639,263,95,'Documents')+button(742,263,73,'Archive')+button(823,263,67,'Delete');
    if(accepted)out+=box(1063,225,84,23,5,'#d4b47412',gold)+txt(1105,241,'PENDING',10,gold,500,'text-anchor="middle" '+mono);
    out+=line(418,308,1166,308,edge)+line(418,367,1166,367,edge);
    [['TERMS',accepted?'$500,000 allocation':'—'],['PARTIES',accepted?'Morgan Ellis':'—'],['TIMELINE',accepted?'Send terms this week':'—'],['VERTICAL',accepted?'Real Estate':'—']].forEach((row,i)=>{const x=438+i*183;out+=small(x,329,row[0])+txt(x,351,row[1],12,i===3&&accepted?'#f19c65':white,500)+(i>0?line(x-20,309,x-20,367,edge):'')});
    out+=box(419,368,747,403,0,panel,'none')+line(1166,207,1166,772,edge)+txt(1185,240,'Rolodex  ›',17,white,600)+small(1185,263,'People in this deal')+line(1166,279,1376,279,edge);
    if(accepted){
      out+=avatar(450,415,'ME','#456258',14)+txt(475,413,'Morgan Ellis',14,white,600)+small(588,412,'Telegram · source message')+box(475,429,651,107,12,'#1b2435','none')+txt(492,459,'We have a $500,000 allocation for the Oak Street acquisition.',17,white)+txt(492,488,'Can you send the terms this week?',17,white)+small(493,519,'Linked conversation · Morgan Ellis');
      out+=avatar(1198,312,'ME','#456258',15)+txt(1224,310,'Morgan Ellis',14,white,550)+txt(1224,331,'Oak Street Partners',10,muted)+icon('siTelegram',1224,344,15);
      out+=button(1180,677,183,'+ Add party')+button(1180,714,183,'+ Add a conversation');
      // The compact reply field follows the app, with its send affordance inside.
      out+=box(438,708,708,44,22,ink,'#344560')+glyph('smile',453,721,18)+txt(482,736,'Message Morgan Ellis…',14,muted)+glyph('clip',1079,721,17)+circle(1121,730,15,'#1d2940')+glyph('send',1112,721,18,white);
    } else {
      out+=txt(440,413,'Review the suggestion in the Deal Desk sidebar.',17,muted)+txt(440,445,'Check the source, then choose File as deal or Dismiss.',15,muted)+txt(1185,315,'The people in your deal',12,muted)+txt(1185,337,'will appear here.',12,muted);
      out+=cursor(t,[[8.4,633,490],[9.2,281,477],[10.7,204,541],[11.65,204,541,true]],8.4,11.7);
    }
    if(!filed&&accepted)out+=enter(box(719,605,407,51,9,'#172b25','#36594a')+check(736,620,'#92ccb1',18)+txt(766,636,'Deal filed · source conversation linked',16,'#92ccb1',500),t,11.7,.45,6);
    return out;
  }
  return {messageWorkspace,dealWorkspace};
}
