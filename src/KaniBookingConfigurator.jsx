import React, { useState, useMemo, useEffect, useRef } from 'react';
import './KaniBookingConfigurator.css';

const SERVICES={
  swedish:{id:'swedish',name:'Swedish',description:'Gentle flowing strokes for relaxation.',durations:{60:750,90:950,120:1150}},
  kiddies:{id:'kiddies',name:'Kiddies Massage',description:'A gentle, Swedish-style massage for children under 14.',durations:{30:300}},
  deepTissue:{id:'deepTissue',name:'Deep Tissue',description:'Targeted pressure for chronic tension.',durations:{60:950,90:1250,120:1550}},
  sports:{id:'sports',name:'Sports Massage',description:'Performance-focused muscle treatment.',durations:{60:1000,90:1300,120:1600}},
  hotColdStone:{id:'hotColdStone',name:'Hot Stone',description:'A soothing heated-stone experience.',durations:{60:900,90:1200,120:1450}},
  thai:{id:'thai',name:'Thai',description:'Stretching and pressure techniques.',durations:{60:800,90:1000,120:1250}},
  aromatherapy:{id:'aromatherapy',name:'Aromatherapy',description:'Essential oils with therapeutic touch.',durations:{60:850,90:1100,120:1350}},
  prePostNatal:{id:'prePostNatal',name:'Prenatal Massage',description:'Nurturing massage tailored for pregnancy.',durations:{60:950}},
  mld:{id:'mld',name:'Manual Lymphatic Drainage',description:'Gentle technique to support lymphatic flow.',durations:{60:950,90:1250,120:1550}},
  reflexology:{id:'reflexology',name:'Reflexology',description:'Pressure-point therapy focused on the feet.',durations:{30:550,45:700}},
  bns:{id:'bns',name:'Back, Neck & Shoulders',description:'Focused upper-body tension relief.',durations:{45:700}},
  legWork:{id:'legWork',name:'Leg Work',description:'Targeted lower-body treatment.',durations:{45:700,60:800}},
  geriatric:{id:'geriatric',name:'Geriatric Massage',description:'Gentle massage adapted for older adults.',durations:{60:750}},
  couples:{id:'couples',name:'Couples Massage',description:'A shared massage experience.',durations:{60:1400,90:1800,120:2200},simultaneousDurations:{60:1800,90:2200,120:2600}},
  royalty:{id:'royalty',name:'Royalty Massage',description:'Four-handed signature luxury experience.',durations:{60:2000,90:2700,120:3300}},
};

const ADDONS={
  facialMassage:{id:'facialMassage',name:'Facial Massage',price:150,duration:15},
  headMassage:{id:'headMassage',name:'Head Massage',price:150,duration:15},
  facialHeadMassage:{id:'facialHeadMassage',name:'Facial + Head Massage',price:250,duration:30},
  bodyExfoliation:{id:'bodyExfoliation',name:'Body Exfoliation',price:350,duration:25},
  bodyWrap:{id:'bodyWrap',name:'Body Wrap + Exfoliation',price:450,duration:35},
  footSoak:{id:'footSoak',name:'Foot Soak & Scrub',price:300,duration:30},
};

const SURCHARGES={afterHoursStart:21,feePerHour:150};
const INTENTS=[
  {id:'relaxation',label:'Relaxation',desc:'Melt away the day, restore calm'},
  {id:'painRelief',label:'Pain Relief',desc:'Targeted care for aches and tension'},
  {id:'recovery',label:'Recovery',desc:'Restore and perform at your best'},
  {id:'luxury',label:'Luxury Indulgence',desc:'A curated experience of pure opulence'},
];
const CATEGORIES=[
  {id:'individual',label:'Individual & Couples',desc:'Personalised treatments for one or two guests'},
  {id:'group',label:'Small Groups',desc:'Book treatments for 3–8 guests together in a private, informal setting'},
  {id:'events',label:'Events & Celebrations',desc:'Coordinated massage services for celebrations, retreats and special events'},
  {id:'corporate',label:'Corporate Wellness',desc:'Tailored wellbeing for teams and businesses'},
];
const GROUP_TYPES=['Friends booking together','Family wellness booking','Colleagues booking together','Other'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS=['Su','Mo','Tu','We','Th','Fr','Sa'];
const TIMES=[];
for(let h=6;h<=22;h++)for(let m of[0,30])TIMES.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);

function uuid(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function calcAH(time,mins){
  if(!time)return 0;
  const[h,m]=time.split(':').map(Number);
  const end=h*60+m+mins,cut=SURCHARGES.afterHoursStart*60;
  if(end<=cut)return 0;
  return Math.max(0,Math.round(((end-Math.max(h*60+m,cut))/60)*SURCHARGES.feePerHour));
}
function calcPrice(sid,dur,addons,simul){
  const s=SERVICES[sid];if(!s)return 0;
  const base=sid==='couples'&&simul?(s.simultaneousDurations?.[dur]||s.durations[dur]||0):(s.durations[dur]||0);
  return base+addons.reduce((t,a)=>t+(ADDONS[a]?.price||0),0);
}
function fmtDate(d){if(!d)return'';return`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`}

export default function KaniBookingConfigurator(){
  const[step,setStep]=useState(0);
  const bookingRootRef=useRef(null);
  const previousStepRef=useRef(0);
  useEffect(()=>{
    if(previousStepRef.current===step)return;
    previousStepRef.current=step;
    const root=bookingRootRef.current;
    if(!root)return;
    requestAnimationFrame(()=>root.scrollIntoView({behavior:'auto',block:'start'}));
  },[step]);
  const[intent,setIntent]=useState(null);
  const[cat,setCat]=useState(null);
  const[items,setItems]=useState([]);
  const[date,setDate]=useState(null);
  const[time,setTime]=useState(null);
  const[addr,setAddr]=useState({name:'',street:'',suburb:'',notes:'',additionalNotes:''});
  const[group,setGroup]=useState({adults:3,children:0,eventType:''});
  const[corp,setCorp]=useState({company:'',contact:'',attendees:2,eventType:'',location:''});
  const[event,setEvent]=useState({contact:'',attendees:3,eventType:'',location:'',notes:''});
  const N=8;
  const itemDuration=it=>((parseInt(it.duration)||60)*(it.serviceId==='couples'&&(it.therapistCount||1)===1?2:1))+it.addons.reduce((sum,a)=>sum+(ADDONS[a]?.duration||0),0);
  const totalMins=useMemo(()=>{if(items.length===2&&items.every(it=>it.bookingArrangement==='simultaneous'))return Math.max(...items.map(itemDuration));return items.reduce((s,it)=>s+itemDuration(it),0)},[items]);
  const simultaneousStaffingPremium=items.length===2&&items.every(it=>it.bookingArrangement==='simultaneous')?300:0;
  const baseTotal=useMemo(()=>items.reduce((s,it)=>s+it.price,0)+simultaneousStaffingPremium,[items,simultaneousStaffingPremium]);
  const ahFee=useMemo(()=>time?calcAH(time,totalMins):0,[time,totalMins]);
  const final=baseTotal+ahFee;
  const next=()=>setStep(s=>Math.min(s+1,N-1));
  const back=()=>setStep(s=>Math.max(s-1,0));
  const selectCategory=id=>{setCat(id);setItems([])};

  function sendWA(){
    const simultaneousIndividual=items.length===2&&items.every(it=>it.bookingArrangement==='simultaneous');
    const therapists=simultaneousIndividual?items.reduce((sum,it)=>sum+(it.therapistCount||1),0):items.reduce((max,it)=>Math.max(max,it.therapistCount||1),0);
    const arrangementDetails=items.some(it=>it.bookingArrangement)?'\nArrangement: '+(simultaneousIndividual?'Both guests treated at the same time':'Guests treated one after the other'):'';
    const staffingPremiumDetails=simultaneousStaffingPremium?'\nAdditional staffing for simultaneous treatment: R'+simultaneousStaffingPremium:'';
    const lines=items.map(it=>{
      const adds=it.addons.map(a=>ADDONS[a]).filter(Boolean);
      const addText=adds.map(a=>`${a.name} (+${a.duration} min)`);
      return `• ${it.label?it.label+' — ':''}${SERVICES[it.serviceId]?.name} (${it.duration} min)${addText.length?' + '+addText.join(', '):''} — R${it.price.toLocaleString()}`;
    }).join('\n');
    const experience=INTENTS.find(i=>i.id===intent)?.label;
    const location=[addr.street,addr.suburb].filter(Boolean).join(', ');
    const dateTime=[fmtDate(date),time].filter(Boolean).join(' at ');
    const notes=[addr.notes? 'Access details: '+addr.notes:'',addr.additionalNotes? 'Anything else we should know: '+addr.additionalNotes:''].filter(Boolean).join('\n');
    let msg='';
    if(cat==='corporate'){
      msg=`Hi BeautyCall team! 👋

I'd love to enquire about arranging massage and wellness services for our team. Here are the details so far:

Company: ${corp.company}
Contact: ${corp.contact||addr.name}
Number of attendees: ${corp.attendees}
Occasion: ${corp.eventType||'Not decided yet'}
Location: ${corp.location||location||'To be confirmed'}
Preferred date and time: ${dateTime||'To be discussed'}

Could you help me explore the options and put together a tailored quote? Thanks — I look forward to hearing from you!`;
    }else if(cat==='events'){
      msg=`Hi BeautyCall team! 👋

I'm planning an event and would love to explore having BeautyCall there. Here are the details:

Event: ${event.eventType||'Not specified yet'}
Number of guests: ${event.attendees}
Contact name: ${event.contact||addr.name}
Location: ${event.location||location||'To be confirmed'}
Preferred date and time: ${dateTime||'To be discussed'}${event.notes?'\nA little more about the event: '+event.notes:''}

Could you let me know what options might work and help me with a quote? Thank you!`;
    }else{
      const bookingType=items.some(it=>it.serviceId==='couples')?'a couples massage':cat==='group'?'a group massage experience':'a massage';
      const pricing=(cat==='corporate'||cat==='events')?'':`\n\nMy treatment selection:
${lines}${arrangementDetails}${staffingPremiumDetails}
Estimated treatment time: ${totalMins} minutes${ahFee?'\nAfter-hours fee: R'+ahFee.toLocaleString():''}
Estimated total: R${final.toLocaleString()}`;
      const groupInfo=cat==='group'? `\nGroup occasion: ${group.eventType||'Not specified yet'}\nGuests: ${group.adults+group.children}`:'';
      msg=`Hi BeautyCall! 👋

I'd love to arrange ${bookingType} and check your availability.${experience?' I’m looking for a '+experience.toLowerCase()+' experience.':''}

Name: ${addr.name}
Preferred date and time: ${dateTime||'To be confirmed'}
Location: ${location||'To be confirmed'}${groupInfo}${pricing}

${notes?notes+'\n\n':''}Would you please let me know if this works and if you need anything else from me? Looking forward to hearing from you. Thank you!`;
    }
    window.open(`https://wa.me/27624771887?text=${encodeURIComponent(msg)}`,'_blank');
  }

  return React.createElement('div',{ref:bookingRootRef,className:'kani-booking-root wrap'},
    React.createElement('div',{className:'site-header'},
      React.createElement('div',{className:'site-logo'},'BeautyCall'),
      React.createElement('div',{className:'site-sub'},'Mobile Massage Therapy')
    ),
    React.createElement('div',{className:'progress-wrap'},
      React.createElement('div',{className:'progress-track'},React.createElement('div',{className:'progress-fill',style:{width:(step/(N-1)*100)+'%'}})),
      React.createElement('div',{className:'step-dots'},Array.from({length:N},(_,i)=>React.createElement('div',{key:i,className:`step-dot${i===step?' active':i<step?' done':''}`})))
    ),
    step===0&&React.createElement(S1Intent,{intent,setIntent,onNext:next}),
    step===1&&React.createElement(S2Category,{cat,setCat:selectCategory,onNext:next,onBack:back}),
    step===2&&React.createElement(S3Builder,{cat,items,setItems,group,setGroup,corp,setCorp,event,setEvent,onNext:next,onBack:back}),
    step===3&&React.createElement(S4Date,{date,setDate,onNext:next,onBack:back}),
    step===4&&React.createElement(S5Time,{time,setTime,items,onNext:next,onBack:back}),
    step===5&&React.createElement(S6Address,{addr,setAddr,onNext:next,onBack:back}),
    step===6&&React.createElement(S7Summary,{intent,cat,date,time,addr,items,baseTotal,ahFee,final,corp,event,simultaneousStaffingPremium,onNext:next,onBack:back}),
    step===7&&React.createElement(S8Checkout,{sendWA,onBack:back,final,cat})
  );
}


function CustomSelect({value,options,onChange,className='',ariaLabel='Choose an option'}){
  const[open,setOpen]=useState(false);
  const[activeIndex,setActiveIndex]=useState(Math.max(0,options.findIndex(option=>option.value===value)));
  const rootRef=useRef(null);
  const triggerRef=useRef(null);
  const optionRefs=useRef([]);
  const selectedIndex=Math.max(0,options.findIndex(option=>option.value===value));
  const selected=options.find(option=>option.value===value)||options[0];

  useEffect(()=>{
    if(!open)return;
    const closeOnOutside=e=>{if(rootRef.current&&!rootRef.current.contains(e.target))setOpen(false)};
    const closeOnEscape=e=>{if(e.key==='Escape'){setOpen(false);triggerRef.current?.focus()}};
    document.addEventListener('pointerdown',closeOnOutside);
    document.addEventListener('keydown',closeOnEscape);
    optionRefs.current[activeIndex]?.focus();
    return()=>{
      document.removeEventListener('pointerdown',closeOnOutside);
      document.removeEventListener('keydown',closeOnEscape);
    };
  },[open,activeIndex]);

  function choose(index){
    const option=options[index];
    if(!option)return;
    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus();
  }
  function handleTriggerKeyDown(e){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      const next=e.key==='ArrowDown'?Math.min(selectedIndex+1,options.length-1):Math.max(selectedIndex-1,0);
      setActiveIndex(next);
      setOpen(true);
    }else if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      setActiveIndex(selectedIndex);
      setOpen(v=>!v);
    }
  }
  function handleOptionKeyDown(e,index){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      const next=e.key==='ArrowDown'?Math.min(index+1,options.length-1):Math.max(index-1,0);
      setActiveIndex(next);
      optionRefs.current[next]?.focus();
    }else if(e.key==='Home'||e.key==='End'){
      e.preventDefault();
      const next=e.key==='Home'?0:options.length-1;
      setActiveIndex(next);
      optionRefs.current[next]?.focus();
    }else if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      choose(index);
    }else if(e.key==='Tab'){
      setOpen(false);
    }
  }

  return React.createElement('div',{className:'custom-select-wrap '+className,ref:rootRef},
    React.createElement('button',{
      type:'button',
      ref:triggerRef,
      className:'custom-select-trigger',
      'aria-label':ariaLabel,
      'aria-haspopup':'listbox',
      'aria-expanded':open,
      onClick:()=>{setActiveIndex(selectedIndex);setOpen(v=>!v)},
      onKeyDown:handleTriggerKeyDown
    },
      React.createElement('span',{className:'custom-select-value'+(selected&&selected.value===''?' placeholder':'')},selected?.label||'Choose an option'),
      React.createElement('span',{className:'custom-select-chevron','aria-hidden':'true'},'⌄')
    ),
    open&&React.createElement('div',{className:'custom-select-menu',role:'listbox','aria-label':ariaLabel},
      options.map((option,index)=>React.createElement('button',{
        key:String(option.value)+'-'+index,
        type:'button',
        ref:el=>{optionRefs.current[index]=el},
        role:'option',
        'aria-selected':option.value===value,
        tabIndex:activeIndex===index?0:-1,
        className:'custom-select-option'+(option.value===value?' selected':'')+(index===activeIndex?' active':''),
        onClick:()=>choose(index),
        onKeyDown:e=>handleOptionKeyDown(e,index)
      },
        React.createElement('span',{className:'custom-select-option-label'},option.label),
        option.value===value&&React.createElement('span',{className:'custom-select-check','aria-hidden':'true'},'✓')
      ))
    )
  );
}

function S1Intent({intent,setIntent,onNext}){
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 01'),
    React.createElement('div',{className:'step-title'},'What brings you to BeautyCall?'),
    React.createElement('div',{className:'step-sub'},'Set the intention for your experience'),
    React.createElement('div',{className:'card-grid-2'},
      INTENTS.map(i=>React.createElement('div',{key:i.id,className:`card${intent===i.id?' selected':''}`,onClick:()=>setIntent(i.id)},
        React.createElement('div',{className:'card-title'},i.label),

        intent===i.id&&React.createElement('div',{className:'check'},'✓')
      ))
    ),
    React.createElement('button',{className:'btn-primary',disabled:!intent,onClick:onNext},'Continue'),
    React.createElement('div',{className:'concierge-link-wrap'},
      React.createElement('span',{className:'concierge-prompt'},'Prefer a personal touch?'),
      React.createElement('a',{className:'concierge-link',href:'https://wa.me/27624771887?text=Hi%20BeautyCall%2C%20I%27d%20like%20to%20enquire%20about%20a%20massage.',target:'_blank',rel:'noopener noreferrer'},'Connect with our concierge via WhatsApp')
    )
  );
}

function S2Category({cat,setCat,onNext,onBack}){
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 02'),
    React.createElement('div',{className:'step-title'},'Choose your category'),
    React.createElement('div',{className:'step-sub'},'Each path is uniquely curated for you'),
    React.createElement('div',{style:{display:'grid',gap:8,marginBottom:24}},
      CATEGORIES.map(c=>React.createElement('div',{key:c.id,className:`card${cat===c.id?' selected':''}`,onClick:()=>setCat(c.id),style:{display:'flex',alignItems:'center',gap:16}},
        React.createElement('div',{style:{flex:1}},
          React.createElement('div',{className:'card-title'},c.label),
          React.createElement('div',{className:'card-desc'},c.desc)
        ),
        cat===c.id&&React.createElement('div',{className:'check'},'✓')
      ))
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!cat,onClick:onNext,style:{flex:1}},'Continue')
    )
  );
}

function S3Builder({cat,items,setItems,group,setGroup,corp,setCorp,event,setEvent,onNext,onBack}){
  if(cat==='corporate')return React.createElement(CorpBuilder,{corp,setCorp,onNext,onBack});
  if(cat==='events')return React.createElement(EventBuilder,{event,setEvent,onNext,onBack});
  return React.createElement(GuestBuilder,{mode:cat==='group'?'group':'individual',group,setGroup,setItems,items,onNext,onBack});
}

function GuestBuilder({mode,group,setGroup,setItems,items,onNext,onBack}){
  const isGroup=mode==='group';
  const[guestCount,setGuestCount]=useState(1);
  const[pSvc,setPSvc]=useState({});
  const[pDur,setPDur]=useState({});
  const[pAdd,setPAdd]=useState({});
  const[pName,setPName]=useState({});
  const[openCards,setOpenCards]=useState({g0:true,a0:true});
  const[confirmed,setConfirmed]=useState(false);
  const[couplesPackage,setCouplesPackage]=useState(false);
  const[couplesTherapists,setCouplesTherapists]=useState(2);
  const[couplesDuration,setCouplesDuration]=useState(90);
  const[individualArrangement,setIndividualArrangement]=useState('sequential');
  const count=isGroup?group.adults+group.children:guestCount;
  const parts=useMemo(()=>Array.from({length:count},(_,i)=>({type:isGroup?(i<group.adults?'Adult':'Child'):'Guest',num:isGroup?(i<group.adults?i+1:i-group.adults+1):i+1,key:isGroup?(i<group.adults?'a'+i:'c'+(i-group.adults)):'g'+i})),[count,isGroup,group.adults,group.children,guestCount]);
  const isChild=k=>isGroup&&k.startsWith('c');
  const getSvc=k=>isChild(k)?'kiddies':pSvc[k]||'swedish';
  const getDur=k=>{if(isChild(k))return 30;const keys=Object.keys(SERVICES[getSvc(k)].durations).map(Number);const d=pDur[k];return d&&keys.includes(d)?d:keys[1]||keys[0]};
  const getAdd=k=>isChild(k)?[]:pAdd[k]||[];
  const toggleA=(k,id)=>setPAdd(p=>{
    const current=p[k]||[];
    if(current.includes(id))return {...p,[k]:current.filter(a=>a!==id)};
    const faceHead=['facialMassage','headMassage','facialHeadMassage'];
    const remaining=faceHead.includes(id)?current.filter(a=>!faceHead.includes(a)):current;
    return {...p,[k]:[...remaining,id]};
  });
  const simultaneousStaffingPremium=!isGroup&&guestCount===2&&individualArrangement==='simultaneous'?300:0;
  const groupTotal=!isGroup&&guestCount===2&&couplesPackage?calcPrice('couples',couplesDuration,[],true):parts.reduce((sum,p)=>sum+calcPrice(getSvc(p.key),getDur(p.key),getAdd(p.key),false),0)+simultaneousStaffingPremium;
  function updateCount(type,delta){
    setConfirmed(false);
    if(!isGroup){setGuestCount(n=>Math.max(1,Math.min(2,n+delta)));return;}
    setGroup(g=>{
      const adults=type==='Adult'?Math.max(0,Math.min(8-g.children,g.adults+delta)):g.adults;
      const children=type==='Child'?Math.max(0,Math.min(8-g.adults,g.children+delta)):g.children;
      return {...g,adults,children};
    });
  }
  function confirm(){
    if(count<1||count>8||(isGroup&&count<3))return;
    if(!isGroup&&guestCount===2&&couplesPackage){
      setItems([{id:uuid(),serviceId:'couples',duration:couplesDuration,addons:[],price:calcPrice('couples',couplesDuration,[],true),therapistCount:2,label:'Couples Massage — simultaneous'}]);
    }else{
      const arrangement=!isGroup&&guestCount===2?individualArrangement:null;
      setItems(parts.map(p=>{const sid=getSvc(p.key),d=getDur(p.key),a=getAdd(p.key);return {id:uuid(),serviceId:sid,duration:d,addons:a,price:calcPrice(sid,d,a,false),therapistCount:sid==='royalty'?2:1,bookingArrangement:arrangement,label:(pName[p.key]?.trim()||p.type+' '+p.num)+(arrangement?' — '+(arrangement==='simultaneous'?'simultaneous individual treatment':'sequential individual treatment'):'')}}));
    }
    setConfirmed(true);
    onNext();
  }
  const summaryItems = !isGroup&&guestCount===2&&couplesPackage
    ? [{key:'couples-package',label:'Couples Massage',serviceId:'couples',duration:couplesDuration,addons:[],price:calcPrice('couples',couplesDuration,[],true),detail:'Two guests · simultaneous'}]
    : parts.map(p=>({key:p.key,label:pName[p.key]?.trim()||p.type+' '+p.num,serviceId:getSvc(p.key),duration:getDur(p.key),addons:getAdd(p.key),price:calcPrice(getSvc(p.key),getDur(p.key),getAdd(p.key),false),detail:isGroup?'Group treatment':(!isGroup&&guestCount===2?(individualArrangement==='simultaneous'?'Simultaneous':'Sequential'):'Individual treatment')}));
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 03'),
    React.createElement('div',{className:'step-title'},isGroup?'Small Group Experience':'Personalise Each Guest’s Experience'),
    React.createElement('div',{className:'step-sub'},isGroup?'For 3–8 guests booking treatments together in a private, informal setting.':'Choose one or two guests, then select a treatment for each person.'),
    !confirmed&&React.createElement('div',null,
      !isGroup&&React.createElement('div',{className:'premium-service-grid'},
        React.createElement('button',{type:'button',className:'premium-service-card'+(!couplesPackage&&guestCount===1&&getSvc('g0')==='royalty'?' selected':''),onClick:()=>{setGuestCount(1);setCouplesPackage(false);setPSvc(prev=>({...prev,g0:'royalty'}));setConfirmed(false)}},
          React.createElement('span',{className:'premium-service-kicker'},'SIGNATURE EXPERIENCE'),
          React.createElement('span',{className:'premium-service-title'},'Royalty Massage'),
          React.createElement('span',{className:'premium-service-description'},'An indulgent four-handed massage, with two therapists working in harmony.'),
          React.createElement('span',{className:'premium-service-price'},'From R 2,000'),
          React.createElement('span',{className:'premium-service-cta'},'Explore Royalty  ↗')
        ),
        React.createElement('button',{type:'button',className:'premium-service-card'+(couplesPackage?' selected':''),onClick:()=>{if(couplesPackage){setCouplesPackage(false)}else{setGuestCount(2);setCouplesPackage(true)}setConfirmed(false)}},
          React.createElement('span',{className:'premium-service-kicker'},'SHARED LUXURY'),
          React.createElement('span',{className:'premium-service-title'},'Couples Massage'),
          React.createElement('span',{className:'premium-service-description'},'A shared premium experience, with two therapists treating you at the same time.'),
          React.createElement('span',{className:'premium-service-price'},'From R 1,800'),
          React.createElement('span',{className:'premium-service-cta'},'Create your couples experience  ↗')
        )
      ),
      !isGroup&&React.createElement('div',{className:'booking-choice-divider'},React.createElement('span',null,'OR CUSTOMISE YOUR OWN BOOKING')),
      isGroup&&React.createElement('div',null,
        React.createElement('div',{className:'field-label',style:{marginBottom:8}},'Who is booking together?'),
        React.createElement('div',{className:'pills-wrap'},GROUP_TYPES.map(e=>React.createElement('button',{key:e,className:'pill'+(group.eventType===e?' active':''),onClick:()=>setGroup(g=>({...g,eventType:e}))},e))),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}},
          React.createElement('div',null,
            React.createElement('span',{className:'field-label'},'Adults'),
            React.createElement('div',{className:'stepper'},
              React.createElement('button',{className:'stp-btn',disabled:group.adults<=0,onClick:()=>updateCount('Adult',-1)},'−'),
              React.createElement('div',{className:'stp-val'},group.adults),
              React.createElement('button',{className:'stp-btn',disabled:count>=8,onClick:()=>updateCount('Adult',1)},'＋')
            )
          ),
          React.createElement('div',null,
            React.createElement('span',{className:'field-label'},'Children under 14'),
            React.createElement('div',{className:'stepper'},
              React.createElement('button',{className:'stp-btn',disabled:group.children<=0,onClick:()=>updateCount('Child',-1)},'−'),
              React.createElement('div',{className:'stp-val'},group.children),
              React.createElement('button',{className:'stp-btn',disabled:count>=8,onClick:()=>updateCount('Child',1)},'＋')
            )
          )
        ),
        React.createElement('div',{className:'info-box group-booking-info',style:{marginBottom:10}},
          React.createElement('div',{className:'group-booking-note'},'3–8 guests. Children under 14 receive a 30-min Kiddies Massage (R300).'),
          React.createElement('div',{className:'group-booking-links'},
            React.createElement('a',{className:'concierge-link',href:'https://wa.me/27624771887?text='+encodeURIComponent('Hi BeautyCall, I would like to discuss a treatment or duration request for a child under 14.'),target:'_blank',rel:'noopener noreferrer'},'Request a child treatment change'),
            React.createElement('a',{className:'concierge-link',href:'https://wa.me/27624771887?text=Hi%20BeautyCall%2C%20I%27d%20like%20a%20bespoke%20quote%20for%20a%20group%20massage%20booking%20for%209%2B%20guests.',target:'_blank',rel:'noopener noreferrer'},'Booking 9+ guests? Get a quote')
          )
        )
      ),
      !isGroup&&React.createElement('div',{className:'field-group'},
        React.createElement('span',{className:'field-label'},'Number of guests'),
        React.createElement('div',{className:'toggle-row'},
          React.createElement('button',{type:'button',className:'toggle-opt'+(guestCount===1?' active':''),onClick:()=>{setGuestCount(1);setCouplesPackage(false);setConfirmed(false)}},'One guest'),
          React.createElement('button',{type:'button',className:'toggle-opt'+(guestCount===2?' active':''),onClick:()=>{setGuestCount(2);setCouplesPackage(false);setConfirmed(false)}},'Two guests')
        )
      ),
      isGroup&&count<3&&React.createElement('div',{className:'info-box'},React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)'}},'Small group bookings start at 3 guests. Add at least 3 guests to continue.')),
      !isGroup&&guestCount===2&&!couplesPackage&&React.createElement('div',{className:'p-card',style:{marginBottom:16}},
        React.createElement('div',{className:'p-name',style:{marginBottom:10}},'Individual Treatment Arrangement'),
        React.createElement('div',{className:'field-label'},'How should the two sessions be scheduled?'),
        React.createElement('div',{className:'toggle-row'},
          React.createElement('button',{type:'button',className:'toggle-opt'+(individualArrangement==='sequential'?' active':''),onClick:()=>{setIndividualArrangement('sequential');setConfirmed(false)}},React.createElement('div',{className:'toggle-opt-title'},'Sequential'),React.createElement('div',{className:'toggle-opt-sub'},'One therapist at a time')),
          React.createElement('button',{type:'button',className:'toggle-opt'+(individualArrangement==='simultaneous'?' active':''),onClick:()=>{setIndividualArrangement('simultaneous');setConfirmed(false)}},React.createElement('div',{className:'toggle-opt-title'},'Simultaneous'),React.createElement('div',{className:'toggle-opt-sub'},'Guests treated together'))
        ),
        React.createElement('div',{className:'info-box',style:{margin:'8px 0 0'}},React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)',lineHeight:1.6}},individualArrangement==='sequential'?'One therapist treats each guest in turn. Each guest can choose a different treatment and duration; total booking time includes both sessions.':'Both guests are treated at the same time by separate therapists. Each guest keeps their own treatment, duration and price. Royalty remains a four-handed treatment and requires two therapists for that guest.'))
      ),
      !isGroup&&couplesPackage&&React.createElement('div',{className:'p-card',style:{marginBottom:16}},
        React.createElement('div',{className:'p-head'},
          React.createElement('div',{className:'p-name'},'Couples Massage · Simultaneous'),
          React.createElement('div',{className:'p-price'},'R '+calcPrice('couples',couplesDuration,[],true).toLocaleString())
        ),
        React.createElement('div',{className:'field-label'},'Two therapists · both guests treated together'),
        React.createElement('div',{className:'info-box',style:{margin:'10px 0 16px'}},React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)',lineHeight:1.6}},'The selected duration applies to each guest.')),
        React.createElement('div',{className:'field-label'},'Session duration'),
        React.createElement('div',{style:{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}},
          Object.keys(SERVICES.couples.durations).map(d=>React.createElement('button',{key:d,type:'button',className:'dur-btn'+(couplesDuration===Number(d)?' active':''),onClick:()=>{setCouplesDuration(Number(d));setConfirmed(false)}},d+' min'))
        ),
        React.createElement('div',{className:'price-row'},
          React.createElement('div',null,React.createElement('div',{className:'price-label'},'Couples package total'),React.createElement('div',{className:'price-val'},'R '+calcPrice('couples',couplesDuration,[],true).toLocaleString())),
          React.createElement('span',{className:'price-label'},'Package selected')
        )
      ),
      parts.length>0&&(!couplesPackage||isGroup)&&React.createElement('div',null,
        parts.map(p=>{
          const serviceName=SERVICES[getSvc(p.key)]?.name||'Kiddies Massage';
          const isOpen=!!openCards[p.key];
          const guestName=pName[p.key]?.trim();
          const cardLabel=guestName||p.type+' '+p.num;
          return React.createElement('div',{key:p.key,className:'p-card compact-guest-card'+(isOpen?' is-open':'')},
            React.createElement('button',{type:'button',className:'guest-card-toggle',onClick:()=>setOpenCards(prev=>({...prev,[p.key]:!prev[p.key]})),'aria-expanded':isOpen},
              React.createElement('span',{className:'guest-card-main'},
                React.createElement('span',{className:'guest-card-name'},cardLabel),
                React.createElement('span',{className:'guest-card-summary'},isChild(p.key)?'Kiddies Massage · 30 min':serviceName+' · '+getDur(p.key)+' min'+(getAdd(p.key).length?' · '+getAdd(p.key).length+' enhancement'+(getAdd(p.key).length>1?'s':''):''))
              ),
              React.createElement('span',{className:'guest-card-price'},'R '+calcPrice(getSvc(p.key),getDur(p.key),getAdd(p.key),false).toLocaleString()),
              React.createElement('span',{className:'guest-card-chevron','aria-hidden':true},isOpen?'−':'+')
            ),
            isOpen&&React.createElement('div',{className:'guest-card-content'},
              React.createElement('label',{className:'field-label'},'Guest name'),
              React.createElement('input',{className:'input guest-name-input',type:'text',placeholder:'',value:pName[p.key]||'',onChange:e=>{setPName(prev=>({...prev,[p.key]:e.target.value}));setConfirmed(false)}}),
              isChild(p.key)?React.createElement('div',null,
                React.createElement('div',{className:'field-label'},'Kiddies Massage · 30 minutes'),
                React.createElement('div',{className:'booking-breakdown-detail'},'Gentle Swedish-style massage for children under 14. Fixed duration and price: R300.'),
                React.createElement('a',{className:'concierge-link',href:'https://wa.me/27624771887?text='+encodeURIComponent('Hi BeautyCall, I would like to request a different treatment or duration for a child under 14.'),target:'_blank',rel:'noopener noreferrer',style:{display:'inline-block',marginTop:10}},'Request a different option for this child')
              ):React.createElement('div',null,
                React.createElement('label',{className:'field-label'},'Treatment'),
                React.createElement(CustomSelect,{value:getSvc(p.key),className:'treatment-select',options:[SERVICES.royalty,...Object.values(SERVICES).filter(s=>s.id!=='couples'&&s.id!=='royalty'&&s.id!=='kiddies')].map(s=>({value:s.id,label:s.name})),onChange:value=>{setPSvc(prev=>({...prev,[p.key]:value}));setConfirmed(false)},ariaLabel:'Choose treatment'}),
                React.createElement('span',{className:'field-label'},'Duration'),
                React.createElement('div',{style:{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}},
                  Object.keys(SERVICES[getSvc(p.key)].durations).map(d=>React.createElement('button',{key:d,type:'button',className:'dur-btn'+(getDur(p.key)===Number(d)?' active':''),onClick:()=>{setPDur(prev=>({...prev,[p.key]:Number(d)}));setConfirmed(false)}},d+' min'))
                ),
                React.createElement('span',{className:'field-label'},'Enhancements'),
                React.createElement('div',{className:'pills-wrap',style:{marginBottom:0}},
                  Object.values(ADDONS).map(a=>React.createElement('button',{key:a.id,type:'button',className:'pill'+(getAdd(p.key).includes(a.id)?' active':''),style:{fontSize:11,padding:'5px 12px'},onClick:()=>{toggleA(p.key,a.id);setConfirmed(false)}},a.name+' +'+a.duration+' min · R'+a.price))
                )
              )
            )
          );
        }),
        React.createElement('div',{className:'price-row',style:{marginTop:8}},
          React.createElement('div',null,
            React.createElement('div',{className:'price-label'},'Combined booking total'),
            React.createElement('div',{className:'price-val'},'R '+groupTotal.toLocaleString())
          ),
        ),
      )
    ),
    React.createElement('div',{className:'booking-breakdown'},
      React.createElement('div',{className:'booking-breakdown-heading'},'Your treatment breakdown'),
      summaryItems.map(item=>React.createElement('div',{key:item.key,className:'booking-breakdown-item'},
        React.createElement('div',{className:'booking-breakdown-copy'},
          React.createElement('div',{className:'booking-breakdown-name'},item.label+' · '+SERVICES[item.serviceId]?.name),
          React.createElement('div',{className:'booking-breakdown-detail'},item.duration+' minutes'+(item.addons.length?' · '+item.addons.map(a=>ADDONS[a]?.name).filter(Boolean).join(', '):'')+' · '+item.detail),
          item.addons.length>0&&React.createElement('div',{className:'booking-breakdown-detail'},'Enhancements: '+item.addons.map(a=>ADDONS[a]?.name+' (+'+(ADDONS[a]?.duration||0)+' min, +R'+ADDONS[a]?.price+')').join(', '))
        ),
        React.createElement('div',{className:'booking-breakdown-price'},'R '+item.price.toLocaleString())
      )),
      !isGroup&&guestCount===2&&couplesPackage===false&&individualArrangement==='simultaneous'&&React.createElement('div',{className:'booking-breakdown-item'},
        React.createElement('div',{className:'booking-breakdown-copy'},React.createElement('div',{className:'booking-breakdown-name'},'Simultaneous Staffing Premium'),React.createElement('div',{className:'booking-breakdown-detail'},'Additional therapist staffing for both guests')),
        React.createElement('div',{className:'booking-breakdown-price'},'R 300')
      ),
      React.createElement('div',{className:'booking-breakdown-total'},
        React.createElement('span',null,'Estimated treatment total'),
        React.createElement('strong',null,'R '+groupTotal.toLocaleString())
      ),
      React.createElement('div',{className:'booking-breakdown-note'},'Your date, time and location are collected next. After-hours fees, if applicable, are calculated once your time is selected.')
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      isGroup&&React.createElement('button',{className:'btn-primary',disabled:(isGroup?count<3:count<1)||count>8,onClick:confirm,style:{flex:1}},'Continue to Date & Time')
    )
  );
}

function EventBuilder({event,setEvent,onNext,onBack}){
  const set=k=>e=>setEvent(v=>({...v,[k]:e.target.value}));
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 03'),
    React.createElement('div',{className:'step-title'},'Events & Celebrations'),
    React.createElement('div',{className:'step-sub'},'For coordinated massage services at a celebration, retreat or larger event. Our concierge will tailor the setup and quote.'),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Event Type'),
      React.createElement(CustomSelect,{value:event.eventType,className:'event-select',options:[{value:'',label:'Select an event'},...['Bridal Party','Birthday Celebration','Wedding','Private Celebration','Wellness Retreat','Other'].map(v=>({value:v,label:v}))],onChange:value=>setEvent(prev=>({...prev,eventType:value})),ariaLabel:'Choose event type'})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Estimated Guests'),
      React.createElement('input',{className:'input',type:'number',min:1,value:event.attendees,onChange:e=>setEvent(v=>({...v,attendees:Math.max(1,Math.min(500,Number(e.target.value)||1))}))})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Event Location'),
      React.createElement('input',{className:'input',placeholder:'Venue, suburb or address',value:event.location,onChange:set('location')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Contact Person (optional)'),
      React.createElement('input',{className:'input',placeholder:'Name of organiser',value:event.contact,onChange:set('contact')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Event Requirements (optional)'),
      React.createElement('textarea',{className:'input',placeholder:'Timing, number of therapists, treatment preferences…',value:event.notes,onChange:set('notes')})
    ),
    React.createElement('div',{className:'info-box'},
      React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)',lineHeight:1.6}},'Events are arranged through a tailored quote. You can provide the date and preferred start time in the next steps.')
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!event.eventType||!event.location.trim(),onClick:onNext,style:{flex:1}},'Continue to Date')
    )
  );
}

function CorpBuilder({corp,setCorp,onNext,onBack}){
  const set=k=>e=>setCorp(c=>({...c,[k]:e.target.value}));
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 03'),
    React.createElement('div',{className:'step-title'},'Corporate Wellness'),
    React.createElement('div',{className:'step-sub'},"We'll prepare a bespoke quote for your team"),
    [['company','Company Name','Acme Corporation'],['contact','Contact Person','Jane Smith'],['eventType','Event Type','Team day, retreat, wellness week…'],['location','Location / Office','Cape Town CBD, Cape Town']].map(([k,label,ph])=>
      React.createElement('div',{key:k,className:'field-group'},
        React.createElement('label',{className:'field-label'},label),
        React.createElement('input',{className:'input',placeholder:ph,value:corp[k],onChange:set(k)})
      )
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Number of Attendees'),
      React.createElement('div',{className:'stepper'},
        React.createElement('button',{className:'stp-btn',onClick:()=>setCorp(c=>({...c,attendees:Math.max(1,c.attendees-1)}))},'−'),
        React.createElement('div',{className:'stp-val'},corp.attendees),
        React.createElement('button',{className:'stp-btn',onClick:()=>setCorp(c=>({...c,attendees:c.attendees+1}))},'＋')
      )
    ),
    React.createElement('div',{className:'info-box',style:{marginTop:8}},
      React.createElement('div',{style:{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--blush)',marginBottom:6}},'Bespoke Corporate Packages'),
      React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)',lineHeight:1.6}},'Tell us your team size, location and goals. Our concierge will prepare a tailored wellness proposal.')
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!corp.company.trim()||!corp.contact.trim()||!corp.location.trim(),onClick:onNext,style:{flex:1}},'Request a Quote')
    )
  );
}

function S4Date({date,setDate,onNext,onBack}){
  const today=new Date();today.setHours(0,0,0,0);
  const[cal,setCal]=useState({y:today.getFullYear(),m:today.getMonth()});
  const first=new Date(cal.y,cal.m,1).getDay();
  const daysInMonth=new Date(cal.y,cal.m+1,0).getDate();
  const cells=[];for(let i=0;i<first;i++)cells.push(null);for(let d=1;d<=daysInMonth;d++)cells.push(d);
  const prev=()=>setCal(c=>{const d=new Date(c.y,c.m-1,1);return{y:d.getFullYear(),m:d.getMonth()}});
  const next=()=>setCal(c=>{const d=new Date(c.y,c.m+1,1);return{y:d.getFullYear(),m:d.getMonth()}});
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 04'),
    React.createElement('div',{className:'step-title'},'Choose your preferred date'),
    React.createElement('div',{className:'step-sub'},'Select your appointment day'),
    React.createElement('div',{className:'cal-wrap'},
      React.createElement('div',{className:'cal-head'},
        React.createElement('button',{className:'cal-nav',onClick:prev},'←'),
        React.createElement('div',{className:'cal-month'},MONTHS[cal.m]+' '+cal.y),
        React.createElement('button',{className:'cal-nav',onClick:next},'→')
      ),
      React.createElement('div',{className:'cal-grid'},
        DAYS.map(d=>React.createElement('div',{key:d,className:'cal-dh'},d)),
        cells.map((d,i)=>{
          if(!d)return React.createElement('div',{key:'e'+i});
          const dt=new Date(cal.y,cal.m,d);
          const past=dt<today,isTod=dt.getTime()===today.getTime(),isSel=date&&dt.getTime()===date.getTime();
          return React.createElement('div',{key:d,className:`cal-day${past?' disabled':''}${isTod?' today':''}${isSel?' selected':''}`,onClick:()=>!past&&setDate(new Date(cal.y,cal.m,d))},d);
        })
      )
    ),
    date&&React.createElement('div',{className:'info-box',style:{marginBottom:16}},
      React.createElement('div',{style:{fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--blush)',marginBottom:4}},'Selected Date'),
      React.createElement('div',{style:{fontFamily:'var(--serif)',fontSize:20,fontWeight:300,color:'var(--cream)'}},fmtDate(date))
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!date,onClick:onNext,style:{flex:1}},'Continue')
    )
  );
}

function S5Time({time,setTime,items,onNext,onBack}){
  const itemDuration=it=>((parseInt(it.duration)||60)*(it.serviceId==='couples'&&(it.therapistCount||1)===1?2:1))+it.addons.reduce((sum,a)=>sum+(ADDONS[a]?.duration||0),0);
  const totalMins=items.length===2&&items.every(it=>it.bookingArrangement==='simultaneous')?Math.max(...items.map(itemDuration)):items.reduce((s,it)=>s+itemDuration(it),0);
  const surcharge=time?calcAH(time,totalMins):0;
  let endStr='';
  if(time){const[h,m]=time.split(':').map(Number);const e=h*60+m+totalMins;endStr=`${String(Math.floor((e%1440)/60)).padStart(2,'0')}:${String(e%60).padStart(2,'0')}`}
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 05'),
    React.createElement('div',{className:'step-title'},'Choose your preferred time'),
    React.createElement('div',{className:'step-sub'},'Select a start time for your session'),
    React.createElement('div',{className:'time-grid'},
      TIMES.map(t=>React.createElement('div',{key:t,className:`time-slot${time===t?' selected':''}`,onClick:()=>setTime(t)},
        t,
        parseInt(t)>=21&&React.createElement('div',{className:'time-slot-note'},'After hours')
      ))
    ),
    surcharge>0&&React.createElement('div',{className:'ah-notice'},
      React.createElement('span',null,'🌙'),
      React.createElement('div',null,
        React.createElement('div',{style:{fontWeight:500,marginBottom:2}},'After-hours surcharge: R'+surcharge),
        React.createElement('div',{style:{opacity:.75,fontSize:11}},'Session ends at '+endStr+' — past 21:00')
      )
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!time,onClick:onNext,style:{flex:1}},'Continue')
    )
  );
}

function S6Address({addr,setAddr,onNext,onBack}){
  const set=k=>e=>setAddr(a=>({...a,[k]:e.target.value}));
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 06'),
    React.createElement('div',{className:'step-title'},'Where shall we come to you?'),
    React.createElement('div',{className:'step-sub'},'Share your contact and service location'),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Full Name'),
      React.createElement('input',{className:'input',autoComplete:'name',placeholder:'Your full name',value:addr.name,onChange:set('name')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Street Address'),
      React.createElement('input',{className:'input',autoComplete:'street-address',placeholder:'12 Luxury Lane',value:addr.street,onChange:set('street')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Suburb'),
      React.createElement('input',{className:'input',autoComplete:'address-level2',placeholder:'Camps Bay',value:addr.suburb,onChange:set('suburb')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Access Notes (optional)'),
      React.createElement('textarea',{className:'input',placeholder:'Gate code, parking, estate access, buzzer…',value:addr.notes,onChange:set('notes')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Additional Notes (optional)'),
      React.createElement('textarea',{className:'input',placeholder:'Anything else we should know about your booking or preferences?',value:addr.additionalNotes,onChange:set('additionalNotes')})
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!addr.name.trim()||!addr.street.trim()||!addr.suburb.trim(),onClick:onNext,style:{flex:1}},'Review Booking')
    )
  );
}
function S7Summary({intent,cat,date,time,addr,items,baseTotal,ahFee,final,corp,event,simultaneousStaffingPremium,onNext,onBack}){
  const itemDuration=it=>((parseInt(it.duration)||60)*(it.serviceId==='couples'&&(it.therapistCount||1)===1?2:1))+it.addons.reduce((sum,a)=>sum+(ADDONS[a]?.duration||0),0);
  const totalMins=items.length===2&&items.every(it=>it.bookingArrangement==='simultaneous')?Math.max(...items.map(itemDuration)):items.reduce((s,it)=>s+itemDuration(it),0);
  const isCorp=cat==='corporate';
  const isQuote=isCorp||cat==='events';
  const simultaneousIndividual=items.length===2&&items.every(it=>it.bookingArrangement==='simultaneous');
  const therapists=simultaneousIndividual?items.reduce((sum,it)=>sum+(it.therapistCount||1),0):items.reduce((max,it)=>Math.max(max,it.therapistCount||1),0);
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 07'),
    React.createElement('div',{className:'step-title'},'Review your booking'),
    React.createElement('div',{className:'step-sub'},'Confirm every detail before we proceed'),
    React.createElement('div',{className:'panel'},
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}},
        [['Intent',INTENTS.find(i=>i.id===intent)?.label],['Category',CATEGORIES.find(c=>c.id===cat)?.label],['Date',fmtDate(date)],['Time',time]].map(([l,v])=>
          React.createElement('div',{key:l},React.createElement('div',{className:'summ-label'},l),React.createElement('div',{className:'summ-val'},v))
        )
      ),
      React.createElement('div',{style:{marginBottom:20}},
        React.createElement('div',{className:'summ-label'},'Booking Contact'),
        React.createElement('div',{className:'summ-val'},addr.name),
        React.createElement('div',{className:'summ-label',style:{marginTop:12}},'Service Address'),
        React.createElement('div',{className:'summ-val'},addr.street+', '+addr.suburb),
        addr.notes&&React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)',marginTop:4}},'Access: '+addr.notes),
        addr.additionalNotes&&React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)',marginTop:4}},'Additional notes: '+addr.additionalNotes)
      ),
      React.createElement('div',{style:{height:1,background:'var(--navy-border)',margin:'0 0 16px'}}),
      !isQuote&&React.createElement('div',{className:'summ-label',style:{marginBottom:8}},'Services'),
      !isQuote&&items.map(it=>{
        const adds=it.addons.map(a=>ADDONS[a]?.name).filter(Boolean);
        return React.createElement('div',{key:it.id,className:'summ-row'},
          React.createElement('div',null,
            React.createElement('div',{className:'summ-row-name'},(it.label?it.label+' — ':'')+SERVICES[it.serviceId]?.name),
            React.createElement('div',{className:'summ-row-detail'},it.duration+' min'+(adds.length?' · '+adds.map(a=>a+' (+'+(ADDONS[it.addons.find(id=>ADDONS[id]?.name===a)]?.duration||0)+' min)').join(', '):''))
          ),
          React.createElement('div',{className:'summ-row-price'},'R '+it.price.toLocaleString())
        );
      }),
      !isQuote&&simultaneousStaffingPremium>0&&React.createElement('div',{className:'summ-row'},
        React.createElement('div',null,
          React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)'}},'Simultaneous Staffing Premium'),
          React.createElement('div',{style:{fontSize:11,color:'var(--cream-dim)',marginTop:3}},'Additional therapist staffing required to treat both guests at the same time')
        ),
        React.createElement('div',{className:'summ-row-price'},'R '+simultaneousStaffingPremium.toLocaleString())
      ),
      !isQuote&&React.createElement('div',null,
        React.createElement('div',{className:'summ-row'},
          React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)'}},'Therapists Required'),
          React.createElement('div',{style:{fontSize:13,color:'var(--cream)'}},therapists)
        ),
        React.createElement('div',{className:'summ-row'},
          React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)'}},'Estimated Treatment Time'),
          React.createElement('div',{style:{fontSize:13,color:'var(--cream)'}},totalMins+' min')
        ),
        React.createElement('div',{className:'summ-row'},
          React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)'}},'Base Total'),
          React.createElement('div',{style:{fontSize:14,color:'var(--cream)'}},'R '+baseTotal.toLocaleString())
        ),
        ahFee>0&&React.createElement('div',{className:'summ-row'},
          React.createElement('div',{style:{fontSize:13,color:'var(--blush)'}},'After-Hours Fee'),
          React.createElement('div',{style:{fontSize:14,color:'var(--blush)'}},'R '+ahFee.toLocaleString())
        ),
        React.createElement('div',{className:'summ-total'},
          React.createElement('div',{className:'summ-total-label'},'Your Investment'),
          React.createElement('div',{className:'summ-total-val'},'R '+final.toLocaleString())
        )
      ),
      cat==='events'&&React.createElement('div',{className:'info-box',style:{marginTop:12}},
        React.createElement('div',{style:{fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--blush)',marginBottom:4}},'Event Enquiry'),
        React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)',lineHeight:1.7}},event.eventType+' · '+event.attendees+' guests · '+event.location+(event.contact?' · Contact: '+event.contact:'')+(event.notes?' · '+event.notes:'')+'. Our concierge will prepare a tailored quote.')
      ),
      isCorp&&React.createElement('div',{className:'info-box',style:{marginTop:12}},
        React.createElement('div',{style:{fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--blush)',marginBottom:4}},'Corporate Quote'),
        React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)'}},'A personalised quote will be crafted for '+corp.company+' · '+corp.attendees+' attendees · '+corp.location)
      )
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',onClick:onNext,style:{flex:1}},'Continue to WhatsApp')
    )
  );
}

function S8Checkout({sendWA,onBack,final,cat}){
  const isQuote=cat==='corporate'||cat==='events';
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 08'),
    React.createElement('div',{className:'step-title'},isQuote?'Your enquiry awaits':'Your experience awaits'),
    React.createElement('div',{className:'step-sub'},isQuote?'Send your details via WhatsApp and our concierge will prepare a tailored quote.':'Send your request via WhatsApp to confirm your booking'),
    React.createElement('div',{className:'info-box',style:{marginBottom:20}},
      React.createElement('div',{className:'summ-label',style:{marginBottom:6}},isQuote?'Next Step':'Final Investment'),
      React.createElement('div',{style:{fontFamily:'var(--serif)',fontSize:isQuote?28:40,fontWeight:300,color:'var(--cream)'}},isQuote?'Personalised quote':'R '+final.toLocaleString()),
      React.createElement('div',{style:{fontSize:11,color:'var(--cream-dim)',marginTop:6}},isQuote?'Pricing and arrangements will be confirmed by our concierge.':'Subject to therapist availability confirmation')
    ),
    React.createElement('div',{style:{background:'var(--navy-card)',border:'1px solid var(--navy-border)',borderRadius:12,padding:'16px 20px',marginBottom:20,fontSize:13,color:'var(--cream-dim)',lineHeight:1.7}},
      'Tap below to open WhatsApp — your booking details will be pre-filled. Our concierge will confirm availability within 2 hours.'
    ),
    React.createElement('button',{className:'wa-btn',onClick:sendWA},
      '💬  Continue to WhatsApp Booking'
    ),
    React.createElement('div',{style:{textAlign:'center',marginTop:20}},
      React.createElement('button',{className:'btn-ghost',style:{margin:'0 auto'},onClick:onBack},'← Review Summary')
    )
  );
}