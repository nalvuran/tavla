# Kahvehane

Telefonda oynanan kahvehane oyunları. Gir: https://nalvuran.github.io/tavla/

Ana sayfada oyuncu oynayacağı oyunu seçer:

| Oyun | Durum | Dosya |
|---|---|---|
| Tavla | Açık | `tavla.html` |
| Dama | Açık | `dama.html` |
| Okey | Açık | `okey.html` |
| 101 | Yakında | |
| Pişti | Yakında | |
| Batak | Yakında | |
| King | Yakında | |


## Tavla
- Bilgisayara karşı (Acemi, Kalfa, Usta) ya da aynı telefonda iki kişi
- Set ve oyun sayısı seçimi, mars iki oyun, sonraki oyunu kazanan başlar
- İsteğe bağlı katlama zarı (Crawford kuralıyla)
- Zorunlu hamleler otomatik oynanır, uzak hedefler tek dokunuşla
- Pul animasyonları ve ses efektleri
- Garson, adisyon ve hesap defteri: maçı kaybeden hesabı öder

## Dama
- Türk daması: taşlar ileri ve yana gider, yeme zorunlu ve en çok taş yiyen hamle oynanır
- Yenen taş anında kalkar, dama uzun gider ve uzaktan yer, 180° dönemez
- Bilgisayara karşı (Acemi, Kalfa, Usta) ya da aynı telefonda iki kişi
- Maç: 1, 2 ya da 3 oyun alan kazanır; oyunları sırayla iki taraf başlatır
- Tek hamle varsa kendiliğinden oynanır, zincirleme yemede tek yol varsa devam eder
- Geri al, pes et, beraberlik (iki tek dama ya da 50 hamle ilerlemesiz)
- Garson, adisyon ve hesap defteri

## Okey
- Sen ve üç bilgisayar (Rıza, Şükrü, Cevdet); seviye Acemi, Kalfa ya da Usta
- 106 taş, gösterge ve okey, sahte okey; seri ve grup perler, 12-13-1 geçerli, 13-1-2 geçersiz
- Desteden ya da soldakinin attığından çek; istakada iki dokunuşla yer değiştir, Seri diz / Çift diz
- Bitir: normal bitiş herkesten 2, okey atarak ya da çiftten 4 puan; gösterge 1 puan
- Maç 10, 14 ya da 20 puandan; biri sıfırlanınca en yüksek puanlı kazanır, en düşük hesabı öder

## Kurabiye, garson ve adisyon (`garson.js`, tüm masalarda ortak)
- Para birimi kurabiye; gerçek parayla bağı yok. İlk açılışta 50, her gün 10 kurabiye ikram
- Oyun başına kişi başı en fazla 3 sipariş; adisyonda kimin ne söylediği görünür
- Maçı kaybeden masanın tamamını öder
- Bilgisayara karşı kazanırsan ocak ısmarlar, üstüne bahşiş: Kalfa 2, Usta 5 kurabiye
- Tavlada mars yiyen masaya bir tur çay ısmarlar
- Kurabiye biterse veresiye (en fazla 30); kese ve hesap defteri tüm masalarda ortak

## Kurallar (`kurallar.js`)
Her masanın sağ üst köşesindeki **i** düğmesi o oyunun kurallarını açar; tavla ve dama sayfalarında üst çubukta da var. Açılmamış masalarda kahvehanelerde en yaygın oynanan kurallar yazılı.

## Hesap (`hesap.js`)
Sol üstteki hesap kutusu Google ile giriş düğmesidir (Firebase Authentication). Giriş yapınca kurabiye kesesi ve hesap defteri Firestore'da `users/{uid}` belgesinde saklanır; ilk girişte telefondaki kese hesaba taşınır. Güvenlik kuralları `firestore.rules` dosyasında. Giriş isteğe bağlıdır; internet yoksa oyunlar misafir olarak çalışır.

## Çalıştırma
`index.html` ana sayfa, her oyun tek bir HTML dosyası. Tarayıcıda açman yeterli.
