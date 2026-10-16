/* ===== Kahvehane: Google ile giriş ve hesap kaydı (Firebase) =====
   Bütün sayfalarda ortak. Sol üstteki hesap kutusu (#acct) giriş düğmesidir.
   Giriş yapınca kurabiye kesesi ve hesap defteri users/{uid} belgesinde saklanır.
   Firebase dosyaları sayfa açıldıktan sonra yüklenir; internet yoksa oyunlar misafir olarak çalışır. */
(function(){
  const CFG={
    apiKey:"AIzaSyBMJXKtPmTpDnDG6jjNa6CP_UszQ0cwTi0",
    authDomain:"kahvehane-7fde4.firebaseapp.com",
    projectId:"kahvehane-7fde4",
    storageBucket:"kahvehane-7fde4.firebasestorage.app",
    messagingSenderId:"222763529701",
    appId:"1:222763529701:web:e8287d901e69d71019eb0c"
  };
  const V='10.12.2';
  const LIBS=['app','auth','firestore'].map(n=>`https://www.gstatic.com/firebasejs/${V}/firebase-${n}-compat.js`);
  const H={user:null,ready:false,db:null,offline:false};window.Hesap=H;
  const subs=[];
  // Giriş durumu değişince haber alacak sayfa kodları (çevrimiçi masa gibi)
  H.on=fn=>{subs.push(fn);if(H.ready||H.offline)try{fn(H.user);}catch(e){}};
  const tell=()=>subs.forEach(fn=>{try{fn(H.user);}catch(e){}});
  let auth=null,db=null,loaded=false,pushTimer=null;
  const $=id=>document.getElementById(id);
  const GLOGO="data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2048%2048%27%3E%3Cpath%20fill%3D%27%23EA4335%27%20d%3D%27M24%209.5c3.54%200%206.71%201.22%209.21%203.6l6.85-6.85C35.9%202.38%2030.47%200%2024%200%2014.62%200%206.51%205.38%202.56%2013.22l7.98%206.19C12.43%2013.72%2017.74%209.5%2024%209.5z%27/%3E%3Cpath%20fill%3D%27%234285F4%27%20d%3D%27M46.98%2024.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58%202.96-2.26%205.48-4.78%207.18l7.73%206c4.51-4.18%207.09-10.36%207.09-17.65z%27/%3E%3Cpath%20fill%3D%27%23FBBC05%27%20d%3D%27M10.53%2028.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92%2016.46%200%2020.12%200%2024c0%203.88.92%207.54%202.56%2010.78l7.97-6.19z%27/%3E%3Cpath%20fill%3D%27%2334A853%27%20d%3D%27M24%2048c6.48%200%2011.93-2.13%2015.89-5.81l-7.73-6c-2.15%201.45-4.92%202.3-8.16%202.3-6.26%200-11.57-4.22-13.47-9.91l-7.98%206.19C6.51%2042.62%2014.62%2048%2024%2048z%27/%3E%3C/svg%3E";
  const lsGet=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v;}catch(e){return d;}};
  const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  const ERR={
    'auth/unauthorized-domain':'Bu adres Firebase’de yetkili değil. Authentication → Ayarlar → Yetkili alan adları’na nalvuran.github.io eklenmeli.',
    'auth/operation-not-allowed':'Google ile giriş Firebase’de açık değil. Authentication → Oturum açma yöntemi → Google açılmalı.',
    'auth/network-request-failed':'İnternet bağlantısı yok gibi görünüyor. Bağlanınca yeniden dene.',
    'permission-denied':'Hesap kaydı reddedildi: Firestore kuralları henüz yayınlanmamış.',
    'failed-precondition':'Firestore veritabanı henüz oluşturulmamış.',
    'not-found':'Firestore veritabanı henüz oluşturulmamış.',
    'invalid-argument':'Hesap kaydı biçimi hatalı; sayfayı yenileyip yeniden dene.',
    'unavailable':'Hesap kaydına şu an ulaşılamıyor; oyun bu telefonda kaydetmeye devam ediyor.'
  };
  // Firestore iç içe listeleri ve boş (undefined) alanları kabul etmez; kese ve defter metin olarak saklanır
  const pack=(wallet,ledger)=>({wallet:wallet?JSON.parse(JSON.stringify(wallet)):null,ledgerJson:JSON.stringify(ledger||[])});
  const unpack=d=>{let ledger=[];try{ledger=d.ledgerJson?JSON.parse(d.ledgerJson):(Array.isArray(d.ledger)?d.ledger:[]);}catch(e){}return{wallet:d.wallet||null,ledger};};
  const errText=e=>ERR[e&&e.code]||`Bir sorun çıktı (${(e&&e.code)||'bilinmiyor'}).`;
  function toast(t){
    if(typeof pageToast==='function'){pageToast(t);return;}
    let el=$('htoast');
    if(!el){el=document.createElement('div');el.id='htoast';el.setAttribute('role','status');document.body.appendChild(el);}
    el.textContent=t;el.classList.add('on');clearTimeout(toast.tm);toast.tm=setTimeout(()=>el.classList.remove('on'),4200);
  }
  function style(){
    const st=document.createElement('style');
    st.textContent=`#acct{cursor:pointer}
#acct:focus-visible{outline:2px solid var(--brass);outline-offset:2px}
#acct.guest span{color:var(--brass)}
#acct.guest img{background:#fff;padding:4px;box-sizing:border-box;border-radius:50%}
#htoast{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translate(-50%,-20px);opacity:0;z-index:50;max-width:min(92vw,460px);background:var(--room);color:var(--ink);border:1px solid var(--brass);border-radius:12px;padding:10px 14px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:opacity .25s,transform .25s;pointer-events:none}
#htoast.on{opacity:1;transform:translate(-50%,0)}
.hsheet{position:fixed;inset:0;z-index:45;display:flex;align-items:flex-end;justify-content:center}
.hsheet[hidden]{display:none!important}
.hsheet .bg{position:absolute;inset:0;background:rgba(5,10,22,.6)}
.hsheet .pn{position:relative;width:100%;max-width:460px;background:var(--room);color:var(--ink);border:1px solid var(--line);border-bottom:0;border-radius:18px 18px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:12px;box-shadow:0 -10px 40px rgba(0,0,0,.5)}
.hsheet .me{display:flex;align-items:center;gap:12px}
.hsheet .me img{width:48px;height:48px;border-radius:50%;flex:none}
.hsheet .me b{display:block;font-size:17px}
.hsheet .me small{color:var(--muted);font-size:13px}
.hsheet p{margin:0;color:var(--muted);font-size:14px}
.hsheet .row{display:flex;gap:8px}
.hsheet .row button{flex:1;font:inherit;font-weight:600;font-size:15px;border-radius:10px;padding:12px 8px;cursor:pointer;border:1px solid var(--line);background:var(--room-2);color:var(--ink)}
.hsheet .row button.pri{background:var(--brass);border-color:var(--brass);color:var(--brass-ink)}`;
    document.head.appendChild(st);
  }
  function chip(state){
    const a=$('acct');if(!a)return;
    a.setAttribute('role','button');a.tabIndex=0;
    const u=H.user;
    a.classList.toggle('guest',!u);
    if(u){
      $('who').textContent=u.displayName||u.email||'Hesabın';
      $('whoSub').textContent=state==='saving'?'Hesabına kaydediliyor':state==='error'?'Kayıt şu an yapılamıyor':'Hesabın kayıtlı';
      if(u.photoURL&&$('avatar'))$('avatar').src=u.photoURL;
      a.setAttribute('aria-label',`${u.displayName||'Hesabın'}, hesap menüsü`);
    }else{
      $('who').textContent='Misafir';
      $('whoSub').textContent=state==='offline'?'Giriş için internet gerekli':'Google ile giriş yap';
      if($('avatar'))$('avatar').src=GLOGO;
      a.setAttribute('aria-label','Google ile giriş yap');
    }
  }
  function names(u){
    const first=((u&&u.displayName)||'').trim().split(/\s+/)[0]||'';
    try{if(typeof myName!=='undefined')myName=first;}catch(e){}
    try{if(typeof cfg!=='undefined'&&first&&!cfg.p1)cfg.p1=first;}catch(e){}
    const g=$('greet');
    if(g&&first&&!g.dataset.named){
      const rest=g.textContent.replace(/^Hoş geldin[^.]*\.\s*/,'');
      g.textContent='';g.append('Hoş geldin, ');const b=document.createElement('b');b.textContent=first;g.append(b,'. '+rest);g.dataset.named='1';
    }
    try{if(typeof render==='function')render();}catch(e){}
  }
  async function signIn(){
    if(!auth){toast('Giriş için internet gerekli.');return;}
    const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
    try{await auth.signInWithPopup(p);}
    catch(e){
      if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/web-storage-unsupported'].includes(e.code)){
        try{await auth.signInWithRedirect(p);}catch(e2){toast(errText(e2));}
      }else if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')toast(errText(e));
    }
  }
  H.signIn=signIn;
  function menu(){
    let m=$('hsheet');
    if(!m){
      m=document.createElement('div');m.id='hsheet';m.className='hsheet';m.hidden=true;
      m.innerHTML='<div class="bg"></div><div class="pn" role="dialog" aria-modal="true" aria-label="Hesap"><div class="me"><img alt=""><div><b></b><small></small></div></div><p>Kurabiye kesen ve hesap defterin bu hesaba kayıtlı. Başka telefonda aynı Google hesabıyla girersen hepsi gelir.</p><div class="row"><button type="button" class="out">Çıkış yap</button><button type="button" class="pri close">Kapat</button></div></div>';
      document.body.appendChild(m);
      const close=()=>{m.hidden=true;$('acct')&&$('acct').focus();};
      m.querySelector('.bg').onclick=close;m.querySelector('.close').onclick=close;
      m.querySelector('.out').onclick=async()=>{close();try{await auth.signOut();toast('Hesaptan çıktın. Bu telefonda misafir olarak devam ediyorsun.');}catch(e){toast(errText(e));}};
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)close();});
    }
    const u=H.user;
    m.querySelector('img').src=u.photoURL||($('avatar')&&$('avatar').src)||'';
    m.querySelector('b').textContent=u.displayName||'Hesabın';
    m.querySelector('small').textContent=u.email||'';
    m.hidden=false;m.querySelector('.close').focus();
  }
  function onChip(e){if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();if(H.user)menu();else signIn();}
  async function sync(u){
    const ref=db.collection('users').doc(u.uid);
    chip('saving');
    try{
      const snap=await ref.get();
      const local=typeof garsonSnapshot==='function'?garsonSnapshot():{wallet:lsGet('kahvehane-wallet',null),ledger:lsGet('kahvehane-ledger',[])};
      if(!snap.exists){
        // ilk giriş: telefondaki kese ve defter hesaba taşınır
        await ref.set(Object.assign({name:u.displayName||'',created:Date.now(),updatedAt:Date.now()},pack(local.wallet,local.ledger)));
        loaded=true;
        if(local.wallet&&local.wallet.started)toast(`Hoş geldin! Telefonundaki ${local.wallet.coins} kurabiye hesabına aktarıldı.`);
      }else{
        const d=unpack(snap.data()||{});loaded=true;
        let hello='';
        if(typeof garsonLoadCloud==='function')hello=garsonLoadCloud(d);
        else{if(d.wallet)lsSet('kahvehane-wallet',d.wallet);if(Array.isArray(d.ledger))lsSet('kahvehane-ledger',d.ledger);}
        if(hello)toast(hello);
      }
      chip();
    }catch(e){chip('error');toast(errText(e));}
  }
  H.push=function(){
    if(!H.user||!loaded||!db||typeof garsonSnapshot!=='function')return;
    clearTimeout(pushTimer);
    pushTimer=setTimeout(async()=>{
      const s=garsonSnapshot();
      try{await db.collection('users').doc(H.user.uid).set(Object.assign({name:H.user.displayName||'',updatedAt:Date.now()},pack(s.wallet,s.ledger)),{merge:true});}
      catch(e){chip('error');}
    },1200);
  };
  function load(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
  async function start(){
    style();chip();
    const a=$('acct');if(a){a.addEventListener('click',onChip);a.addEventListener('keydown',onChip);}
    try{for(const l of LIBS)await load(l);}catch(e){chip('offline');H.offline=true;tell();return;}
    try{firebase.initializeApp(CFG);auth=firebase.auth();db=firebase.firestore();H.db=db;}catch(e){chip('offline');H.offline=true;tell();return;}
    auth.getRedirectResult().catch(e=>{if(e&&e.code)toast(errText(e));});
    auth.onAuthStateChanged(u=>{
      H.user=u;H.ready=true;loaded=false;chip();names(u);
      if(u)sync(u);
      tell();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
