const oyun = document.getElementById('oyun');
const kus = document.getElementById('kus');
const puanElement = document.getElementById('puan');
const baslatEkrani = document.getElementById('baslat-ekrani');

let kusKonumu = 250;
let hiz = 0;
let puan = 0;
let oyunBasladi = false;
let oyunBitti = false;

const yerCekimi = 0.2;
const ziplamaGucu = -5;
const boruHizi = 1.5;
const boruAraligi = 250;

let borular = [];

const kitapTipleri = [
    'giris',
    'statik',
    'elektroteknik',
    'malzeme2',
    'akiskanlar1',
    'mukavemet1',
    'mukavemet2',
    'termodinamik1',
    'akiskanlar2',
    'isi-transferi',
    'makine-elemanlari1',
    'termodinamik2',
    'makine-elemanlari2'
];

let kitapIndex = 0;

let enYuksekSkor = 0;

let canHakki = 2; // Toplam 2 can (1 ekstra can)
let oyunYenidenBasliyor = false;

// Style.css'e eklenecek sınıflar için ders isimleri
const dersIsimleri = {
    'giris': 'Makine Mühendisliğine Giriş',
    'statik': 'Statik',
    'elektroteknik': 'Elektroteknik ve Elektrik Makineleri',
    'malzeme2': 'Malzeme Bilgisi II',
    'akiskanlar1': 'Akışkanlar Mekaniği I',
    'mukavemet1': 'Mukavemet I',
    'mukavemet2': 'Mukavemet II',
    'termodinamik1': 'Termodinamik I',
    'akiskanlar2': 'Akışkanlar Mekaniği II',
    'isi-transferi': 'Isı Transferi I',
    'makine-elemanlari1': 'Makine Elemanları I',
    'termodinamik2': 'Termodinamik II',
    'makine-elemanlari2': 'Makine Elemanları II'
};

function oyunuBaslat() {
    if (!oyunBasladi && !oyunBitti) {
        oyunBasladi = true;
        baslatEkrani.style.display = 'none';
        oyunDongusu();
        boruOlustur();
    }
}

function ziplamaYap() {
    if (oyunBasladi && !oyunBitti) {
        hiz = ziplamaGucu;
    }
}

function boruOlustur() {
    if (!oyunBasladi) return;

    const boruYukseklik = Math.random() * 150 + 150;
    
    const ustBoru = document.createElement('div');
    ustBoru.className = 'boru ' + kitapTipleri[kitapIndex];
    ustBoru.style.height = boruYukseklik + 'px';
    ustBoru.style.top = '0';
    ustBoru.style.right = '-60px';
    
    // Ders ismini ekle
    const dersIsmi = document.createElement('div');
    dersIsmi.className = 'ders-ismi';
    dersIsmi.textContent = dersIsimleri[kitapTipleri[kitapIndex]];
    ustBoru.appendChild(dersIsmi);
    
    const altBoru = document.createElement('div');
    altBoru.className = 'boru ' + kitapTipleri[kitapIndex];
    altBoru.style.height = (600 - boruYukseklik - boruAraligi) + 'px';
    altBoru.style.bottom = '0';
    altBoru.style.right = '-60px';
    
    oyun.appendChild(ustBoru);
    oyun.appendChild(altBoru);
    
    borular.push({
        ust: ustBoru,
        alt: altBoru,
        gecildi: false
    });

    kitapIndex = (kitapIndex + 1) % kitapTipleri.length;
    
    if (oyunBasladi && !oyunBitti) {
        setTimeout(boruOlustur, 4000);
    }
}

function oyunDongusu() {
    if (!oyunBasladi) return;

    hiz += yerCekimi;
    kusKonumu += hiz;
    kus.style.top = kusKonumu + 'px';

    borular.forEach((boru, index) => {
        const boruX = parseInt(boru.ust.style.right || '-60');
        const yeniX = boruX + boruHizi;
        boru.ust.style.right = yeniX + 'px';
        boru.alt.style.right = yeniX + 'px';

        if (!boru.gecildi && yeniX > 280) {
            boru.gecildi = true;
            puan++;
            puanElement.textContent = `Skor: ${puan} | En Yüksek: ${enYuksekSkor} | Can: ${canHakki}`;
            
            if (puan >= 30) {
                oyunuBitir();
                return;
            }
        }

        if (yeniX > 240 && yeniX < 340) {
            const kusUst = kusKonumu + 10;
            const kusAlt = kusKonumu + 30;
            const boruUstAlt = parseInt(boru.ust.style.height);
            const boruAltUst = 600 - parseInt(boru.alt.style.height);

            if (kusUst < boruUstAlt - 10 || kusAlt > boruAltUst + 10) {
                oyunuBitir();
            }
        }

        if (yeniX > 460) {
            oyun.removeChild(boru.ust);
            oyun.removeChild(boru.alt);
            borular.splice(index, 1);
        }
    });

    if (kusKonumu < -30 || kusKonumu > 590) {
        oyunuBitir();
        return;
    }

    if (!oyunBitti) {
        requestAnimationFrame(oyunDongusu);
    }
}

function oyunuBitir() {
    if (canHakki > 0) {
        canHakki--;
        let mevcutPuan = puan;
        
        // Büt mesajı
        baslatEkrani.innerHTML = `
            <div style="text-align: center;">
                <p style="font-size: 24px; margin-bottom: 20px;">📚 BÜTE GİRDİN!</p>
                <p style="margin-bottom: 20px; color: #d63031;">Son hakkın, dikkatli ol!</p>
                <button id="yenidenDene" style="
                    padding: 10px 20px;
                    font-size: 18px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                ">BÜTE GİR</button>
            </div>
        `;
        baslatEkrani.style.display = 'block';
        
        // Yeniden deneme butonu için event listener
        document.getElementById('yenidenDene').addEventListener('click', () => {
            oyunYenidenBaslat(mevcutPuan);
        });
        
    } else {
        oyunBitti = true;
        oyunBasladi = false;
        if (puan > enYuksekSkor) {
            enYuksekSkor = puan;
        }
        
        let mesaj;
        if (puan >= 30) {
            mesaj = '🎓 TEBRİKLER!<br>OKUL 4 YILDA BİTTİ!';
        } else {
            mesaj = '😅 OKUL UZADI!<br>Seneye tekrar dene!';
        }
        
        // Final ekranı
        baslatEkrani.innerHTML = `
            <div style="text-align: center;">
                <p style="font-size: 24px; margin-bottom: 20px;">${mesaj}</p>
                <p style="margin-bottom: 20px;">Skor: ${puan} | En Yüksek: ${enYuksekSkor}</p>
                <button id="yeniOyun" style="
                    padding: 10px 20px;
                    font-size: 18px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                ">YENİDEN DENE</button>
            </div>
        `;
        baslatEkrani.style.display = 'block';
        
        // Yeni oyun butonu için event listener
        document.getElementById('yeniOyun').addEventListener('click', () => {
            canHakki = 2;
            puan = 0;
            oyunBitti = false;
            puanElement.textContent = `Skor: 0 | En Yüksek: ${enYuksekSkor} | Can: ${canHakki}`;
            oyunuBaslat();
        });
    }
}

function oyunYenidenBaslat(mevcutPuan) {
    kusKonumu = 250;
    hiz = 0;
    kus.style.top = kusKonumu + 'px';
    
    borular.forEach(boru => {
        oyun.removeChild(boru.ust);
        oyun.removeChild(boru.alt);
    });
    borular = [];
    
    puan = mevcutPuan;
    oyunBitti = false;
    puanElement.textContent = `Skor: ${puan} | En Yüksek: ${enYuksekSkor} | Can: ${canHakki}`;
    
    setTimeout(() => {
        baslatEkrani.style.display = 'none';
        oyunBasladi = true;
        oyunDongusu();
        boruOlustur();
    }, 1000);
}

function puanGuncelle() {
    puanElement.textContent = `Skor: ${puan} | En Yüksek: ${enYuksekSkor} | Can: ${canHakki}`;
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!oyunBasladi && !oyunBitti) {
            oyunuBaslat();
        }
        ziplamaYap();
    }
});

baslatEkrani.addEventListener('click', () => {
    if (!oyunBasladi) {
        canHakki = 2;
        puan = 0;
        oyunBitti = false;
        puanElement.textContent = `Skor: 0 | En Yüksek: ${enYuksekSkor} | Can: ${canHakki}`;
        oyunuBaslat();
    }
});

oyun.addEventListener('click', ziplamaYap);

puanElement.textContent = `Skor: 0 | En Yüksek: 0 | Can: ${canHakki}`; 
oyun.addEventListener('click', ziplamaYap); 

// Başlangıç ekranını da güncelleyelim
baslatEkrani.innerHTML = `
    <div style="text-align: center;">
        <p style="font-size: 24px; margin-bottom: 20px;">Flappy Mühendis</p>
        <button id="baslatButon" style="
            padding: 10px 20px;
            font-size: 18px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        ">BAŞLA</button>
        <p style="margin-top: 20px;">Boşluk tuşu veya tıklama ile zıpla</p>
    </div>
`;

// Başlat butonu için event listener
document.getElementById('baslatButon').addEventListener('click', () => {
    if (!oyunBasladi) {
        canHakki = 2;
        puan = 0;
        oyunBitti = false;
        puanElement.textContent = `Skor: 0 | En Yüksek: ${enYuksekSkor} | Can: ${canHakki}`;
        oyunuBaslat();
    }
});

// Buton hover efekti için CSS
const style = document.createElement('style');
style.textContent = `
    button:hover {
        background-color: #45a049 !important;
        transform: scale(1.05);
        transition: all 0.2s;
    }
`;
document.head.appendChild(style);

// Mobil kontroller için dokunma olayları
document.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Varsayılan dokunma davranışını engelle
    if (!oyunBasladi && !oyunBitti) {
        oyunuBaslat();
    }
    ziplamaYap();
}, { passive: false });

// Çift dokunma yakınlaştırmasını engelle
document.addEventListener('dblclick', function(e) {
    e.preventDefault();
});

// Mobil cihazlarda yeniden boyutlandırma için
window.addEventListener('resize', function() {
    const oyunAlani = document.getElementById('oyun');
    const containerHeight = window.innerHeight * 0.8;
    oyunAlani.style.height = containerHeight + 'px';
});

// Oyun alanını mobil cihaza göre ayarla
window.addEventListener('load', function() {
    const oyunAlani = document.getElementById('oyun');
    const containerHeight = window.innerHeight * 0.8;
    oyunAlani.style.height = containerHeight + 'px';
}); 