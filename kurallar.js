/* ===== Kahvehane: oyun kuralları =====
   kurallarAc('tavla') kural penceresini açar. Ana sayfa ve oyun sayfaları ortak kullanır.
   Açık masaların kuralları uygulamanın oynadığı kurallardır; açılmamış masalarda kahvehanelerde
   en yaygın oynanan kurallar yazılıdır, masa açılırken küçük farklar olabilir. */
const KURALLAR={
  tavla:{ad:'Tavla',ozet:'İki kişilik zar oyunu. 15 pulunu evine toplayıp ilk bitiren kazanır.',bolumler:[
    {h:'Amaç',m:['Her oyuncunun 15 pulu var. Pullarını zarla ilerletip kendi evine (1–6. haneler) getirir, sonra toplar. Pullarını ilk toplayan oyunu kazanır.']},
    {h:'Başlangıç',m:['İki taraf birer zar atar; büyük atan başlar ve iki zarı birden ilk hamlesinde oynar.','Aynı setteki sonraki oyunu bir önceki oyunu kazanan başlatır.']},
    {h:'Pul oynamak',m:['Her zar ayrı bir hamledir: 5-3 attıysan bir pulu 5, bir pulu 3 ilerletirsin ya da aynı pulu 8 ilerletirsin.','Çift gelirse (örneğin 4-4) dört kez oynarsın.','İki ya da daha fazla rakip pulun olduğu haneye (kapıya) giremezsin.','İki zarı da oynayabiliyorsan ikisini de oynamak zorundasın. Sadece biri oynanabiliyorsa büyük zar oynanır.']},
    {h:'Pul kırmak',m:['Rakibin tek pulunun (açık pulun) olduğu haneye gelirsen o pulu kırarsın; kırılan pul ortadaki bara gider.','Barda pulu olan, önce o pulu rakibin evinden oyuna sokmak zorundadır. Giremezse sırası geçer.']},
    {h:'Toplamak',m:['Bütün pulların evine gelince toplamaya başlarsın: zar kaç gelirse o hanedeki pulu tahtadan çıkarırsın.','O hanede pul yoksa ve daha geride de pulun kalmadıysa, büyük zarla en arkadaki pulunu toplayabilirsin.']},
    {h:'Mars ve maç',m:['Rakip hiç pul toplamadan bitirirsen mars yaparsın: oyun 2 sayılır. Mars yiyen masaya bir tur çay ısmarlar.','Maçta set ve oyun sayısını sen seçersin. Seti belirlenen oyun sayısına ilk ulaşan alır.']},
    {h:'Katlama zarı (isteğe bağlı)',m:['Sıra sendeyken zar atmadan oyunun değerini ikiye katlamayı teklif edebilirsin. Rakip kabul ederse oyun 2 sayı değerinde sürer ve katlama hakkı ona geçer; kabul etmezse oyunu bırakır ve 1 sayı verir.','Değer 2, 4, 8 diye en fazla 64’e kadar katlanır; mars da ayrıca ikiye katlar.','Crawford kuralı: Bir oyuncu sete bir oyun kalınca, sıradaki bir oyunda katlama yapılamaz.']},
    {h:'Bu masada',m:['Bir pula dokununca gidebileceği haneler parlar; uzak bir haneye dokunursan pul zarları sırayla kullanarak oraya gider.','Tek seçeneği olan zar kendiliğinden oynanır; hiç hamle yoksa sıra kendiliğinden geçer.','Ayarlardan zarı otomatik attırabilir, bilgisayarın seviyesini (Acemi, Kalfa, Usta) seçebilirsin.']},
    {h:'Arkadaşınla',m:['Yeni maç kartında Arkadaşını davet et’e basınca dört haneli bir masa numarası açılır. Linki arkadaşına gönder ya da numarayı söyle; o Kodla otur’a basıp numarayı yazar.','İkiniz de Google ile giriş yapmış olmalısınız. Masayı açan beyazla, oturan siyahla oynar; herkes kendi pullarını altta görür.','Çevrimiçi masada katlama zarı yoktur. Sonraki oyunu önceki oyunu kazanan açar, rövanşı masayı açan.','Adisyonda herkes kendi siparişini verir. Maçı kaybeden hesabın tamamını kendi kesesinden öder. Maç bitmeden masadan kalkan hesabı öder.','Sayfa kapanır ya da telefon kilitlenirse uygulamayı yeniden açınca masaya geri dönersin.','Arkadaşın uygulamayı kapatır ya da bağlantısı koparsa ekranda “masada değil” yazar. Dönmesini bekleyebilir ya da Masayı kapat’a basabilirsin; o zaman maç sayılmaz, adisyon iptal olur.']}
  ]},
  dama:{ad:'Dama',ozet:'Türk daması. Taşlar düz gider, yemek zorunludur, dama olan taş uzun gider.',bolumler:[
    {h:'Amaç',m:['Rakibin bütün taşlarını yemek ya da onu oynayacak hamlesi kalmayacak şekilde kıstırmak.']},
    {h:'Başlangıç',m:['8×8 tahtada her oyuncunun 16 taşı var; taşlar kendi tarafındaki ikinci ve üçüncü sıraya dizilir, en arka sıralar boş kalır.','Maçta oyunları sırayla iki taraf başlatır.']},
    {h:'Taş oynamak',m:['Taş bir kare ileri ya da bir kare sağa veya sola gider.','Taş geri ve çapraz gidemez.']},
    {h:'Yemek',m:['Rakip taş hemen önünde ya da yanındaysa ve arkası boşsa üstünden atlayıp yersin. Taş geriye doğru yiyemez.','Yemek zorunludur. Birden çok yol varsa en çok taş yiyen hamleyi oynamak zorundasın; eşitse dilediğini seçersin.','Atladıktan sonra yine yenecek taş varsa zincirleme yemeye devam edersin. Yenen taş anında tahtadan kalkar.']},
    {h:'Dama',m:['Rakibin en arka sırasına varan taş dama olur.','Dama düz çizgide istediği kadar ileri, geri ya da yana gider.','Dama uzaktaki bir taşı, arada başka taş yoksa üstünden atlayarak yer ve arkasındaki boş karelerden birine iner.','Zincirleme yerken dama geldiği yöne geri dönemez (180° dönüş yok).','Yeme sırasında son sıraya varan taş, o hamle bitince dama olur.']},
    {h:'Beraberlik',m:['İki tarafın da tek daması kalırsa oyun berabere biter.','50 hamle boyunca hiç taş yenmez ve taşlar ileri gitmezse oyun berabere biter.']},
    {h:'Bu masada',m:['Oynayabileceğin taşlar kesik çizgiyle işaretlenir; taşa dokununca gidebileceği kareler parlar.','Tek hamlen varsa kendiliğinden oynanır. Zincirleme yemede tek yol varsa taş kendisi devam eder, yol ayrılırsa seçimi sana bırakır.','Geri al ile son hamleni geri alabilir, pes et ile oyunu bırakabilirsin.']}
  ]},
  okey:{ad:'Okey',ozet:'Dört kişilik taş oyunu. Elindeki 14 taşı perlere dizip ilk bitiren kazanır.',bolumler:[
    {h:'Taşlar',m:['106 taş vardır: sarı, mavi, siyah ve kırmızı renklerde 1’den 13’e kadar, her taştan ikişer tane; bir de iki sahte okey (yonca işaretli).']},
    {h:'Gösterge ve okey',m:['Dağıtımdan sonra bir taş açılır: gösterge. Göstergenin aynı renkte bir üstü okeydir (gösterge 13 ise okey 1’dir).','Okey her taşın yerine geçebilen jokerdir; istakanda köşesindeki yıldızla işaretlidir. Sahte okey ise okey taşının yerine geçer, onun rengini ve sayısını taşır.']},
    {h:'Dağıtım ve sıra',m:['Eli başlatan oyuncuya 15, diğerlerine 14 taş verilir. Başlatan bir taş atarak oyunu açar. Her yeni eli bir sağdaki oyuncu başlatır.','Sırası gelen ya ortadaki desteden ya da solundaki oyuncunun son attığı taşı çeker, sonra bir taş atar. Sıra sağa doğru döner.']},
    {h:'Per',m:['Aynı renkte en az üç ardışık taş: örneğin kırmızı 5-6-7. 13’ten sonra 1 gelebilir (12-13-1), ama 13-1-2 olmaz.','Aynı sayının farklı renklerinden üç ya da dört taş: örneğin sarı 9, mavi 9, siyah 9.']},
    {h:'Bitirmek',m:['14 taşını perlere dizen, 15. taşı atarak eli bitirir.','Yedi çift ile de bitilir (çifte gitmek). Çift, aynı renk ve sayıdaki iki taştır; okey her taşın eşi olabilir.','Deste biter ve kimse bitiremezse el berabere biter.']},
    {h:'Puan',m:['Herkes maç başında seçilen puanla başlar: 10, 14 ya da 20.','Eli bitiren, diğer üç oyuncunun puanından 2 düşürür. Okeyi atarak ya da çiftten bitirirse 4 düşürür.','İlk elini atmadan önce elinde göstergenin aynısı olan oyuncu göstergeyi gösterebilir; diğer üç oyuncudan 1 puan düşer.','Biri sıfıra ya da altına inince maç biter. En yüksek puanlı kazanır, en düşük puanlı masanın hesabını öder.']},
    {h:'Bu masada',m:['Masada sen ve üç bilgisayar oyuncusu var: sağında Rıza, karşında Şükrü, solunda Cevdet. Taşlarını Cevdet’in attığından alırsın, attığını Rıza alır.','Çekmek için desteye ya da Cevdet’in attığı taşa dokun. Atmak için istakadan taşı seç ve At’a bas.','Cevdet’in attığı taşı aldıktan sonra vazgeçersen, bir şey atmadan Geri koy’a bas; taş yerine döner, yeniden çekersin.','Taşların yerini değiştirmek için bir taşa, sonra gideceği yere ya da başka bir taşa dokun. Seri diz ve Çift diz düğmeleri istakayı kendiliğinden dizer.','Elin bitmeye hazırsa haber verilir: atacağın taşı seç ve Bitir’e bas.','Bilgisayarlar yandan taş alınca ekranda yazar; gerçek masadaki gibi kimin neyi topladığını görebilirsin.']}
  ]},
  blackjack:{ad:'Blackjack',ozet:'Kasaya karşı 21. Kartlarının toplamı 21’i geçmeden kasanınkinden yüksek olsun.',bolumler:[
    {h:'Amaç',m:['Kartlarının toplamını 21’e yaklaştırmaya çalışırsın. 21’i geçersen patlarsın ve bahsini kaybedersin. Patlamadan kasadan yüksek toplam yaparsan kazanırsın.']},
    {h:'Kart değerleri',m:['2’den 10’a kadar kartlar üstündeki sayı kadardır. J, Q ve K 10 sayılır.','As 1 ya da 11 sayılır; elin için hangisi iyiyse. Asın 11 sayıldığı ele yumuşak denir (örneğin A-6 yumuşak 17’dir).']},
    {h:'Oyunun akışı',m:['Önce fiş koyup Dağıt’a basarsın. Sana iki açık kart, kasaya bir açık bir kapalı kart gelir.','Kart çek ile bir kart daha alırsın; istediğin kadar çekebilirsin. Dur dersen sıra kasaya geçer.','İlk iki kartın as ve 10 değerinde bir kartsa blackjack yaptın: bahsinin 1,5 katını kazanırsın.']},
    {h:'İkiye katla ve böl',m:['İlk iki kartla İkiye katla diyebilirsin: bahsin iki katına çıkar, tek bir kart daha alırsın ve durursun.','İlk iki kartın aynı değerdeyse Böl ile iki ayrı el yaparsın; ikinci el için aynı bahsi koyarsın. Üç kez bölebilirsin, en çok dört el olur.','Bölünen asların her birine yalnız bir kart gelir. Bölünmüş elde 21 olursa blackjack değil, 21 sayılır. Bölünmüş elde ikiye katlamak serbesttir.']},
    {h:'Kasa',m:['Kasa 16 ve altında kart çekmek, 17 ve üstünde durmak zorundadır; yumuşak 17’de de durur.','Kasanın açık kartı as ya da 10 değerindeyse kasa kapalı kartına bakar; blackjack’i varsa hemen açar ve el biter.']},
    {h:'Sigorta',m:['Kasanın açık kartı as olunca sigorta isteyebilirsin: bahsinin yarısını koyarsın. Kasa blackjack yaparsa sigorta 2’ye 1 öder, yapmazsa sigorta kasada kalır.']},
    {h:'Ödemeler',m:['Kazanırsan bahsin kadar alırsın (1’e 1). Blackjack 3’e 2 öder. Toplamlar eşitse berabere: bahsin geri döner.']},
    {h:'Bu masada',m:['6 deste kullanılır. Destelerin dörtte üçü bitince kasa kartları toplayıp yeniden karıştırır. Karıştırma kriptografik rastgele sayıyla yapılır.','Her oturum 1.000 fişle başlar; bir elde en az 10, en fazla 500 fiş koyabilirsin. Fiş kurabiye değildir, bedavadır ve oturum bitince sıfırlanır.','Hesabı iste ile masadan kalkarsın. Kasadan öndeysen ocak adisyonu ısmarlar; gerideysen adisyonu kendi kurabiyenden sen ödersin. Fişin biterse oturum kendiliğinden kapanır.','El ortasında sayfayı kapatırsan o eldeki bahis kasada kalır.','Ayarlardan İpucu göster’i açarsan her elde temel stratejinin önerdiği hamle işaretlenir.']}
  ]},
  '101':{ad:'101',acik:false,ozet:'101 Okey. Elini en az 101 sayıyla aç, taş işle, elinde kalanı ceza olarak yaz.',bolumler:[
    {h:'Taşlar ve dağıtım',m:['Okeydeki 106 taş kullanılır; gösterge ve okey aynı şekilde belirlenir.','Başlayana 22, diğerlerine 21 taş dağıtılır.']},
    {h:'El açmak',m:['Perlerinin sayı toplamı en az 101 olunca elini masaya açabilirsin.','Ya da en az beş çift ile açabilirsin (çiftten açmak).','Açtıktan sonra kendi perlerine ve rakiplerin perlerine taş işleyebilirsin.']},
    {h:'Yandan almak',m:['Solundaki oyuncunun attığı taşı alırsan o el içinde elini açmak ya da o taşı kullanmak zorundasın; yoksa ceza yazılır.']},
    {h:'Bitirmek ve ceza (yaygın kural)',m:['Bütün taşlarını kullanıp son taşı atan eli bitirir ve kendisine eksi 101 yazılır.','Açmış oyuncuların elinde kalan taşların toplamı ceza olarak yazılır. Hiç açamayan oyuncuya 202 ceza yazılır.','Okeyi atarak bitirilirse cezalar ikiye katlanır. Bir pere işlenebilecek taşı atana 101 ceza yazılır.','Belirlenen el sayısı sonunda en az puanı olan kazanır.']}
  ]},
  pisti:{ad:'Pişti',acik:false,ozet:'İki ya da dört kişilik kâğıt oyunu. Yerdeki son kâğıdı aynısıyla ya da valeyle al.',bolumler:[
    {h:'Dağıtım',m:['52 kâğıtlık deste kullanılır. Her oyuncuya 4 kâğıt verilir, yere 4 kâğıt konur: üç kapalı, en üstteki açık.','Eller bitince herkese yeniden 4’er kâğıt dağıtılır; deste bitene kadar böyle sürer.']},
    {h:'Oynanış',m:['Sırayla birer kâğıt atılır. Attığın kâğıt yerdeki en üst kâğıtla aynı değerdeyse yerdeki bütün kâğıtları alırsın.','Vale (J) her zaman yerdeki bütün kâğıtları alır.','Deste bitince yerde kalan kâğıtları en son kâğıt alan oyuncu alır.']},
    {h:'Pişti',m:['Yerde tek kâğıt varken aynı değerdeki kâğıtla alırsan pişti yaparsın: 10 puan.','Tek vale yerdeyken valeyle alırsan 20 puan.']},
    {h:'Puan',m:['Her as 1, her vale 1 puan. Sinek ikilisi 2, karo onlusu 3 puan.','En çok kâğıt alan 3 puan alır.','Oyun genellikle 101 ya da 151 puana kadar oynanır.']}
  ]},
  batak:{ad:'Batak',acik:false,ozet:'Dört kişilik ihaleli batak. İhaleyi al, kozu sen seç, dediğin kadar el topla.',bolumler:[
    {h:'Dağıtım ve ihale',m:['52 kâğıt dört oyuncuya 13’er dağıtılır.','Oyuncular sırayla kaç el alacaklarını söyler. En yüksek sayıyı söyleyen ihaleyi alır, kozu seçer ve ilk kâğıdı o atar.']},
    {h:'Oynanış',m:['Yerdeki renge uymak zorunludur ve elinden geliyorsa yerdeki en büyük kâğıdı geçmek zorundasın.','Renge uyamıyorsan koz atmak zorundasın; kozun da yoksa istediğin kâğıdı atarsın.','Koz bir kez oynanmadan (koz açılmadan) el başında koz atılamaz.','Eli en büyük koz, koz yoksa yerdeki rengin en büyük kâğıdı alır; alan sonraki eli başlatır.']},
    {h:'Puan (yaygın kural)',m:['İhaleyi alan, söylediği kadar ya da daha fazla el alırsa aldığı el kadar puan yazar. Alamazsa söylediği sayı kadar eksi yazılır: batar.','Diğer oyuncular aldıkları el kadar puan yazar; hiç el alamayan oyuncu batar ve eksi yazılır.']}
  ]},
  kahvehane:{ad:'Kahvehane',kahve:false,ozet:'Kurabiye, garson, adisyon ve hesap düzeni. Bütün masalarda aynıdır.',bolumler:[]},
  king:{ad:'King',acik:false,ozet:'Dört kişilik, yirmi ellik kâğıt oyunu: cezalardan kaç, kozlarda el topla.',bolumler:[
    {h:'Düzen',m:['52 kâğıt dört oyuncuya 13’er dağıtılır. Oyun 20 el sürer.','Her oyuncu sırası gelince oynanacak eli seçer: toplamda 12 ceza eli ve 8 koz eli oynanır. Her ceza en fazla iki kez seçilebilir.']},
    {h:'Oynanış',m:['Yerdeki renge uymak zorunludur; uyamıyorsan istediğin kâğıdı atabilirsin.','Ceza ellerinde, cezalı kâğıdı atma fırsatın varsa (renge uyamıyorsan) atmak zorundasın.']},
    {h:'Cezalar (yaygın puanlar)',m:['El almaz: aldığın her el eksi 50.','Kupa almaz: aldığın her kupa eksi 30; kupa açılmadan kupa ile başlanamaz.','Erkek almaz: her papaz ve vale eksi 60.','Kız almaz: her kız eksi 100.','Rıfkı: kupa papazını alan eksi 320.','Son iki: son iki elin her biri eksi 180.']},
    {h:'Koz elleri',m:['Kozu eli seçen oyuncu belirler. Aldığın her el artı 50 puan.','Renge uyamıyorsan koz atmak zorundasın.','Yirmi el sonunda puanı en yüksek olan kazanır.']}
  ]}
};
const KAHVE_BOLUMLER=[
  {h:'Kurabiye',m:['Kahvehanede para birimi kurabiyedir. Gerçek parayla bağı yoktur; kurabiye paraya çevrilmez, başkasına gönderilmez.','Kahvehaneye ilk gelişinde ocakçı 50 kurabiye ikram eder. Sonra her gün 10 kurabiye daha verir.','Kesen ve hesap defterin bütün masalarda ortaktır; tavlada kazandığın kurabiyeyle damada çay içebilirsin. Şimdilik bu telefonda saklanır.']},
  {h:'Garson ve adisyon',m:['Garsondan çay, kahve, soğuk içecek ve tost söyleyebilirsin. Fiyatlar: çay 2, Türk kahvesi 5, kaşarlı tost 10 kurabiye gibi.','Bir oyunda kişi başı en fazla 3 şey söylenebilir; yeni oyunda hakkın yenilenir.','Bilgisayara karşı yalnızca sen sipariş verirsin. İki kişilik oyunda iki oyuncu da kendi siparişini verir; adisyonda kimin ne söylediği yazar.','Yanlış söylediğini adisyondan eksiltebilirsin.']},
  {h:'Hesabı kim öder',m:['Maçı kaybeden masanın bütün hesabını öder; adisyon maç bitince kapanır.','Bilgisayara karşı kazanırsan ocak ısmarlar: hesap bedava, üstüne bahşiş. Acemi\'yi yenince bahşiş yok, Kalfa\'yı yenince 2, Usta\'yı yenince 5 kurabiye.','Maçı yarıda bırakırsan hesabı sen ödersin.','Tavlada mars yiyen masaya bir tur çay ısmarlar: iki çay, 4 kurabiye.','İki kişilik oyunda telefonun sahibi beyaz oyuncu sayılır; beyaz öderse kurabiye onun kesesinden düşer.']},
  {h:'Veresiye',m:['Kurabiyen hesabı karşılamazsa kalan kısım veresiye defterine yazılır.','Veresiye 30 kurabiyeye ulaşınca garson sipariş almaz. Oyun oynamaya devam edebilirsin.','Ocakçının günlük ikramı önce veresiyeden düşer.']},
  {h:'Hesap defteri',m:['Garsonun Hesap defteri sekmesinde kesendeki kurabiye, kimin ne kadar ödediği ve kapanan her hesap görünür: tarih, masa, rakip, skor ve neler içildiği.']}
];

function kurallarAc(oyun){
  const k=KURALLAR[oyun];if(!k)return;
  if(oyun==='kahvehane')k.bolumler=KAHVE_BOLUMLER;
  if(!document.getElementById('kuralStyle')){
    const st=document.createElement('style');st.id='kuralStyle';
    st.textContent=`.kural{position:fixed;inset:0;z-index:40;display:flex;align-items:flex-end;justify-content:center}
.kural[hidden]{display:none!important}
.kural .bg{position:absolute;inset:0;background:rgba(5,10,22,.62)}
.kural .pn{position:relative;width:100%;max-width:600px;max-height:86%;display:flex;flex-direction:column;background:var(--room);color:var(--ink);border:1px solid var(--line);border-bottom:0;border-radius:18px 18px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.5);padding-bottom:env(safe-area-inset-bottom,0px)}
.kural .hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 10px;border-bottom:1px solid var(--line)}
.kural h2{font-family:var(--display);font-weight:400;font-size:28px;margin:0;line-height:1.1}
.kural .oz{margin:4px 0 0;color:var(--muted);font-size:14px}
.kural .x{flex:none;font:inherit;font-size:26px;line-height:1;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--room-2);color:var(--ink);cursor:pointer}
.kural .x:focus-visible{outline:2px solid var(--brass);outline-offset:2px}
.kural .bd{overflow-y:auto;padding:6px 16px 20px;-webkit-overflow-scrolling:touch}
.kural .not{margin:12px 0 0;font-size:13px;color:var(--brass);border:1px dashed var(--brass);border-radius:10px;padding:8px 10px}
.kural h3{font-family:var(--body);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);margin:18px 0 6px}
.kural ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;max-width:65ch}
.kural li{font-size:15px;line-height:1.5}
.kural li::marker{color:var(--muted)}`;
    document.head.appendChild(st);
  }
  let box=document.getElementById('kural');
  if(!box){
    box=document.createElement('div');box.id='kural';box.className='kural';box.hidden=true;
    box.innerHTML='<div class="bg"></div><div class="pn" role="dialog" aria-modal="true" aria-labelledby="kuralBaslik"><div class="hd"><div><h2 id="kuralBaslik"></h2><p class="oz"></p></div><button class="x" type="button" aria-label="Kapat">×</button></div><div class="bd"></div></div>';
    document.body.appendChild(box);
    const kapat=()=>{box.hidden=true;if(box._from&&box._from.focus)box._from.focus();};
    box.querySelector('.bg').onclick=kapat;box.querySelector('.x').onclick=kapat;
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)kapat();});
  }
  box._from=document.activeElement;
  box.querySelector('h2').textContent=k.ad+' kuralları';
  box.querySelector('.oz').textContent=k.ozet;
  const bd=box.querySelector('.bd');bd.replaceChildren();
  if(k.acik===false){const n=document.createElement('p');n.className='not';n.textContent='Bu masa henüz açılmadı. Aşağıda kahvehanelerde en yaygın oynanan kurallar var; masa açılırken küçük farklar olabilir.';bd.append(n);}
  const sec=k.acik===false||k.kahve===false?k.bolumler:k.bolumler.concat(KAHVE_BOLUMLER);
  for(const b of sec){
    const h=document.createElement('h3');h.textContent=b.h;bd.append(h);
    const ul=document.createElement('ul');
    for(const t of b.m){const li=document.createElement('li');li.textContent=t;ul.append(li);}
    bd.append(ul);
  }
  bd.scrollTop=0;box.hidden=false;box.querySelector('.x').focus();
}
