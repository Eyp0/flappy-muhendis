let oyun = document.getElementById('oyun');
let kus = document.getElementById('kus');
let puanYazisi = document.getElementById('puan');
let baslatEkrani = document.getElementById('baslat-ekrani');

let oyunBasladiMi = false;
let puan = 0;
let can = 2;
let y = 250;
let hiz = 0;
let dokunulmazMi = false;
let borular = [];
let sonBoruX = 0;

let dersler = ["MUKAVEMET", "TERMODİNAMİK", "MAKİNE ELEMANLARI", "ISI MEKANİĞİ", "ELEKTROTEKNİK", "AKIŞKANLAR"];

function oyunuBaslat() {
    baslatEkrani.style.display = 'none';
    oyunBasladiMi = true;
    puan = 0;
    puanYazisi.textContent = puan;
    can = 2;
    y = 250;
    hiz = 0;
    kus.style.top = y + 'px';
    kus.style.transform = 'rotate(0deg)';
    
    for (let i = 0; i < borular.length; i++) {
        borular[i].element.remove();
        borular[i].ustElement.remove();
    }
    borular = [];
    
    boruOlustur(oyun.clientWidth);
    boruOlustur(oyun.clientWidth + 200);
    boruOlustur(oyun.clientWidth + 400);
    sonBoruX = borular[borular.length - 1].x;
    
    dokunulmazMi = false;
    oyunDongusuBaslat();
}

function boruOlustur(xKonumu) {
    let altBoru = document.createElement('div');
    altBoru.classList.add('boru');
    oyun.appendChild(altBoru);
    
    let ustBoru = document.createElement('div');
    ustBoru.classList.add('boru');
    oyun.appendChild(ustBoru);
    
    let bosluk = 80 + Math.random() * 120;
    let altYukseklik = 50 + Math.random() * (oyun.clientHeight - bosluk - 100);
    let ustYukseklik = oyun.clientHeight - altYukseklik - bosluk;
    
    altBoru.style.height = altYukseklik + 'px';
    altBoru.style.left = xKonumu + 'px';
    altBoru.style.bottom = '0';
    
    ustBoru.style.height = ustYukseklik + 'px';
    ustBoru.style.left = xKonumu + 'px';
    ustBoru.style.top = '0';
    
    let rasgeleDers = Math.floor(Math.random() * dersler.length);
    altBoru.textContent = dersler[rasgeleDers];
    ustBoru.textContent = dersler[rasgeleDers];
    
    borular.push({
        element: altBoru,
        ustElement: ustBoru,
        x: xKonumu,
        altYukseklik: altYukseklik,
        ustYukseklik: ustYukseklik,
        gecildi: false
    });
}

function oyunDongusuBaslat() {
    if (!oyunBasladiMi) return;
    
    hiz += 0.2;
    if (hiz > 7) hiz = 7;
    y += hiz;
    
    if (y < 0) {
        y = 0;
        hiz = 0;
    }
    if (y > oyun.clientHeight - kus.clientHeight) {
        y = oyun.clientHeight - kus.clientHeight;
        carpti();
        return;
    }
    
    kus.style.top = y + 'px';
    
    let aci = hiz * 6;
    if (aci < -30) aci = -30;
    if (aci > 90) aci = 90;
    kus.style.transform = 'rotate(' + aci + 'deg)';
    
    let boruEklendi = false;
    for (let i = 0; i < borular.length; i++) {
        let boru = borular[i];
        boru.x -= 1.5;
        boru.element.style.left = boru.x + 'px';
        boru.ustElement.style.left = boru.x + 'px';
        
        if (boru.x + boru.element.offsetWidth < 0) {
            boru.element.remove();
            boru.ustElement.remove();
            borular.splice(i, 1);
            i--;
        }
        
        let kusSol = kus.getBoundingClientRect().left;
        let boruSag = boru.element.getBoundingClientRect().right;
        
        if (kusSol > boruSag && !boru.gecildi) {
            puan++;
            puanYazisi.textContent = puan;
            boru.gecildi = true;
            
            if (borular.length < 3 && !boruEklendi) {
                let yeniKonum = sonBoruX + 200;
                boruOlustur(yeniKonum);
                sonBoruX = yeniKonum;
                boruEklendi = true;
            }
        }
    }
    
    if (!dokunulmazMi && carpismaKontrolEt()) {
        carpti();
        return;
    }
    
    requestAnimationFrame(oyunDongusuBaslat);
}

function carpismaKontrolEt() {
    let kusKutusu = kus.getBoundingClientRect();
    
    for (let i = 0; i < borular.length; i++) {
        let boru = borular[i];
        let altBoruKutusu = boru.element.getBoundingClientRect();
        let ustBoruKutusu = boru.ustElement.getBoundingClientRect();
        
        if (altBoruKutusu.right < 0) continue;
        
        if (kusKutusu.right > altBoruKutusu.left && kusKutusu.left < altBoruKutusu.right) {
            if (kusKutusu.bottom > altBoruKutusu.top || kusKutusu.top < ustBoruKutusu.bottom) {
                return true;
            }
        }
    }
    return false;
}

function carpti() {
    if (dokunulmazMi) return;
    
    can--;
    
    if (can == 1) {
        oyunBasladiMi = false;
        baslatEkrani.style.display = 'flex';
        baslatEkrani.textContent = 'Büte Kaldın! Puanın: ' + puan + '\nDevam etmek için tıkla.';
        hiz = -9;
        y -= 20;
        dokunulmazMi = true;
        setTimeout(() => dokunulmazMi = false, 1000);
    } else if (can == 0) {
        oyunBasladiMi = false;
        baslatEkrani.style.display = 'flex';
        baslatEkrani.textContent = 'Okul Uzadı! Puanın: ' + puan + '\nTekrar başlamak için tıkla.';
        dokunulmazMi = false;
    }
}

function zipla() {
    if (!oyunBasladiMi) {
        if (can == 1 && baslatEkrani.style.display == 'flex') {
            baslatEkrani.style.display = 'none';
            oyunBasladiMi = true;
            dokunulmazMi = false;
            oyunDongusuBaslat();
        }
        return;
    }
    hiz = -4.5;
}

baslatEkrani.addEventListener('click', () => {
    if (can == 0) {
        oyunuBaslat();
    } else if (can == 1 && baslatEkrani.style.display == 'flex') {
        baslatEkrani.style.display = 'none';
        oyunBasladiMi = true;
        dokunulmazMi = false;
        oyunDongusuBaslat();
    } else {
        oyunuBaslat();
    }
});

window.addEventListener('keydown', e => {
    if (e.code == 'Space') {
        e.preventDefault();
        zipla();
    }
});

window.addEventListener('touchstart', e => {
    e.preventDefault();
    zipla();
});