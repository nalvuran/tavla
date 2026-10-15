/* ===== Kahvehane: garson, adisyon, kurabiye kesesi ve hesap defteri =====
   Tavla ve dama sayfalarında ortak. Sayfa şunları tanımlar: S (mode, match), cfg (level),
   W, B, nameOf(pl), $(id), sfxClink(). Sayfa en sonda garsonInit('tavla'|'dama') çağırır.
   Para birimi kurabiyedir; gerçek parayla bağı yoktur. */
const MENU=[
  {cat:'Sıcak',items:[['cay','Çay',2],['kahve','Türk kahvesi',5],['nescafe','Neskafe',4],['oralet','Oralet',2],['ihlamur','Ihlamur',3],['sahlep','Sahlep',5]]},
  {cat:'Soğuk',items:[['su','Su',1],['soda','Soda',2],['ayran','Ayran',3],['gazoz','Gazoz',3],['kola','Kola',4],['meyvesuyu','Meyve suyu',4]]},
  {cat:'Yiyecek',items:[['kasarli','Kaşarlı tost',10],['karisik','Karışık tost',12],['simit','Simit',2],['cerez','Çerez tabağı',8]]}
];
const MENU_BY={};MENU.forEach(c=>c.items.forEach(([id,n,p])=>MENU_BY[id]={n,p}));
const money=v=>`${v} kurabiye`;
const ORDER_LIMIT=3;          // oyun başına kişi başı sipariş
const DEBT_LIMIT=30;          // veresiye sınırı
const DAILY=10,WELCOME=50;    // günlük ve ilk açılış ikramı
const TIPS={acemi:0,kalfa:2,usta:5}; // bilgisayarı yenince ocak bahşişi
const GAME_NAMES={tavla:'Tavla',dama:'Dama'};
const paidBy=n=>n==='Sen'?'Sen ödedin':`${n} ödedi`;
let GAME='tavla',ledger=[],ledgerRef=null,ledgerSaving=false,ledgerAgain=false,toastLater='',sheetTab='menu',toastTimer=0;
let wallet={coins:WELCOME,daily:'',started:false},gOrders=[0,0],orderFor=0;

const lsGet=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v;}catch(e){return d;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
const tabKeys=()=>Object.keys(S.tab).filter(k=>S.tab[k]>0&&MENU_BY[k.split(':')[1]]);
const tabTotal=()=>tabKeys().reduce((t,k)=>t+MENU_BY[k.split(':')[1]].p*S.tab[k],0);
const tabCount=()=>tabKeys().reduce((t,k)=>t+S.tab[k],0);
const tabItems=()=>tabKeys().map(k=>{const [pl,id]=k.split(':');return[MENU_BY[id].n,S.tab[k],MENU_BY[id].p,Number(pl)];});
function saveWallet(){lsSet('kahvehane-wallet',wallet);}
function saveTab(){lsSet(GAME+'-tab',{tab:S.tab,orders:gOrders});}
function walletText(){return wallet.coins<0?`Veresiye ${-wallet.coins} kurabiye`:`Cebinde ${wallet.coins} kurabiye`;}
function renderTabSum(){
  const n=tabCount();
  $('tabSum').textContent=(n?`Adisyon ${tabTotal()} · `:'')+walletText();
}
function pageToast(t){
  let el=document.getElementById('ptoast');
  if(!el){el=document.createElement('div');el.id='ptoast';el.setAttribute('role','status');document.body.appendChild(el);}
  el.textContent=t;el.classList.add('on');clearTimeout(pageToast.tm);pageToast.tm=setTimeout(()=>el.classList.remove('on'),3600);
}
function addLedger(e){
  e.at=Date.now();e.game=GAME;e.mode=S.mode;
  ledger.unshift(e);if(ledger.length>200)ledger.length=200;
  saveLedger();
}
async function saveLedger(){
  lsSet('kahvehane-ledger',ledger);
  if(!ledgerRef||(typeof readOnly!=='undefined'&&readOnly))return;
  if(ledgerSaving){ledgerAgain=true;return;}
  ledgerSaving=true;
  try{await ledgerRef.set({entries:ledger});}catch(e){}
  ledgerSaving=false;if(ledgerAgain){ledgerAgain=false;saveLedger();}
}
// pl hesabı öder (masanın tamamı). Beyaz telefonun sahibidir; keseden düşülür.
function payTab(pl,score){
  const total=tabTotal();if(!total)return 0;
  addLedger({type:'tab',total,items:tabItems(),payerName:nameOf(pl),oppName:nameOf(1-pl),score:score||''});
  if(pl===W){wallet.coins-=total;saveWallet();}
  S.tab={};gOrders=[0,0];saveTab();renderSheet();renderTabSum();
  return total;
}
// Maç bitti: bilgisayara karşı kazandıysan ocak ısmarlar, yoksa kaybeden öder.
function settleMatch(champ,score){
  if(S.mode==='ai'&&champ===W){
    const total=tabTotal(),tip=TIPS[(typeof cfg!=='undefined'&&cfg.level)||'kalfa']||0;
    if(!total&&!tip)return null;
    addLedger({type:'ocak',total,tip,items:tabItems(),payerName:'Ocak',oppName:nameOf(W),score:score||''});
    wallet.coins+=tip;saveWallet();
    S.tab={};gOrders=[0,0];saveTab();renderSheet();renderTabSum();
    return{who:'ocak',total,tip,
      text:(total?`Ocak ısmarladı, ${money(total)} hesabın bedava.`:'Ocak tebrik etti.')+(tip?` Üstüne ${money(tip)} bahşiş.`:''),
      short:'Ocak ısmarladı'+(tip?` · +${tip} bahşiş`:'')};
  }
  const loser=1-champ,total=payTab(loser,score);
  if(!total)return null;
  const me=S.mode==='ai'&&loser===W;
  return{who:loser,total,text:me?`Hesabı sen ödedin: ${money(total)}.`:`Hesabı ${nameOf(loser)} ödedi: ${money(total)}.`,
    short:me?`Hesabı sen ödedin: ${money(total)}`:`Hesabı ${nameOf(loser)} ödedi: ${money(total)}`};
}
// Mars yiyen masaya bir tur çay ısmarlar (iki çay).
function marsRound(pl){
  const cost=MENU_BY.cay.p*2;
  addLedger({type:'mars',total:cost,items:[['Çay',2,MENU_BY.cay.p,pl]],payerName:nameOf(pl),oppName:nameOf(1-pl),score:''});
  if(pl===W){wallet.coins-=cost;saveWallet();}
  renderTabSum();sfxClink();
  if(S.mode==='ai')return pl===W?`Mars yedin, masaya bir tur çay ısmarladın (${money(cost)}).`:`Bilgisayar mars yedi, masaya bir tur çay ısmarladı.`;
  return `${nameOf(pl)} mars yedi, masaya bir tur çay ısmarladı (${money(cost)}).`;
}
function resetGameOrders(){gOrders=[0,0];saveTab();}
function toast(t){const el=$('toast');el.textContent=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.textContent='';},2600);}
const ARRIVE=['geliyor!','hemen geliyor.','yolda.','tazesinden geliyor.'];
const who=()=>S.mode==='ai'?W:orderFor;
function canOrder(pl){
  if(wallet.coins<=-DEBT_LIMIT){toast(`Veresiye defterin doldu (${DEBT_LIMIT} kurabiye). Yarın ocakçının ikramıyla açılır.`);return false;}
  if(gOrders[pl]>=ORDER_LIMIT){toast(S.mode==='ai'?`Bu oyunda en fazla ${ORDER_LIMIT} şey söyleyebilirsin.`:`${nameOf(pl)} bu oyunda ${ORDER_LIMIT} siparişini verdi.`);return false;}
  return true;
}
function order(id){
  const pl=who();if(!canOrder(pl))return;
  const k=pl+':'+id;S.tab[k]=Math.min(99,(S.tab[k]||0)+1);gOrders[pl]++;
  sfxClink();
  toast(`${MENU_BY[id].n} ${ARRIVE[Math.floor(Math.random()*ARRIVE.length)]}`);
  saveTab();renderSheet();renderTabSum();
}
function changeQty(k,d){
  const pl=Number(k.split(':')[0]);
  if(d>0&&!canOrder(pl))return;
  const q=(S.tab[k]||0)+d;if(q<=0)delete S.tab[k];else S.tab[k]=Math.min(99,q);
  gOrders[pl]=Math.max(0,gOrders[pl]+(d>0?1:-1));
  saveTab();renderSheet();renderTabSum();
}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function renderSheet(){
  if($('sheet').hidden)return;
  document.querySelectorAll('.tabs button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.tab===sheetTab);if(b.dataset.tab==='tab')b.textContent=tabCount()?`Adisyon (${tabCount()})`:'Adisyon';});
  $('pbMenu').hidden=sheetTab!=='menu';$('pbTab').hidden=sheetTab!=='tab';$('pbLedger').hidden=sheetTab!=='ledger';
  if(sheetTab==='menu'){
    const pb=$('pbMenu');pb.replaceChildren();
    const head=el('div','ghead');
    if(S.mode==='pvp'){
      const seg=el('div','seg');
      for(const pl of [W,B]){const b=el('button','',nameOf(pl));b.type='button';b.setAttribute('aria-pressed',orderFor===pl);b.onclick=()=>{orderFor=pl;renderSheet();};seg.append(b);}
      head.append(el('span','',`Kimin siparişi?`),seg);
    }
    const left=ORDER_LIMIT-gOrders[who()];
    head.append(el('small','',S.mode==='ai'?`Bu oyunda ${left} sipariş hakkın kaldı · ${walletText()}`:`${nameOf(who())}: bu oyunda ${left} sipariş hakkı kaldı`));
    pb.append(head);
    for(const c of MENU){
      pb.append(el('div','cat',c.cat));
      const g=el('div','items');
      for(const [id,n,p] of c.items){
        const b=el('button','item');b.type='button';b.append(el('b','',n),el('span','',money(p)));
        const q=S.tab[who()+':'+id];if(q)b.append(el('i','q',q));
        b.onclick=()=>order(id);b.setAttribute('aria-label',`${n}, ${money(p)}, sipariş ver`);
        g.append(b);
      }
      pb.append(g);
    }
  }else if(sheetTab==='tab'){
    const pb=$('pbTab');pb.replaceChildren();
    const slip=el('div','slip');
    slip.append(el('h3','','Adisyon'));
    const d=new Date();
    slip.append(el('div','meta',`${GAME_NAMES[GAME]} masası: ${nameOf(W)} – ${nameOf(B)} · ${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}`));
    const keys=tabKeys();
    if(!keys.length)slip.append(el('p','empty','Henüz bir şey söylenmedi. Menüden sipariş ver.'));
    for(const k of keys){
      const [pl,id]=k.split(':'),it=MENU_BY[id];
      const r=el('div','row');
      r.append(el('span','',S.mode==='pvp'?`${nameOf(Number(pl))} · ${it.n}`:it.n));
      const q=el('span','qty');const mn=el('button','','−');mn.type='button';mn.setAttribute('aria-label',`${it.n} azalt`);mn.onclick=()=>changeQty(k,-1);
      const pls=el('button','','+');pls.type='button';pls.setAttribute('aria-label',`${it.n} artır`);pls.onclick=()=>changeQty(k,1);
      q.append(mn,el('span','',`${S.tab[k]}×`),pls);r.append(q,el('span','amt',money(it.p*S.tab[k])));slip.append(r);
    }
    const t=el('div','tot');t.append(el('span','','Toplam'),el('span','',money(tabTotal())));slip.append(t);
    const tip=TIPS[(typeof cfg!=='undefined'&&cfg.level)||'kalfa']||0;
    slip.append(el('div','foot',S.mode==='ai'?`Maçı kaybedersen hesabı sen ödersin. Kazanırsan ocak ısmarlar${tip?`, üstüne ${money(tip)} bahşiş verir`:''}.`:'Maçı kaybeden hesabın tamamını öder.'));
    slip.append(el('div','foot',walletText()));
    pb.append(slip);
  }else{
    const pb=$('pbLedger');pb.replaceChildren();
    const sums=el('div','sums');
    const w=el('div');w.append(el('small','',wallet.coins<0?'Veresiye defterin':'Cebinde'),el('b','',money(Math.abs(wallet.coins))));sums.append(w);
    const by=new Map();
    for(const e of ledger){if(e.type==='ocak')continue;const n=e.payerName||'Oyuncu';by.set(n,(by.get(n)||0)+e.total);}
    for(const [n,t] of [...by.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3)){const c=el('div');c.append(el('small','',n==='Sen'?'Senin ödediğin':`${n} ödedi`),el('b','',money(t)));sums.append(c);}
    pb.append(sums);
    pb.append(el('p','empty',`Ocakçı her gün ${DAILY} kurabiye ikram eder. Kurabiye biterse hesap veresiyeye yazılır.`));
    if(!ledger.length)pb.append(el('p','empty','Henüz kapanmış bir hesap yok. Maç bitince kaybeden öder ve buraya yazılır.'));
    for(const e of ledger){
      const row=el('div','led');const t=el('div','t');
      if(e.type==='ocak')t.append(el('span','','Ocak ısmarladı'),el('b','',e.tip?`+${e.tip} bahşiş`:money(e.total)));
      else if(e.type==='mars')t.append(el('span','',e.payerName==='Sen'?'Mars çayını sen ısmarladın':`${e.payerName} mars çayı ısmarladı`),el('b','',money(e.total)));
      else t.append(el('span','',paidBy(e.payerName)),el('b','',money(e.total)));
      row.append(t);
      const dt=new Date(e.at),gname=GAME_NAMES[e.game]?GAME_NAMES[e.game]+' · ':'';
      const vs=e.type==='ocak'?`${e.oppName} – Bilgisayar`:`${e.payerName} – ${e.oppName}`;
      row.append(el('small','',`${dt.toLocaleDateString('tr-TR',{day:'numeric',month:'long'})} · ${gname}${vs}${e.score?' · '+e.score:''}`));
      if(e.items&&e.items.length)row.append(el('small','',e.items.map(([n,q])=>`${q} ${n}`).join(', ')+(e.type==='ocak'&&e.total?` (${money(e.total)} bedava)`:'')));
      pb.append(row);
    }
  }
}
function openSheet(tab){sheetTab=tab||'menu';$('sheet').hidden=false;renderSheet();if(toastLater){toast(toastLater);toastLater='';}$('sheetClose').focus();}
function closeSheet(){$('sheet').hidden=true;$('garsonBtn').focus();if(typeof scheduleAutoRoll==='function')scheduleAutoRoll();}
function garsonInit(game){
  GAME=game;
  const st=document.createElement('style');
  st.textContent=`#ptoast{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translate(-50%,-20px);opacity:0;z-index:30;max-width:min(92vw,460px);background:var(--room);color:var(--ink);border:1px solid var(--brass);border-radius:12px;padding:10px 14px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:opacity .25s,transform .25s;pointer-events:none}
#ptoast.on{opacity:1;transform:translate(-50%,0)}
.ghead{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin-bottom:2px}
.ghead small{color:var(--muted);font-size:12.5px;flex-basis:100%}
.ghead .seg button{font-size:13px;padding:6px 10px}`;
  document.head.appendChild(st);
  // kese
  wallet=Object.assign({coins:WELCOME,daily:'',started:false},lsGet('kahvehane-wallet',{}));
  let hello='';
  if(!wallet.started){wallet.started=true;wallet.coins=WELCOME;wallet.daily=today();hello=`Kahvehaneye hoş geldin! Ocakçı ${WELCOME} kurabiye ikram etti.`;}
  else if(wallet.daily!==today()){const was=wallet.coins;wallet.coins+=DAILY;wallet.daily=today();hello=was<0?`Günaydın! Ocakçının ${DAILY} kurabiyesi veresiyenden düştü.`:`Günaydın! Ocakçı günlük ${DAILY} kurabiyeni ikram etti.`;}
  saveWallet();
  // adisyon ve defter
  const t=lsGet(game+'-tab',{});S.tab={};
  if(t.tab)for(const [k,v] of Object.entries(t.tab))if(k.includes(':')&&MENU_BY[k.split(':')[1]]&&v>0)S.tab[k]=Math.min(99,v|0);
  if(Array.isArray(t.orders))gOrders=[t.orders[0]|0,t.orders[1]|0];
  const lg=lsGet('kahvehane-ledger',[]);if(Array.isArray(lg))ledger=lg.filter(e=>e&&e.type);
  $('garsonBtn').onclick=()=>openSheet('menu');
  $('sheetClose').onclick=closeSheet;$('sheetBg').onclick=closeSheet;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('sheet').hidden)closeSheet();});
  document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{sheetTab=b.dataset.tab;renderSheet();});
  if(hello)setTimeout(()=>pageToast(hello),700);
}
