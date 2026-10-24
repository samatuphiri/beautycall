import React, { useState, useMemo } from 'react';
import './KaniBookingConfigurator.css';

const SERVICES={
  swedish:{id:'swedish',name:'Swedish',description:'Gentle flowing strokes for relaxation.',durations:{60:750,90:950,120:1150}},
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
  couples:{id:'couples',name:'Couples Massage',description:'A shared massage experience.',durations:{60:1400,90:1800,120:2200},simultaneousDurations:{60:1900,90:2300,120:2700}},
  royalty:{id:'royalty',name:'Royalty Massage',description:'Four-handed signature luxury experience.',durations:{60:2000,90:2900,120:3700}},
};

const ADDONS={
  facialMassage:{id:'facialMassage',name:'Facial Massage',price:150},
  headMassage:{id:'headMassage',name:'Head Massage',price:150},
  facialHeadMassage:{id:'facialHeadMassage',name:'Facial + Head Massage',price:250},
  bodyExfoliation:{id:'bodyExfoliation',name:'Body Exfoliation',price:350},
  bodyWrap:{id:'bodyWrap',name:'Body Wrap + Exfoliation',price:450},
  footSoak:{id:'footSoak',name:'Foot Soak & Scrub',price:300},
};

const SURCHARGES={afterHoursStart:21,feePerHour:150};
const INTENTS=[
  {id:'relaxation',label:'Relaxation',desc:'Melt away the day, restore calm'},
  {id:'painRelief',label:'Pain Relief',desc:'Targeted care for aches and tension'},
  {id:'recovery',label:'Recovery',desc:'Restore and perform at your best'},
  {id:'luxury',label:'Luxury Indulgence',desc:'A curated experience of pure opulence'},
];
const CATEGORIES=[
  {id:'individual',label:'Individual & Couples',desc:'Bespoke sessions for one or two'},
  {id:'group',label:'Group & Events',desc:'Wellness experiences for gatherings'},
  {id:'corporate',label:'Corporate Wellness',desc:'Employee wellbeing programs'},
];
const EVENT_TYPES=['Family Gathering','Bridal Event','Birthday Celebration','Wellness Party','Other'];
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
  const[intent,setIntent]=useState(null);
  const[cat,setCat]=useState(null);
  const[items,setItems]=useState([]);
  const[date,setDate]=useState(null);
  const[time,setTime]=useState(null);
  const[addr,setAddr]=useState({street:'',suburb:'',notes:''});
  const[group,setGroup]=useState({adults:2,children:0,eventType:''});
  const[corp,setCorp]=useState({company:'',contact:'',attendees:2,eventType:'',location:''});
  const N=8;
  const totalMins=useMemo(()=>items.reduce((s,it)=>s+(parseInt(it.duration)||60),0),[items]);
  const baseTotal=useMemo(()=>items.reduce((s,it)=>s+it.price,0),[items]);
  const ahFee=useMemo(()=>time?calcAH(time,totalMins):0,[time,totalMins]);
  const final=baseTotal+ahFee;
  const next=()=>setStep(s=>Math.min(s+1,N-1));
  const back=()=>setStep(s=>Math.max(s-1,0));
  const addItem=it=>setItems(p=>[...p,{...it,id:uuid()}]);
  const rmItem=id=>setItems(p=>p.filter(x=>x.id!==id));

  function sendWA(){
    const therapists=items.reduce((s,it)=>s+(it.therapistCount||1),0);
    const lines=items.map(it=>{
      const adds=it.addons.map(a=>ADDONS[a]?.name).filter(Boolean);
      return`  - ${it.label?it.label+' — ':''}${SERVICES[it.serviceId]?.name} (${it.duration}min)${adds.length?' + '+adds.join(', '):''}  R${it.price}`;
    }).join('\n');
    const msg=`New Booking Request – BeautyCall\n\nIntent: ${INTENTS.find(i=>i.id===intent)?.label}\nCategory: ${CATEGORIES.find(c=>c.id===cat)?.label}\nDate: ${fmtDate(date)}\nTime: ${time}\nAddress: ${addr.street}, ${addr.suburb}\n\nServices:\n${lines}\n\nTherapists Required: ${therapists}\nBase Total: R${baseTotal}\nAfter-Hours Fee: R${ahFee}\nFinal Investment: R${final}\n\nNotes: ${addr.notes||'None'}`;
    window.open(`https://wa.me/27624771887?text=${encodeURIComponent(msg)}`,'_blank');
  }

  return React.createElement('div',{className:'kani-booking-root wrap'},
    React.createElement('div',{className:'site-header'},
      React.createElement('div',{className:'site-logo'},'BeautyCall'),
      React.createElement('div',{className:'site-sub'},'Mobile Massage Therapy')
    ),
    React.createElement('div',{className:'progress-wrap'},
      React.createElement('div',{className:'progress-track'},React.createElement('div',{className:'progress-fill',style:{width:(step/(N-1)*100)+'%'}})),
      React.createElement('div',{className:'step-dots'},Array.from({length:N},(_,i)=>React.createElement('div',{key:i,className:`step-dot${i===step?' active':i<step?' done':''}`})))
    ),
    step===0&&React.createElement(S1Intent,{intent,setIntent,onNext:next}),
    step===1&&React.createElement(S2Category,{cat,setCat,onNext:next,onBack:back}),
    step===2&&React.createElement(S3Builder,{cat,items,addItem,rmItem,group,setGroup,corp,setCorp,onNext:next,onBack:back}),
    step===3&&React.createElement(S4Date,{date,setDate,onNext:next,onBack:back}),
    step===4&&React.createElement(S5Time,{time,setTime,items,onNext:next,onBack:back}),
    step===5&&React.createElement(S6Address,{addr,setAddr,onNext:next,onBack:back}),
    step===6&&React.createElement(S7Summary,{intent,cat,date,time,addr,items,baseTotal,ahFee,final,corp,onNext:next,onBack:back}),
    step===7&&React.createElement(S8Checkout,{sendWA,onBack:back,final})
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
    React.createElement('button',{className:'btn-primary',disabled:!intent,onClick:onNext},'Continue')
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

function S3Builder({cat,items,addItem,rmItem,group,setGroup,corp,setCorp,onNext,onBack}){
  if(cat==='corporate')return React.createElement(CorpBuilder,{corp,setCorp,onNext,onBack});
  if(cat==='group')return React.createElement(GroupBuilder,{group,setGroup,addItem,items,onNext,onBack});
  return React.createElement(IndivBuilder,{items,addItem,rmItem,onNext,onBack});
}

function IndivBuilder({items,addItem,rmItem,onNext,onBack}){
  const[sel,setSel]=useState('deepTissue');
  const[dur,setDur]=useState(90);
  const[addons,setAddons]=useState([]);
  const[simul,setSimul]=useState(true);
  const[btnState,setBtnState]=useState('idle');
  const svc=SERVICES[sel];
  const durs=Object.keys(svc.durations).map(Number);
  const price=calcPrice(sel,dur,addons,sel==='couples'&&simul);

  function selectSvc(id){
    setSel(id);
    const keys=Object.keys(SERVICES[id].durations).map(Number);
    if(!keys.includes(dur))setDur(keys[1]||keys[0]);
    setAddons([]);
  }
  function toggleAddon(id){
    const faceHead=['facialMassage','headMassage','facialHeadMassage'];
    setAddons(p=>{
      if(p.includes(id))return p.filter(a=>a!==id);
      const remaining=faceHead.includes(id)?p.filter(a=>!faceHead.includes(a)):p;
      return [...remaining,id];
    });
  }
  function handleAdd(){
    const isR=sel==='royalty',isC=sel==='couples';
    const tc=isR?2:(isC?(simul?2:1):1);
    addItem({serviceId:sel,duration:dur,addons:[...addons],price,therapistCount:tc,simultaneous:isC&&simul});
    setAddons([]);setBtnState('added');
    setTimeout(()=>setBtnState('idle'),1400);
  }

  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 03'),
    React.createElement('div',{className:'step-title'},'Build your experience'),
    React.createElement('div',{className:'step-sub'},'Select services, duration and enhancements'),
    React.createElement('div',{className:'svc-carousel'},
      React.createElement('button',{type:'button',className:'svc-nav svc-nav-prev','aria-label':'Scroll services left',onClick:()=>document.getElementById('kani-service-scroll')?.scrollBy({left:-240,behavior:'smooth'})},'‹'),
      React.createElement('div',{className:'svc-scroll',id:'kani-service-scroll',tabIndex:0,'aria-label':'Available massage services',role:'region'},
        React.createElement('div',{className:'svc-row'},
          Object.values(SERVICES).map(s=>React.createElement('button',{type:'button',key:s.id,className:`svc-chip${sel===s.id?' active':''}`,onClick:()=>selectSvc(s.id)},s.name))
        )
      ),
      React.createElement('button',{type:'button',className:'svc-nav svc-nav-next','aria-label':'Scroll services right',onClick:()=>document.getElementById('kani-service-scroll')?.scrollBy({left:240,behavior:'smooth'})},'›')
    ),
    React.createElement('div',{className:'panel'},
      sel==='royalty'&&React.createElement('div',{className:'luxury-tag'},'✦ 4-Handed Signature Experience'),
      React.createElement('div',{className:'panel-title'},svc.name),
      React.createElement('div',{className:'panel-desc'},svc.description),
      React.createElement('span',{className:'field-label'},'Duration'),
      React.createElement('div',{className:'dur-row'},
        durs.map(d=>React.createElement('button',{key:d,className:`dur-btn${dur===d?' active':''}`,onClick:()=>setDur(d),style:{position:'relative'}},
          d===90&&React.createElement('span',{className:'pop-badge'},'Popular'),
          d+' min'
        ))
      ),
      sel==='couples'&&React.createElement('div',null,
        React.createElement('span',{className:'field-label'},'Arrangement'),
        React.createElement('div',{className:'toggle-row'},
          React.createElement('div',{className:`toggle-opt${simul?' active':''}`,onClick:()=>setSimul(true)},
            React.createElement('div',{className:'toggle-opt-title'},'Simultaneous'),
            React.createElement('div',{className:'toggle-opt-sub'},'2 therapists')
          ),
          React.createElement('div',{className:`toggle-opt${!simul?' active':''}`,onClick:()=>setSimul(false)},
            React.createElement('div',{className:'toggle-opt-title'},'Sequential'),
            React.createElement('div',{className:'toggle-opt-sub'},'1 therapist')
          )
        )
      ),
      React.createElement('div',{className:'divider'}),
      React.createElement('span',{className:'field-label'},'Enhancement Add-ons'),
      React.createElement('div',{className:'pills-wrap'},
        Object.values(ADDONS).map(a=>React.createElement('button',{key:a.id,className:`pill${addons.includes(a.id)?' active':''}`,onClick:()=>toggleAddon(a.id)},
          a.name+' +R'+a.price
        ))
      ),
      React.createElement('div',{className:'price-row'},
        React.createElement('div',null,
          React.createElement('div',{className:'price-label'},'This service'),
          React.createElement('div',{className:'price-val'},'R '+price.toLocaleString())
        ),
        React.createElement('button',{className:`add-btn${btnState==='added'?' success':''}`,onClick:handleAdd},
          btnState==='added'?'Added ✓':'Add to Experience'
        )
      )
    ),
    items.length>0&&React.createElement('div',{style:{marginBottom:20}},
      React.createElement('span',{className:'field-label',style:{display:'block',marginBottom:8}},'Your experience — '+items.length+' service'+(items.length>1?'s':'')),
      items.map(it=>React.createElement('div',{key:it.id,className:'cart-item'},
        React.createElement('div',{style:{flex:1}},
          React.createElement('div',{className:'cart-name'},SERVICES[it.serviceId]?.name),
          React.createElement('div',{className:'cart-detail'},it.duration+'min'+(it.addons.length?' · '+it.addons.map(a=>ADDONS[a]?.name).join(', '):''))
        ),
        React.createElement('div',{className:'cart-price'},'R '+it.price.toLocaleString()),
        React.createElement('button',{className:'rm-btn',onClick:()=>rmItem(it.id)},'×')
      ))
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:items.length===0,onClick:onNext,style:{flex:1}},'Continue')
    )
  );
}

function GroupBuilder({group,setGroup,addItem,items,onNext,onBack}){
  const[pSvc,setPSvc]=useState({});
  const[pDur,setPDur]=useState({});
  const[pAdd,setPAdd]=useState({});
  const[confirmed,setConfirmed]=useState(false);
  const parts=useMemo(()=>{
    const ps=[];
    for(let i=0;i<group.adults;i++)ps.push({type:'Adult',num:i+1,key:`a${i}`});
    for(let i=0;i<group.children;i++)ps.push({type:'Child',num:i+1,key:`c${i}`});
    return ps;
  },[group.adults,group.children]);
  const getSvc=k=>pSvc[k]||'swedish';
  const getDur=k=>{const keys=Object.keys(SERVICES[getSvc(k)].durations).map(Number);const d=pDur[k];return d&&keys.includes(d)?d:keys[1]||keys[0]};
  const getAdd=k=>pAdd[k]||[];
  const toggleA=(k,id)=>setPAdd(p=>{
    const current=p[k]||[];
    if(current.includes(id))return {...p,[k]:current.filter(a=>a!==id)};
    const faceHead=['facialMassage','headMassage','facialHeadMassage'];
    const remaining=faceHead.includes(id)?current.filter(a=>!faceHead.includes(a)):current;
    return {...p,[k]:[...remaining,id]};
  });
  const groupTotal=parts.reduce((s,p)=>s+calcPrice(getSvc(p.key),getDur(p.key),getAdd(p.key),false),0);
  function confirm(){
    parts.forEach(p=>{const sid=getSvc(p.key),d=getDur(p.key),a=getAdd(p.key);addItem({serviceId:sid,duration:d,addons:a,price:calcPrice(sid,d,a,false),therapistCount:1,label:`${p.type} ${p.num}`,id:uuid()})});
    setConfirmed(true);
  }
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 03'),
    React.createElement('div',{className:'step-title'},'Group & Event Planning'),
    React.createElement('div',{className:'step-sub'},'Curate a unique experience for each guest'),
    !confirmed&&React.createElement('div',null,
      React.createElement('div',{className:'pills-wrap'},EVENT_TYPES.map(e=>React.createElement('button',{key:e,className:`pill${group.eventType===e?' active':''}`,onClick:()=>setGroup(g=>({...g,eventType:e}))},e))),
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}},
        React.createElement('div',null,
          React.createElement('span',{className:'field-label'},'Adults'),
          React.createElement('div',{className:'stepper'},
            React.createElement('button',{className:'stp-btn',onClick:()=>setGroup(g=>({...g,adults:Math.max(0,g.adults-1)}))},'−'),
            React.createElement('div',{className:'stp-val'},group.adults),
            React.createElement('button',{className:'stp-btn',onClick:()=>setGroup(g=>({...g,adults:g.adults+1}))},'＋')
          )
        ),
        React.createElement('div',null,
          React.createElement('span',{className:'field-label'},'Children'),
          React.createElement('div',{className:'stepper'},
            React.createElement('button',{className:'stp-btn',onClick:()=>setGroup(g=>({...g,children:Math.max(0,g.children-1)}))},'−'),
            React.createElement('div',{className:'stp-val'},group.children),
            React.createElement('button',{className:'stp-btn',onClick:()=>setGroup(g=>({...g,children:g.children+1}))},'＋')
          )
        )
      ),
      parts.length>0&&React.createElement('div',null,
        parts.map(p=>React.createElement('div',{key:p.key,className:'p-card'},
          React.createElement('div',{className:'p-head'},
            React.createElement('div',{className:'p-name'},p.type+' '+p.num),
            React.createElement('div',{className:'p-price'},'R '+calcPrice(getSvc(p.key),getDur(p.key),getAdd(p.key),false).toLocaleString())
          ),
          React.createElement('select',{className:'input',style:{marginBottom:8},value:getSvc(p.key),onChange:e=>setPSvc(prev=>({...prev,[p.key]:e.target.value}))},
            Object.values(SERVICES).map(s=>React.createElement('option',{key:s.id,value:s.id},s.name))
          ),
          React.createElement('div',{style:{display:'flex',gap:6,marginBottom:8}},
            Object.keys(SERVICES[getSvc(p.key)].durations).map(d=>React.createElement('button',{key:d,className:`dur-btn${getDur(p.key)===Number(d)?' active':''}`,onClick:()=>setPDur(prev=>({...prev,[p.key]:Number(d)}))},d+'m'))
          ),
          React.createElement('div',{className:'pills-wrap',style:{marginBottom:0}},
            Object.values(ADDONS).map(a=>React.createElement('button',{key:a.id,className:`pill${getAdd(p.key).includes(a.id)?' active':''}`,style:{fontSize:11,padding:'5px 12px'},onClick:()=>toggleA(p.key,a.id)},a.name))
          )
        )),
        React.createElement('div',{className:'price-row',style:{marginTop:8}},
          React.createElement('div',null,
            React.createElement('div',{className:'price-label'},'Group total'),
            React.createElement('div',{className:'price-val'},'R '+groupTotal.toLocaleString())
          ),
          React.createElement('button',{className:'add-btn',onClick:confirm},'Confirm Group')
        )
      )
    ),
    confirmed&&React.createElement('div',{className:'info-box'},
      React.createElement('div',{style:{fontSize:13,color:'var(--blush)',marginBottom:4,letterSpacing:'0.08em',textTransform:'uppercase'}},'Group confirmed'),
      React.createElement('div',{style:{fontFamily:'var(--serif)',fontSize:22,color:'var(--cream)',fontWeight:300}},parts.length+' participants'),
      React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)',marginTop:4}},'Total: R '+items.reduce((s,it)=>s+it.price,0).toLocaleString())
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!confirmed,onClick:onNext,style:{flex:1}},'Continue')
    )
  );
}

function CorpBuilder({corp,setCorp,onNext,onBack}){
  const set=k=>e=>setCorp(c=>({...c,[k]:e.target.value}));
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 03'),
    React.createElement('div',{className:'step-title'},'Corporate Wellness'),
    React.createElement('div',{className:'step-sub'},"We'll prepare a bespoke quote for your team"),
    [['company','Company Name','Acme Corporation'],['contact','Contact Person','Jane Smith'],['eventType','Event Type','Team day, retreat, wellness week…'],['location','Location / Office','Sandton, Johannesburg']].map(([k,label,ph])=>
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
      React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)',lineHeight:1.6}})
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!corp.company||!corp.contact,onClick:onNext,style:{flex:1}},'Request a Quote')
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
  const totalMins=items.reduce((s,it)=>s+(parseInt(it.duration)||60),0);
  const surcharge=time?calcAH(time,totalMins):0;
  let endStr='';
  if(time){const[h,m]=time.split(':').map(Number);const e=h*60+m+totalMins;endStr=`${String(Math.floor(e/60)).padStart(2,'0')}:${String(e%60).padStart(2,'0')}`}
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
    React.createElement('div',{className:'step-sub'},'Your therapist will arrive at your door'),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Street Address'),
      React.createElement('input',{className:'input',placeholder:'12 Luxury Lane',value:addr.street,onChange:set('street')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Suburb'),
      React.createElement('input',{className:'input',placeholder:'Camps Bay',value:addr.suburb,onChange:set('suburb')})
    ),
    React.createElement('div',{className:'field-group'},
      React.createElement('label',{className:'field-label'},'Access Notes'),
      React.createElement('textarea',{className:'input',placeholder:'Gate code, parking, estate access, buzzer…',value:addr.notes,onChange:set('notes')})
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',disabled:!addr.street||!addr.suburb,onClick:onNext,style:{flex:1}},'Review Booking')
    )
  );
}

function S7Summary({intent,cat,date,time,addr,items,baseTotal,ahFee,final,corp,onNext,onBack}){
  const isCorp=cat==='corporate';
  const therapists=items.reduce((s,it)=>s+(it.therapistCount||1),0);
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
        React.createElement('div',{className:'summ-label'},'Address'),
        React.createElement('div',{className:'summ-val'},addr.street+', '+addr.suburb),
        addr.notes&&React.createElement('div',{style:{fontSize:12,color:'var(--cream-dim)',marginTop:4}},addr.notes)
      ),
      React.createElement('div',{style:{height:1,background:'var(--navy-border)',margin:'0 0 16px'}}),
      React.createElement('div',{className:'summ-label',style:{marginBottom:8}},'Services'),
      items.map(it=>{
        const adds=it.addons.map(a=>ADDONS[a]?.name).filter(Boolean);
        return React.createElement('div',{key:it.id,className:'summ-row'},
          React.createElement('div',null,
            React.createElement('div',{className:'summ-row-name'},(it.label?it.label+' — ':'')+SERVICES[it.serviceId]?.name),
            React.createElement('div',{className:'summ-row-detail'},it.duration+'min'+(adds.length?' · '+adds.join(', '):''))
          ),
          React.createElement('div',{className:'summ-row-price'},'R '+it.price.toLocaleString())
        );
      }),
      !isCorp&&React.createElement('div',null,
        React.createElement('div',{className:'summ-row'},
          React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)'}},'Therapists Required'),
          React.createElement('div',{style:{fontSize:13,color:'var(--cream)'}},therapists)
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
      isCorp&&React.createElement('div',{className:'info-box',style:{marginTop:12}},
        React.createElement('div',{style:{fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--blush)',marginBottom:4}},'Corporate Quote'),
        React.createElement('div',{style:{fontSize:13,color:'var(--cream-dim)'}},'A personalised quote will be crafted for '+corp.company)
      )
    ),
    React.createElement('div',{className:'nav-row'},
      React.createElement('button',{className:'btn-ghost',onClick:onBack},'← Back'),
      React.createElement('button',{className:'btn-primary',onClick:onNext,style:{flex:1}},'Continue to WhatsApp')
    )
  );
}

function S8Checkout({sendWA,onBack,final}){
  return React.createElement('div',{className:'fx'},
    React.createElement('div',{className:'step-eyebrow'},'Step 08'),
    React.createElement('div',{className:'step-title'},'Your experience awaits'),
    React.createElement('div',{className:'step-sub'},'Send your request via WhatsApp to confirm your booking'),
    React.createElement('div',{className:'info-box',style:{marginBottom:20}},
      React.createElement('div',{className:'summ-label',style:{marginBottom:6}},'Final Investment'),
      React.createElement('div',{style:{fontFamily:'var(--serif)',fontSize:40,fontWeight:300,color:'var(--cream)'}},'R '+final.toLocaleString()),
      React.createElement('div',{style:{fontSize:11,color:'var(--cream-dim)',marginTop:6}},'Subject to therapist availability confirmation')
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
