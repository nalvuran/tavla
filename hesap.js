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
  const H={user:null,ready:false};window.Hesap=H;
  let auth=null,db=null,loaded=false,pushTimer=null;
  const $=id=>document.getElementById(id);
  const lsGet=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v;}catch(e){return d;}};
  const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  const ERR={
    'auth/unauthorized-domain':'Bu adres Firebase’de yetkili değil. Authentication → Ayarlar → Yetkili alan adları’na nalvuran.github.io eklenmeli.',
    'auth/operation-not-allowed':'Google ile giriş Firebase’de açık değil. Authentication → Oturum açma yöntemi → Google açılmalı.',
    'auth/network-request-failed':'İnternet bağlantısı yok gibi görünüyor. Bağlanınca yeniden dene.',
    'permission-denied':'Hesap kaydı reddedildi: Firestore kuralları henüz yayınlanmamış.',
    'failed-precondition':'Firestore veritabanı henüz oluşturulmamış.',
    'not-found':'Firestore veritabanı henüz oluşturulmamış.',
    'unavailable':'Hesap kaydına şu an ulaşılamıyor; oyun bu telefonda kaydetmeye devam ediyor.'
  };
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
        await ref.set({name:u.displayName||'',wallet:local.wallet||null,ledger:local.ledger||[],created:Date.now(),updatedAt:Date.now()});
        loaded=true;
        if(local.wallet&&local.wallet.started)toast(`Hoş geldin! Telefonundaki ${local.wallet.coins} kurabiye hesabına aktarıldı.`);
      }else{
        const d=snap.data()||{};loaded=true;
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
      try{await db.collection('users').doc(H.user.uid).set({name:H.user.displayName||'',wallet:s.wallet,ledger:s.ledger,updatedAt:Date.now()},{merge:true});}
      catch(e){chip('error');}
    },1200);
  };
  function load(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
  async function start(){
    style();chip();
    const a=$('acct');if(a){a.addEventListener('click',onChip);a.addEventListener('keydown',onChip);}
    try{for(const l of LIBS)await load(l);}catch(e){chip('offline');return;}
    try{firebase.initializeApp(CFG);auth=firebase.auth();db=firebase.firestore();}catch(e){chip('offline');return;}
    auth.getRedirectResult().catch(e=>{if(e&&e.code)toast(errText(e));});
    auth.onAuthStateChanged(u=>{
      H.user=u;H.ready=true;loaded=false;chip();names(u);
      if(u)sync(u);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
