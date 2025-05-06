document.addEventListener('DOMContentLoaded', () => {
    // HTML Elementleri
    const anaKartBaslangicInput = document.getElementById('anaKartBaslangic');
    const multinetBaslangicInput = document.getElementById('multinetBaslangic');
    const baslangicAyarlaBtn = document.getElementById('baslangicAyarla');

    const bugununTarihiSpan = document.getElementById('bugununTarihi');
    const anaKartAylikKalanSpan = document.getElementById('anaKartAylikKalan');
    const anaKartGunlukButceSpan = document.getElementById('anaKartGunlukButce');
    const anaKartToplamKullanilabilirSpan = document.getElementById('anaKartToplamKullanilabilir');
    const multinetAylikKalanSpan = document.getElementById('multinetAylikKalan');
    const multinetGunlukButceSpan = document.getElementById('multinetGunlukButce');
    const multinetToplamKullanilabilirSpan = document.getElementById('multinetToplamKullanilabilir');

    const kartSecimiSelect = document.getElementById('kartSecimi');
    const harcamaMiktariInput = document.getElementById('harcamaMiktari');
    const harcamaAciklamasiInput = document.getElementById('harcamaAciklamasi');
    const harcamaTarihiInput = document.getElementById('harcamaTarihi');
    const harcamaEkleBtn = document.getElementById('harcamaEkleBtn');
    const harcamaListesiUl = document.getElementById('harcamaListesi');

    // Uygulama Verileri
    let aylikAnaKartButcesi = 0;
    let aylikMultinetButcesi = 0;
    let harcamalar = []; // { kart: 'anaKart'/'multinet', miktar: 100, aciklama: '...', tarih: '2024-05-15' }

    // Tarih Fonksiyonları
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    // Başlangıç Ayarları
    harcamaTarihiInput.value = getTodayDateString();
    bugununTarihiSpan.textContent = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    baslangicAyarlaBtn.addEventListener('click', () => {
        aylikAnaKartButcesi = parseFloat(anaKartBaslangicInput.value) || 0;
        aylikMultinetButcesi = parseFloat(multinetBaslangicInput.value) || 0;
        harcamalar = []; // Yeni ayda harcamaları sıfırla
        localStorage.setItem('aylikAnaKartButcesi', aylikAnaKartButcesi);
        localStorage.setItem('aylikMultinetButcesi', aylikMultinetButcesi);
        localStorage.setItem('harcamalar', JSON.stringify(harcamalar));
        guncelDurumuHesaplaVeGoster();
        harcamaGecmisiniGoster();
        alert('Başlangıç bütçeleri ayarlandı ve hesaplama başlatıldı!');
    });

    // Verileri LocalStorage'dan Yükle
    const verileriYukle = () => {
        const storedAnaKartButcesi = localStorage.getItem('aylikAnaKartButcesi');
        const storedMultinetButcesi = localStorage.getItem('aylikMultinetButcesi');
        const storedHarcamalar = localStorage.getItem('harcamalar');

        if (storedAnaKartButcesi) {
            aylikAnaKartButcesi = parseFloat(storedAnaKartButcesi);
            anaKartBaslangicInput.value = aylikAnaKartButcesi;
        }
        if (storedMultinetButcesi) {
            aylikMultinetButcesi = parseFloat(storedMultinetButcesi);
            multinetBaslangicInput.value = aylikMultinetButcesi;
        }
        if (storedHarcamalar) {
            harcamalar = JSON.parse(storedHarcamalar);
        }
        guncelDurumuHesaplaVeGoster();
        harcamaGecmisiniGoster();
    };

    // Güncel Durumu Hesapla ve Göster
    const guncelDurumuHesaplaVeGoster = () => {
        if (aylikAnaKartButcesi === 0 && aylikMultinetButcesi === 0) {
            // Henüz başlangıç bütçesi ayarlanmamışsa erken çık
            return;
        }

        const bugun = new Date();
        const ayinGunu = bugun.getDate();
        const mevcutAy = bugun.getMonth() + 1; // JavaScript'te aylar 0'dan başlar
        const mevcutYil = bugun.getFullYear();
        const aydakiGunSayisi = getDaysInMonth(mevcutYil, mevcutAy);

        const gunlukAnaKartTemelButce = aylikAnaKartButcesi / aydakiGunSayisi;
        const gunlukMultinetTemelButce = aylikMultinetButcesi / aydakiGunSayisi;

        let toplamAnaKartHarcamasi = 0;
        let toplamMultinetHarcamasi = 0;
        let buguneKadarAnaKartHarcamasi = 0;
        let buguneKadarMultinetHarcamasi = 0;

        harcamalar.forEach(harcama => {
            const harcamaTarihi = new Date(harcama.tarih);
            if (harcama.kart === 'anaKart') {
                toplamAnaKartHarcamasi += harcama.miktar;
                if (harcamaTarihi.getMonth() + 1 === mevcutAy && harcamaTarihi.getFullYear() === mevcutYil && harcamaTarihi.getDate() <= ayinGunu) {
                    buguneKadarAnaKartHarcamasi += harcama.miktar;
                }
            } else if (harcama.kart === 'multinet') {
                toplamMultinetHarcamasi += harcama.miktar;
                if (harcamaTarihi.getMonth() + 1 === mevcutAy && harcamaTarihi.getFullYear() === mevcutYil && harcamaTarihi.getDate() <= ayinGunu) {
                    buguneKadarMultinetHarcamasi += harcama.miktar;
                }
            }
        });

        const aylikKalanAnaKart = aylikAnaKartButcesi - toplamAnaKartHarcamasi;
        const aylikKalanMultinet = aylikMultinetButcesi - toplamMultinetHarcamasi;

        // Bugüne kadarki toplam teorik bütçe
        const buguneKadarTeorikAnaKartButce = gunlukAnaKartTemelButce * ayinGunu;
        const buguneKadarTeorikMultinetButce = gunlukMultinetTemelButce * ayinGunu;

        // Bugüne kadarki toplam kullanılabilir bütçe (devredenlerle birlikte)
        const toplamKullanilabilirAnaKart = buguneKadarTeorikAnaKartButce - buguneKadarAnaKartHarcamasi;
        const toplamKullanilabilirMultinet = buguneKadarTeorikMultinetButce - buguneKadarMultinetHarcamasi;

        // Sadece bugünün bütçesi (dünkü artan veya eksilen dahil değil, saf günlük pay)
        // Ancak, önceki günlerden kalan/eksilen miktarı da hesaba katmalıyız.
        // Bu, "toplamKullanilabilir" ile daha iyi ifade ediliyor.
        // "Bugünkü Bütçe" ifadesini, o gün için ne kadar harcama payı kaldığı şeklinde yorumlayabiliriz.

        // Bir önceki günün sonundaki kullanılabilir bütçeyi bulalım.
        let dunKullanilabilirAnaKart = 0;
        let dunKullanilabilirMultinet = 0;

        if (ayinGunu > 1) {
            const dununTeorikAnaKartButcesi = gunlukAnaKartTemelButce * (ayinGunu - 1);
            const dununTeorikMultinetButcesi = gunlukMultinetTemelButce * (ayinGunu - 1);
            let duneKadarAnaKartHarcamasi = 0;
            let duneKadarMultinetHarcamasi = 0;
            harcamalar.forEach(harcama => {
                const harcamaTarihi = new Date(harcama.tarih);
                 if (harcamaTarihi.getMonth() + 1 === mevcutAy && harcamaTarihi.getFullYear() === mevcutYil && harcamaTarihi.getDate() < ayinGunu) {
                    if (harcama.kart === 'anaKart') duneKadarAnaKartHarcamasi += harcama.miktar;
                    if (harcama.kart === 'multinet') duneKadarMultinetHarcamasi += harcama.miktar;
                 }
            });
            dunKullanilabilirAnaKart = dununTeorikAnaKartButcesi - duneKadarAnaKartHarcamasi;
            dunKullanilabilirMultinet = dununTeorikMultinetButcesi - duneKadarMultinetHarcamasi;
        }


        const bugunHarcanabilirAnaKart = gunlukAnaKartTemelButce + (dunKullanilabilirAnaKart > 0 && ayinGunu > 1 ? dunKullanilabilirAnaKart - (gunlukAnaKartTemelButce * (ayinGunu-1) - dunKullanilabilirAnaKart) : dunKullanilabilirAnaKart);
        const bugunHarcanabilirMultinet = gunlukMultinetTemelButce + (dunKullanilabilirMultinet > 0 && ayinGunu > 1 ? dunKullanilabilirMultinet - (gunlukMultinetTemelButce * (ayinGunu-1) - dunKullanilabilirMultinet) : dunKullanilabilirMultinet);


        // Asıl "Bugünkü Bütçe" (o gün için teorik + devir)
        // Eğer ayın ilk günü ise, sadece günlük temel bütçe
        // Diğer günler için: (günlük temel bütçe) + (bir önceki günün sonunda kalan/eksi bütçe)

        let bugunAnaKartKullanilabilir = gunlukAnaKartTemelButce;
        let bugunMultinetKullanilabilir = gunlukMultinetTemelButce;

        if (ayinGunu > 1) {
            // Bir önceki günün sonundaki durumu hesapla
            let dunAnaKartHarcamasi = 0;
            let dunMultinetHarcamasi = 0;
            harcamalar.forEach(h => {
                const hDate = new Date(h.tarih);
                if (hDate.getFullYear() === mevcutYil && hDate.getMonth() + 1 === mevcutAy && hDate.getDate() === (ayinGunu -1) ) {
                    if (h.kart === 'anaKart') dunAnaKartHarcamasi += h.miktar;
                    if (h.kart === 'multinet') dunMultinetHarcamasi += h.miktar;
                }
            });
            // Dünkü bütçe = dünkü toplam kullanılabilir - dünkü harcama
            // Bu mantık yerine, direkt olarak bugüne kadarki toplam kullanılabilir üzerinden gitmek daha doğru.
        }

        anaKartAylikKalanSpan.textContent = aylikKalanAnaKart.toFixed(2);
        multinetAylikKalanSpan.textContent = aylikKalanMultinet.toFixed(2);

        anaKartGunlukButceSpan.textContent = (toplamKullanilabilirAnaKart - (dunKullanilabilirAnaKart < 0 ? dunKullanilabilirAnaKart : 0) ).toFixed(2); // Basitçe günlük temel payı gösterir
        multinetGunlukButceSpan.textContent = (toplamKullanilabilirMultinet - (dunKullanilabilirMultinet < 0 ? dunKullanilabilirMultinet : 0) ).toFixed(2); // Basitçe günlük temel payı gösterir

        anaKartToplamKullanilabilirSpan.textContent = toplamKullanilabilirAnaKart.toFixed(2);
        multinetToplamKullanilabilirSpan.textContent = toplamKullanilabilirMultinet.toFixed(2);

        // Negatif değerler için stil
        [anaKartGunlukButceSpan, anaKartToplamKullanilabilirSpan, multinetGunlukButceSpan, multinetToplamKullanilabilirSpan].forEach(span => {
            if (parseFloat(span.textContent) < 0) {
                span.classList.add('negatif');
            } else {
                span.classList.remove('negatif');
            }
        });
    };

    // Harcama Ekleme
    harcamaEkleBtn.addEventListener('click', () => {
        const kart = kartSecimiSelect.value;
        const miktar = parseFloat(harcamaMiktariInput.value);
        const aciklama = harcamaAciklamasiInput.value.trim();
        const tarih = harcamaTarihiInput.value;

        if (isNaN(miktar) || miktar <= 0) {
            alert('Lütfen geçerli bir harcama miktarı girin.');
            return;
        }
        if (!tarih) {
            alert('Lütfen harcama tarihini seçin.');
            return;
        }
         if (aylikAnaKartButcesi === 0 && aylikMultinetButcesi === 0) {
            alert('Lütfen önce başlangıç bütçelerini ayarlayın.');
            return;
        }


        const yeniHarcama = { kart, miktar, aciklama, tarih };
        harcamalar.push(yeniHarcama);
        harcamalar.sort((a, b) => new Date(a.tarih) - new Date(b.tarih)); // Tarihe göre sırala

        localStorage.setItem('harcamalar', JSON.stringify(harcamalar));

        guncelDurumuHesaplaVeGoster();
        harcamaGecmisiniGoster();

        // Formu temizle
        harcamaMiktariInput.value = '';
        harcamaAciklamasiInput.value = '';
        harcamaTarihiInput.value = getTodayDateString(); // Bir sonraki harcama için bugünün tarihini ayarla
        kartSecimiSelect.focus();
    });

    // Harcama Geçmişini Göster
    const harcamaGecmisiniGoster = () => {
        harcamaListesiUl.innerHTML = '';
        if (harcamalar.length === 0) {
            harcamaListesiUl.innerHTML = '<li>Henüz harcama yok.</li>';
            return;
        }

        harcamalar.forEach(harcama => {
            const li = document.createElement('li');
            const harcamaTarihi = new Date(harcama.tarih);
            const formatliTarih = harcamaTarihi.toLocaleDateString('tr-TR');

            let aciklamaHtml = '';
            if (harcama.aciklama) {
                aciklamaHtml = `<span class="aciklama"> - ${harcama.aciklama}</span>`;
            }

            li.innerHTML = `
                <span>${harcama.kart === 'anaKart' ? 'Ana Kart' : 'Multinet'}: <span class="tutar">${harcama.miktar.toFixed(2)} TL</span>${aciklamaHtml}</span>
                <span class="tarih">${formatliTarih}</span>
            `;
            harcamaListesiUl.appendChild(li);
        });
    };

    // Sayfa yüklendiğinde verileri yükle
    verileriYukle();
    // Periyodik olarak bugünün tarihini ve bütçeyi güncelle (örneğin her dakika)
    // Bu, gün değiştiğinde arayüzün otomatik güncellenmesini sağlar.
    setInterval(() => {
        bugununTarihiSpan.textContent = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        guncelDurumuHesaplaVeGoster(); // Eğer gün değiştiyse bütçe hesaplamaları da değişir.
    }, 60000); // Her 60 saniyede bir
});