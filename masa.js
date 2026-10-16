/* ===== Kahvehane: çevrimiçi masa (arkadaşını davet et) =====
   Firestore'da masalar/{numara} belgesi: ev sahibi masayı açar, arkadaşı linkle ya da
   masa numarasıyla oturur. Oyunun durumu belgenin "state" alanında, adisyon "tabs" alanında.
   Sayfa Masa.init(oyun, {onAttach, onDoc, cfg}) çağırır. hesap.js'den sonra yüklenir. */
(function(){
  const M={code:null,side:null,doc:null};window.Masa=M;
  const $=id=>document.getElementById(id);
  const STALE=6*3600*1000; // 6 saat dokunulmayan masa kapanmış sayılır
  const NAMES={tavla:'Tavla',dama:'Dama',okey:'Okey'};
  let GAME='tavla',hooks={},unsub=null,pendingCode=null,tried=false,sheet=null,sheetMode='';
  const ls=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
  const lsSet=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  const KEY=()=>'masa-'+GAME;
  const db=()=>window.Hesap&&Hesap.db;
  const user=()=>window.Hesap&&Hesap.user;
  const ref=code=>db().collection('masalar').doc(code);
  const say=t=>{if(typeof pageToast==='function')pageToast(t);};
  const first=n=>((n||'').trim().split(/\s+/)[0])||'';
  const meObj=()=>{const u=user();return{uid:u.uid,name:u.displayName||'',photo:u.photoURL||''};};
  const fail=t=>{const e=new Error(t);e.user=true;return e;};
  const link=code=>location.origin+location.pathname+'#masa-'+code;

  function style(){
    const st=document.createElement('style');
    st.textContent=`.msheet{position:fixed;inset:0;z-index:44;display:flex;align-items:flex-end;justify-content:center}
.msheet[hidden]{display:none!important}
.msheet .bg{position:absolute;inset:0;background:rgba(5,10,22,.6)}
.msheet .pn{position:relative;width:100%;max-width:460px;background:var(--room);color:var(--ink);border:1px solid var(--line);border-bottom:0;border-radius:18px 18px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:12px;box-shadow:0 -10px 40px rgba(0,0,0,.5)}
.msheet h2{margin:0;font-family:var(--display);font-weight:400;font-size:24px}
.msheet p{margin:0;color:var(--muted);font-size:14px;line-height:1.4}
.msheet .no{display:flex;align-items:baseline;justify-content:center;gap:10px;padding:10px;border:1px dashed var(--brass);border-radius:12px}
.msheet .no small{color:var(--muted);font-size:14px}
.msheet .no b{font-size:40px;letter-spacing:.12em;color:var(--brass);font-variant-numeric:tabular-nums}
.msheet .wait{color:var(--ink);font-size:14px;display:flex;align-items:center;gap:8px}
.msheet .wait i{width:8px;height:8px;border-radius:50%;background:var(--brass);animation:mpulse 1.2s infinite}
@keyframes mpulse{50%{opacity:.25}}
.msheet input{font:inherit;font-size:28px;letter-spacing:.3em;text-align:center;padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--room-2);color:var(--ink);width:100%;box-sizing:border-box}
.msheet input:focus{outline:2px solid var(--brass);outline-offset:1px}
.msheet .err{color:#ff9a8a;min-height:1.2em}
.msheet .row{display:flex;gap:8px}
.msheet .row button{flex:1;font:inherit;font-weight:600;font-size:15px;border-radius:10px;padding:12px 8px;cursor:pointer;border:1px solid var(--line);background:var(--room-2);color:var(--ink)}
.msheet .row button.pri{background:var(--brass);border-color:var(--brass);color:var(--brass-ink)}
.msheet .row button:disabled{opacity:.5;cursor:default}
@media (prefers-reduced-motion:reduce){.msheet .wait i{animation:none}}`;
    document.head.appendChild(st);
  }
  function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
  function btn(text,cls,fn){const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;}
  function open(mode,build){
    if(!sheet){
      sheet=el('div','msheet');sheet.hidden=true;
      sheet.innerHTML='<div class="bg"></div><div class="pn" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(sheet);
      sheet.querySelector('.bg').onclick=()=>{if(sheetMode!=='wait')close();};
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.hidden&&sheetMode!=='wait')close();});
    }
    sheetMode=mode;
    const pn=sheet.querySelector('.pn');pn.replaceChildren();build(pn);
    sheet.hidden=false;
    const f=pn.querySelector('input,button.pri');if(f)f.focus();
  }
  function close(){if(sheet)sheet.hidden=true;sheetMode='';}
  M.close=close;

  // Giriş gerekiyorsa sorar; giriş yapılmışsa true
  function needUser(why){
    if(user()&&db())return true;
    open('login',pn=>{
      pn.append(el('h2','',why||'Arkadaşınla oyna'));
      pn.append(el('p','',window.Hesap&&Hesap.offline?'Çevrimiçi masa için internet gerekli. Bağlanınca yeniden dene.':'Çevrimiçi masada ikiniz de Google ile giriş yapmış olmalısınız. Kurabiye kesen de hesabına kaydedilir.'));
      const r=el('div','row');
      r.append(btn('Vazgeç','',close));
      if(!(window.Hesap&&Hesap.offline))r.append(btn('Google ile giriş yap','pri',()=>{close();Hesap.signIn&&Hesap.signIn();}));
      pn.append(r);
    });
    return false;
  }

  /* ----- Masa açma ----- */
  M.invite=async function(){
    if(M.code){showWait();return;}
    if(!needUser('Arkadaşını davet et'))return;
    open('busy',pn=>{pn.append(el('h2','','Masa açılıyor…'));});
    const me=meObj(),cfg=hooks.cfg?hooks.cfg():{};
    try{
      let code=null;
      for(let i=0;i<12&&!code;i++){
        const c=String(1000+Math.floor(Math.random()*9000));
        await db().runTransaction(async t=>{
          const s=await t.get(ref(c));
          if(s.exists){const d=s.data()||{};if(d.status!=='left'&&(d.updatedAt||0)>Date.now()-STALE)return;}
          t.set(ref(c),{game:GAME,host:me,guest:null,status:'waiting',cfg,state:null,tabs:{},leftBy:null,createdAt:Date.now(),updatedAt:Date.now()});
          code=c;
        });
      }
      if(!code)throw fail('Boş masa bulunamadı, birazdan yeniden dene.');
      attach(code,0);
      showWait();
    }catch(e){showError('Masa açılamadı',e);}
  };
  function showWait(){
    const code=M.code;
    open('wait',pn=>{
      pn.append(el('h2','','Arkadaşını davet et'));
      const no=el('div','no');no.append(el('small','','Masa'),el('b','',code));pn.append(no);
      pn.append(el('p','',`Linki arkadaşına gönder. Ya da ${NAMES[GAME]}’da “Kodla otur”a basıp ${code} yazsın. İkiniz de Google ile giriş yapmış olmalısınız.`));
      const w=el('div','wait');w.append(el('i'),el('span','','Arkadaşın bekleniyor…'));pn.append(w);
      const r=el('div','row');
      r.append(btn('Masayı kapat','',()=>{M.leave();close();if(hooks.onClosed)hooks.onClosed();}));
      r.append(btn('Linki gönder','pri',share));
      pn.append(r);
    });
  }
  async function share(){
    const url=link(M.code),text=`Kahvehane’de ${NAMES[GAME].toLocaleLowerCase('tr')} masası açtım, gel bir el atalım. Masa ${M.code}`;
    if(navigator.share){try{await navigator.share({title:'Kahvehane',text,url});return;}catch(e){if(e&&e.name==='AbortError')return;}}
    try{await navigator.clipboard.writeText(text+'\n'+url);say('Link kopyalandı; mesajla gönderebilirsin.');}
    catch(e){prompt('Bu linki arkadaşına gönder:',url);}
  }

  /* ----- Masaya oturma ----- */
  M.joinPrompt=function(){
    if(!needUser('Masaya otur'))return;
    open('join',pn=>{
      pn.append(el('h2','','Masaya otur'));
      pn.append(el('p','','Arkadaşının söylediği dört haneli masa numarasını yaz.'));
      const inp=el('input');inp.inputMode='numeric';inp.maxLength=4;inp.autocomplete='off';inp.setAttribute('aria-label','Masa numarası');inp.placeholder='····';
      const err=el('p','err');err.setAttribute('aria-live','polite');
      const go=btn('Otur','pri',()=>{const c=inp.value.replace(/\D/g,'');if(c.length!==4){err.textContent='Masa numarası dört hanedir.';return;}go.disabled=true;join(c,err).finally(()=>{go.disabled=false;});});
      inp.addEventListener('input',()=>{inp.value=inp.value.replace(/\D/g,'').slice(0,4);err.textContent='';});
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')go.click();});
      const r=el('div','row');r.append(btn('Vazgeç','',close),go);
      pn.append(inp,err,r);
    });
  };
  async function join(code,errEl){
    let side=null,game=null;
    try{
      const me=meObj();
      await db().runTransaction(async t=>{
        const s=await t.get(ref(code));
        if(!s.exists)throw fail('Bu numarada açık masa yok.');
        const d=s.data()||{};game=d.game;
        if(d.game!==GAME)return;
        if(d.host&&d.host.uid===me.uid){side=0;if(d.status==='left')throw fail('Bu masa kapanmış.');return;}
        if(d.guest&&d.guest.uid===me.uid){side=1;if(d.status==='left')throw fail('Bu masa kapanmış.');return;}
        if(d.guest)throw fail('Bu masa dolu.');
        if(d.status!=='waiting'||(d.updatedAt||0)<Date.now()-STALE)throw fail('Bu masa kapanmış.');
        t.update(ref(code),{guest:me,status:'playing',updatedAt:Date.now()});
        side=1;
      });
      if(game&&game!==GAME){location.href=`${game}.html#masa-${code}`;return;}
      close();
      attach(code,side);
    }catch(e){
      const t=e&&e.user?e.message:(e&&e.code==='permission-denied'?'Masaya oturulamadı: Firestore kurallarında masalar bölümü eksik.':'Masaya oturulamadı. İnternetini kontrol edip yeniden dene.');
      if(errEl)errEl.textContent=t;else showError('Masaya oturulamadı',e);
    }
  }
  function showError(title,e){
    const t=e&&e.user?e.message:(e&&e.code==='permission-denied'?'Firestore kurallarında çevrimiçi masalar bölümü henüz yok.':'İnternet bağlantını kontrol edip yeniden dene.');
    open('err',pn=>{pn.append(el('h2','',title),el('p','',t));const r=el('div','row');r.append(btn('Tamam','pri',close));pn.append(r);});
  }

  /* ----- Bağlantı ----- */
  function attach(code,side){
    detach(true);
    M.code=code;M.side=side;M.doc=null;
    lsSet(KEY(),{code,side,uid:user().uid});
    if(location.hash)history.replaceState(null,'',location.pathname+location.search);
    if(hooks.onAttach)hooks.onAttach(side,code);
    let wasWaiting=false;
    unsub=ref(code).onSnapshot(snap=>{
      if(M.code!==code)return;
      if(!snap.exists){say('Masa kapandı.');const h=hooks.onGone;detach();if(h)h();return;}
      const d=snap.data()||{};M.doc=d;
      if(side===0){
        if(d.status==='waiting')wasWaiting=true;
        else if(wasWaiting&&d.guest){wasWaiting=false;if(sheetMode==='wait')close();say(`${first(d.guest.name)||'Arkadaşın'} masaya oturdu.`);}
      }
      if(hooks.onDoc)hooks.onDoc(d);
    },e=>{if(M.code===code)say('Masayla bağlantı koptu. Sayfayı yenileyince geri döner.');});
  }
  function detach(keep){
    if(unsub){try{unsub();}catch(e){}unsub=null;}
    M.code=null;M.side=null;M.doc=null;
    if(!keep)lsSet(KEY(),null);
  }
  M.detach=()=>detach();
  // Oyun durumunu yazar. Sırası gelen tek oyuncu yazdığı için çakışma olmaz;
  // bağlantı koparsa Firestore yazmayı bekletir ve bağlanınca gönderir.
  M.send=function(state){
    if(!M.code||!db())return Promise.resolve();
    return ref(M.code).update({state,updatedAt:Date.now()}).catch(e=>{say('Hamle gönderilemedi; internetini kontrol et.');throw e;});
  };
  M.setTab=function(side,obj){
    if(!M.code||!db())return;
    ref(M.code).update({['tabs.s'+side]:obj,updatedAt:Date.now()}).catch(()=>{});
  };
  M.leave=function(){
    if(!M.code||!db()){detach();return;}
    const code=M.code,side=M.side;detach();
    ref(code).update({status:'left',leftBy:side,updatedAt:Date.now()}).catch(()=>{});
  };
  M.link=()=>M.code?link(M.code):'';
  M.first=first;

  M.init=function(game,h){
    GAME=game;hooks=h||{};style();
    const readHash=()=>{const m=/^#masa-(\d{4})$/.exec(location.hash||'');if(m&&m[1]!==M.code){pendingCode=m[1];tried=false;}return!!m;};
    readHash();
    let onUser=null;
    // uygulama açıkken davet linki açılırsa
    window.addEventListener('hashchange',()=>{if(readHash()&&onUser&&window.Hesap&&(Hesap.ready||Hesap.offline)){if(M.code){pendingCode=null;say('Önce bu masadan kalkman gerekiyor.');return;}onUser(Hesap.user);}});
    const go=()=>{
      if(!window.Hesap||!Hesap.on){setTimeout(go,200);return;}
      Hesap.on(onUser=u=>{
        if(M.code){if(!u){say('Hesaptan çıktığın için masadan kalktın.');M.leave();if(hooks.onGone)hooks.onGone();}return;}
        if(pendingCode){
          if(!u){
            if(!tried){tried=true;open('invited',pn=>{
              pn.append(el('h2','',`Masa ${pendingCode}`));
              pn.append(el('p','',Hesap.offline?'Arkadaşın seni masasına çağırıyor. Oturmak için internet gerekli.':`Arkadaşın seni ${NAMES[GAME].toLocaleLowerCase('tr')} masasına çağırıyor. Oturmak için Google ile giriş yap.`));
              const r=el('div','row');r.append(btn('Vazgeç','',()=>{pendingCode=null;close();history.replaceState(null,'',location.pathname);}));
              if(!Hesap.offline)r.append(btn('Google ile giriş yap','pri',()=>{close();Hesap.signIn();}));
              pn.append(r);});}
            return;
          }
          const c=pendingCode;pendingCode=null;join(c);return;
        }
        const st=ls(KEY());
        if(u&&st&&st.uid===u.uid&&st.code)rejoin(st.code,st.side);
      });
    };
    go();
  };
  async function rejoin(code,side){
    try{
      const s=await ref(code).get();
      if(!s.exists){lsSet(KEY(),null);return;}
      const d=s.data()||{},uid=user().uid;
      const mine=(side===0&&d.host&&d.host.uid===uid)||(side===1&&d.guest&&d.guest.uid===uid);
      if(!mine||d.status==='left'||(d.updatedAt||0)<Date.now()-STALE){lsSet(KEY(),null);return;}
      attach(code,side);
      if(side===0&&d.status==='waiting')showWait();
      else say(`Masaya geri döndün (masa ${code}).`);
    }catch(e){}
  }
})();
