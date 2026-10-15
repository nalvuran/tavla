# Kahvehane

Telefonda oynanan kahvehane oyunları. Gir: https://nalvuran.github.io/tavla/

Ana sayfada oyuncu oynayacağı oyunu seçer:

| Oyun | Durum | Dosya |
|---|---|---|
| Tavla | Açık | `tavla.html` |
| Dama | Açık | `dama.html` |
| Okey | Yakında | |
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

## Kurabiye, garson ve adisyon (`garson.js`, tüm masalarda ortak)
- Para birimi kurabiye; gerçek parayla bağı yok. İlk açılışta 50, her gün 10 kurabiye ikram
- Oyun başına kişi başı en fazla 3 sipariş; adisyonda kimin ne söylediği görünür
- Maçı kaybeden masanın tamamını öder
- Bilgisayara karşı kazanırsan ocak ısmarlar, üstüne bahşiş: Kalfa 2, Usta 5 kurabiye
- Tavlada mars yiyen masaya bir tur çay ısmarlar
- Kurabiye biterse veresiye (en fazla 30); kese ve hesap defteri tüm masalarda ortak

## Çalıştırma
`index.html` ana sayfa, her oyun tek bir HTML dosyası. Tarayıcıda açman yeterli.
