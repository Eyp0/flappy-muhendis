const oyun = document.getElementById('oyun');
const kus = document.getElementById('kus');
const puanEl = document.getElementById('puan');
const baslatEkrani = document.getElementById('baslat-ekrani');

let oyunCalisiyor = false;
let puan = 0;
let can = 2;

let kusYuksekligi = 250;
let kusHiz = 0;
const yercekimi = 0.2;
const ziplaGucu = -4.5;
const maxDusmeHizi = 7;

const boruHizi = 1.5;
const boruAraligi = 200;
const boruUstBoslukMin = 80;
const boruUstBoslukMax = 200;

let borular = [];
let sonBoruX = 0;

// Yeni eklenen değişken: çarpışma sonrası kısa bir süre dokunulmazlık sağlar
let geciciDokunulmazlik = false;
let dokunulmazlikSuresi = 1000; // 1 saniye (milisaniye cinsinden)

const boruDersleri = [
    "MUKAVEMET",
    "TERMODİNAMİK",
    "MAKİNE ELEMANLARI",
    "ISI MEKANİĞİ",
    "ELEKTROTEKNİK",
    "AKIŞKANLAR",
];

function baslat() {
    if (oyunCalisiyor && can > 0 && baslatEkrani.style.display === 'none') {
        return;
    }

    baslatEkrani.style.display = 'none';

    oyunCalisiyor = true;
    puan = 0;
    puanEl.textContent = puan;
    can = 2; // Her yeni oyunda canı sıfırla

    kusYuksekligi = 250;
    kusHiz = 0;
    kus.style.top = kusYuksekligi + 'px';
    kus.style.transform = `rotate(0deg)`;

    borular.forEach(boru => {
        boru.element.remove();
        boru.ustElement.remove();
    });
    borular = [];

    // Başlangıçta 3 boru oluştur. İlk boru oyun alanının sağından başlasın.
    for (let i = 0; i < 3; i++) {
        borular.push(createBoru(oyun.clientWidth + i * boruAraligi));
    }
    // `sonBoruX`'i en son eklenen borunun konumu olarak güncelle.
    sonBoruX = borular[borular.length - 1].x;

    // Oyunu başlattığımızda dokunulmazlığı sıfırla
    geciciDokunulmazlik = false;

    oyunDongusu();
}

function createBoru(x) {
    const boru = document.createElement('div');
    boru.classList.add('boru');
    oyun.appendChild(boru);

    const ustBoru = document.createElement('div');
    ustBoru.classList.add('boru');
    oyun.appendChild(ustBoru);

    const boruBosluguYuksekligi = boruUstBoslukMin + Math.random() * (boruUstBoslukMax - boruUstBoslukMin);
    const minBoruYuksekligi = 50;

    const altBoruYuksekligi = minBoruYuksekligi + Math.random() * (oyun.clientHeight - boruBosluguYuksekligi - 2 * minBoruYuksekligi);
    const ustBoruYuksekligi = oyun.clientHeight - altBoruYuksekligi - boruBosluguYuksekligi;

    boru.style.height = altBoruYuksekligi + 'px';
    boru.style.left = x + 'px';
    boru.style.bottom = '0';

    ustBoru.style.height = ustBoruYuksekligi + 'px';
    ustBoru.style.left = x + 'px';
    ustBoru.style.top = '0';

    const dersIndex = Math.floor(Math.random() * boruDersleri.length);
    boru.textContent = boruDersleri[dersIndex];
    ustBoru.textContent = boruDersleri[dersIndex];

    return {
        element: boru,
        ustElement: ustBoru,
        x: x,
        altYukseklik: altBoruYuksekligi,
        ustYukseklik: ustBoruYuksekligi,
        gecildi: false
    };
}

function oyunDongusu() {
    if (!oyunCalisiyor) return;

    kusHiz += yercekimi;
    if (kusHiz > maxDusmeHizi) {
        kusHiz = maxDusmeHizi;
    }
    kusYuksekligi += kusHiz;

    if (kusYuksekligi < 0) {
        kusYuksekligi = 0;
        kusHiz = 0;
    }
    if (kusYuksekligi > oyun.clientHeight - kus.clientHeight) {
        kusYuksekligi = oyun.clientHeight - kus.clientHeight;
        carpismaIslemi();
        return;
    }

    kus.style.top = kusYuksekligi + 'px';

    const derece = Math.min(Math.max(kusHiz * 6, -30), 90);
    kus.style.transform = `rotate(${derece}deg)`;

    let yeniBoruEklendi = false;

    for (let i = 0; i < borular.length; i++) {
        let boru = borular[i];
        boru.x -= boruHizi;

        boru.element.style.left = boru.x + 'px';
        boru.ustElement.style.left = boru.x + 'px';

        // Boru ekranın solundan tamamen çıktıysa kaldır
        if (boru.x + boru.element.offsetWidth < 0) {
            boru.element.remove();
            boru.ustElement.remove();
            borular.splice(i, 1);
            i--;
        }

        // Puanlama kontrolü ve yeni boru ekleme
        const kusSol = kus.getBoundingClientRect().left;
        const boruSag = boru.element.getBoundingClientRect().right;

        // Kuş borunun sağını geçtiyse (yani boruyu geçtiyse) ve daha önce geçilmediyse puan ver
        if (kusSol > boruSag && !boru.gecildi) {
            puan++;
            puanEl.textContent = puan;
            boru.gecildi = true; // Bu borunun geçildiğini işaretle

            // Yeni boru ekleme mantığı:
            // Sadece tek bir yeni boru eklenmesini sağlamak ve boru aralığını korumak için.
            // Eğer yeterince boru yoksa veya en son boruya yaklaştıysak yeni bir tane ekle.
            if (borular.length < 3 && !yeniBoruEklendi) { // Ekrandaki boru sayısını kontrol et
                const yeniBoruKonumu = sonBoruX + boruAraligi;
                borular.push(createBoru(yeniBoruKonumu));
                sonBoruX = yeniBoruKonumu; // `sonBoruX` değerini güncelle
                yeniBoruEklendi = true; // Bu döngüde bir boru eklendi
            }
        }
    }

    // Çarpışma kontrolü sadece dokunulmazlık aktif değilken çalışsın
    if (!geciciDokunulmazlik && carpismaKontrol()) {
        carpismaIslemi();
        return;
    }

    requestAnimationFrame(oyunDongusu);
}

function carpismaKontrol() {
    const kusRect = kus.getBoundingClientRect();

    for (let boru of borular) {
        const altBoruRect = boru.element.getBoundingClientRect();
        const ustBoruRect = boru.ustElement.getBoundingClientRect();

        // Boru ekranın dışındaysa kontrol etme
        if (altBoruRect.right < 0) continue;

        // Yatayda temas kontrolü
        if (kusRect.right > altBoruRect.left && kusRect.left < altBoruRect.right) {
            // Dikeyde temas kontrolü
            if (kusRect.bottom > altBoruRect.top || kusRect.top < ustBoruRect.bottom) {
                return true;
            }
        }
    }
    return false;
}

function carpismaIslemi() {
    if (geciciDokunulmazlik) return; // Zaten dokunulmazsa tekrar işlem yapma

    can--; // Canı bir azalt

    if (can === 1) {
        oyunCalisiyor = false; // Oyunu geçici olarak durdur
        baslatEkrani.style.display = 'flex';
        baslatEkrani.textContent = `Büte Kaldın! Puanın: ${puan}\nDevam etmek için tıkla.`;

        // Kuşu çarptığı yerden biraz yukarı fırlat
        kusHiz = ziplaGucu * 2;
        // Kuşun borudan çıktığından emin olmak için konumunu ayarla
        // Bu, özellikle zemine veya boruya sıkışmasını engeller
        kusYuksekligi -= 20; // Hafifçe yukarı kaydır

        // Kısa süreli dokunulmazlık ver
        geciciDokunulmazlik = true;
        setTimeout(() => {
            geciciDokunulmazlik = false;
            // Dokunulmazlık bittiğinde oyun hala duraklatılmışsa (yani kullanıcı tıklamadıysa)
            // burada ek bir kontrol yapabiliriz, ancak `kusZipla` zaten bunu hallediyor.
        }, dokunulmazlikSuresi);

    } else if (can === 0) {
        oyunCalisiyor = false; // Oyun tamamen bitti
        baslatEkrani.style.display = 'flex';
        baslatEkrani.textContent = `Okul Uzadı! Puanın: ${puan}\nTekrar başlamak için tıkla.`;
        geciciDokunulmazlik = false; // Oyun bittiğinde dokunulmazlığı sıfırla
    }
}

function kusZipla() {
    if (!oyunCalisiyor) {
        if (can === 1 && baslatEkrani.style.display === 'flex') {
            // "Büte Kaldın" ekranı açıkken zıplama ile oyuna devam et
            baslatEkrani.style.display = 'none';
            oyunCalisiyor = true;
            geciciDokunulmazlik = false; // Dokunulmazlığı kaldır, çünkü kullanıcı devam etti
            oyunDongusu(); // Oyun döngüsünü kaldığı yerden devam ettir
        } else if (can === 0 && baslatEkrani.style.display === 'flex') {
            return; // Oyun bitmişse zıplama değil, başlatma ekranı tıklaması gerekli
        } else {
            return; // Oyun henüz başlamamışsa (ilk ekran) veya başka bir durumsa zıplamayı engelle
        }
    }
    kusHiz = ziplaGucu; // Kuşa yukarı doğru hız ver
}

baslatEkrani.addEventListener('click', () => {
    if (can === 0) {
        baslat();
    } else if (can === 1 && baslatEkrani.style.display === 'flex') {
        baslatEkrani.style.display = 'none';
        oyunCalisiyor = true;
        geciciDokunulmazlik = false; // Dokunulmazlığı kaldır
        oyunDongusu();
    } else {
        baslat();
    }
});

window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        e.preventDefault();
        kusZipla();
    }
});

window.addEventListener('touchstart', e => {
    e.preventDefault();
    kusZipla();
});