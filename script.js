// Şu anki saati al (0 ile 23 arasında bir sayı)
const saat = new Date().getHours();

// Eğer saat 06:00 ile 17:00 arasındaysa kahve teması, değilse burger teması
let tema;
if (saat >= 6 && saat < 17) {
  tema = "gunduz";
} else {
  tema = "aksam";
}

// Seçilen temayı sayfaya uygula
document.body.dataset.tema = tema;

// Sitenin dili: "tr" ya da "en" (aşağıdaki DİL bölümü değiştirir)
let dil = "tr";

// Günün ritmi: açılıştan (08:00) kapanışa (24:00) günün ne kadarı geçti?
const simdi = new Date();
const dakika = simdi.getHours() * 60 + simdi.getMinutes(); // gece yarısından beri geçen dakika
const acilis = 8 * 60;
const kapanis = 24 * 60;
const saatYazisi = String(simdi.getHours()).padStart(2, "0") + ":" + String(simdi.getMinutes()).padStart(2, "0");

let yuzde = (dakika - acilis) / (kapanis - acilis) * 100;
if (yuzde < 0) {
  yuzde = 0;
}

// Ritim cümlesini seçili dile göre yaz
function ritmiYaz() {
  let durum;
  if (dakika < acilis) {
    durum = dil === "en" ? "We're closed now, see you at 08:00." : "Şu an kapalıyız, 08:00'de görüşürüz.";
  } else {
    durum = dil === "en"
      ? "It's " + saatYazisi + " and we're open. This much of the day has passed:"
      : "Şu an saat " + saatYazisi + ", açığız. Günün bu kadarı geride kaldı:";
  }
  document.getElementById("ritim-durum").textContent = durum;
}

ritmiYaz();
// Çubuk, sayfa açıldıktan kısa süre sonra dolsun (dolma hareketi görünsün diye)
setTimeout(function () {
  document.getElementById("ritim-dolu").style.width = yuzde + "%";
}, 300);

// Fare karşılama alanında gezerken arka plan fotoğrafı hafifçe ters yöne kayar (derinlik hissi)
const karsilama = document.querySelector(".karsilama");
const gorsel = document.querySelector(".karsilama-arka");

let bekleyenKare = false;

karsilama.addEventListener("mousemove", function (olay) {
  // Fare saniyede yüzlerce kez hareket bildirir; ekran ise saniyede ~60 kez çizilir.
  // Bu yüzden her çizimde sadece bir kez hesaplıyoruz.
  if (bekleyenKare) return;
  bekleyenKare = true;

  requestAnimationFrame(function () {
    const alan = karsilama.getBoundingClientRect();
    // Farenin yeri: ortada 0, kenarlarda -1 ile 1 arası
    const x = (olay.clientX - alan.left) / alan.width * 2 - 1;
    const y = (olay.clientY - alan.top) / alan.height * 2 - 1;
    gorsel.style.setProperty("--fare-x", x);
    gorsel.style.setProperty("--fare-y", y);
    bekleyenKare = false;
  });
});

karsilama.addEventListener("mouseleave", function () {
  gorsel.style.setProperty("--fare-x", 0);
  gorsel.style.setProperty("--fare-y", 0);
});

// Kaydırınca beliren bölümler: ekrana giren bölüme "gorundu" sınıfı eklenir
document.documentElement.classList.add("hareketli");

const gozcu = new IntersectionObserver(function (girdiler) {
  girdiler.forEach(function (girdi) {
    if (girdi.isIntersecting) {
      girdi.target.classList.add("gorundu");
      gozcu.unobserve(girdi.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".belir").forEach(function (bolum) {
  gozcu.observe(bolum);
});

// ============================================
// TEMA BUTONU: gündüz / akşam arasında elle geçiş
// Butonun yazısı, geçilecek temayı gösterir.
// ============================================

const temaButonu = document.getElementById("tema-butonu");

function temaButonunuYaz() {
  if (document.body.dataset.tema === "gunduz") {
    temaButonu.textContent = dil === "en" ? "🌙 Evening mode" : "🌙 Akşama geç";
  } else {
    temaButonu.textContent = dil === "en" ? "☀️ Day mode" : "☀️ Gündüze geç";
  }
}

temaButonu.addEventListener("click", function () {
  if (document.body.dataset.tema === "gunduz") {
    document.body.dataset.tema = "aksam";
  } else {
    document.body.dataset.tema = "gunduz";
  }
  temaButonunuYaz();
});

temaButonunuYaz();

// ============================================
// DİL (TR / EN)
// İngilizcesi olan her parçada HTML'de data-en="..." yazıyor.
// Türkçesini sayfa açılınca data-tr'ye saklıyoruz, sonra ikisi arasında geçiyoruz.
// ============================================

const dilButonu = document.getElementById("dil-butonu");
const cevrilenYazilar = document.querySelectorAll("[data-en]");
const cevrilenResimler = document.querySelectorAll("[data-en-alt]");

cevrilenYazilar.forEach(function (parca) {
  parca.dataset.tr = parca.textContent;
});
cevrilenResimler.forEach(function (resim) {
  resim.dataset.trAlt = resim.alt;
});

function diliUygula(yeniDil) {
  dil = yeniDil;
  document.documentElement.lang = dil;

  cevrilenYazilar.forEach(function (parca) {
    parca.textContent = dil === "en" ? parca.dataset.en : parca.dataset.tr;
  });
  cevrilenResimler.forEach(function (resim) {
    resim.alt = dil === "en" ? resim.dataset.enAlt : resim.dataset.trAlt;
  });

  document.title = dil === "en" ? "Duble — Coffee & Burgers · Ankara" : "Duble — Kahve & Burger · Ankara";
  dilButonu.textContent = dil === "en" ? "TR" : "EN"; // buton, geçilecek dili gösterir
  ritmiYaz();
  temaButonunuYaz();

  // Seçimi hatırla (tarayıcı izin vermezse sorun değil, site yine çalışır)
  try {
    localStorage.setItem("duble-dil", dil);
  } catch (hata) {}
}

dilButonu.addEventListener("click", function () {
  diliUygula(dil === "en" ? "tr" : "en");
});

// Ziyaretçi daha önce İngilizce seçtiyse öyle aç
try {
  if (localStorage.getItem("duble-dil") === "en") {
    diliUygula("en");
  }
} catch (hata) {}
