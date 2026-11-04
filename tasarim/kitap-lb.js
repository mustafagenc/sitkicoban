// Kitap verisi ve ayrıntı penceresi: Kitaplar sayfası ve ana sayfa birlikte kullanır
  // role: Sıtkı Bey'in kitaptaki rolü · a: asıl yazar (Sıtkı Bey değilse) · img: kapak (yoksa yazı kapak)
  window.KITAPLAR = [
    { t:'Eskimeyen Şiirimizden Hoş Bir Sada', sub:'Beyitler · Hikmetler · Mısralar', role:'Yazar', img:'kitap-eskimeyen.jpg', pub:'Semerkand',
      d:'Klasik şiirimizin hafızalarda yer etmiş beyitlerini, hikmetli mısralarını ve bunların hikâyelerini bir araya getiren, şiirle sohbet eder gibi okunacak bir seçki.' },
    { t:'Adı Güzel Kendi Güzel', sub:"Peygamberimiz'e (s.a.v.) Şiirler", role:'Hazırlayan', img:'kitap-adi-guzel.jpg', pub:'Semerkand',
      d:'Asırlar boyunca Peygamber Efendimiz için yazılmış na\'tlardan ve şiirlerden yapılmış bir derleme.' },
    { t:'Lemezât-ı Hulviyye', sub:"Ez Lemeât-ı Ulviyye · Halvetî Büyüklerinin Tatlı Hâlleri", role:'Sadeleştiren', a:'Mahmud Cemaleddin el-Hulvî', img:'kitap-lemezat.jpg', pub:'Semerkand',
      d:'Halvetî büyüklerinin hayatlarını ve menkıbelerini anlatan klasik eserin günümüz Türkçesiyle okunabilir hâle getirilmiş baskısı.' },
    { t:'En Sevilen İlahiler', role:'Derleyen', img:'kitap-ilahiler.jpg', pub:'Şadırvan',
      d:'Dillerden düşmeyen ilahilerin sözlerini bir araya getiren cep kitabı.' },
    { t:'Hikmetleriyle Nasreddin Hoca Latifeleri', role:'Hazırlayan', a:'Seyyid Burhaneddin İbn Mevlânâ', img:'kitap-nasreddin.jpg', contain:true,
      d:'Nasreddin Hoca fıkralarını, her birinin ardındaki hikmeti açıklayarak sunan bir derleme.' },
    { t:"Mahmûdü's-Siyer", sub:'Peygamber Efendimizin Hayatı', role:'Hazırlayan',
      d:"Peygamber Efendimiz'in hayatını anlatan klasik siyer eserinin yeni baskısı." },
    { t:'Safahat', role:'Hazırlayan', a:'Mehmed Âkif Ersoy',
      d:"Mehmed Âkif'in şiirlerinin açıklamalı baskısı." },
    { t:"Güzel'i Bulmak", sub:'Hattatların Hâli', role:'Yazar',
      d:'Hattatların hayatlarından, meşk geleneğinden ve güzeli arayışlarından hikâyeler.' },
    { t:"Mesnevî'de Geçen Hikâyeler", role:'Hazırlayan', img:'kitap-mesnevi.jpg', pub:'Ravza',
      d:"Mevlânâ'nın Mesnevî'sindeki hikâyelerin sade bir dille anlatımı." },
    { t:'Yolumuzu Aydınlatan Kandil', role:'Yazar', pub:'Semerkand',
      d:'Kandil geceleri ve mübarek günler üzerine yazılar.' },
  ];
  window.kitapEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  window.kitapKapak = b => b.img
    ? `<img src="img/${b.img}" alt="${kitapEsc(b.t)} kapağı" class="${b.contain ? 'contain' : ''}" loading="lazy">`
    : `<div class="tcover"><span class="o">❖</span><span class="t">${kitapEsc(b.t)}</span><span class="a">${kitapEsc(b.a || 'Sıtkı Çoban')}</span></div>`;

(() => {
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
  <div class="sheet">
    <button class="circle x" id="m-close" aria-label="Kapat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div class="left"><div class="cover" id="m-cover"></div></div>
    <div class="right" id="m-body"></div>
  </div>
</div>`);
  const books = window.KITAPLAR, esc = kitapEsc, coverHtml = kitapKapak;
  const modal = document.getElementById('modal'); let list = [], cur = 0;
  const row = (k, v) => `<dt>${k}</dt><dd class="${v ? '' : 'none'}">${v ? esc(v) : 'Bilgi girilecek'}</dd>`;
  // cur: list içindeki sıra; list: gezinilecek kitapların KITAPLAR içindeki sıraları
  function show(k){
    cur = k; const b = books[list[k]];
    document.getElementById('m-cover').innerHTML = coverHtml(b);
    document.getElementById('m-body').innerHTML = `
      <div class="eyebrow">${b.role}</div>
      <h2 id="m-title">${esc(b.t)}</h2>
      <div class="by">${b.sub ? esc(b.sub) + '<br>' : ''}${b.a ? esc(b.a) + ' · ' + b.role.toLowerCase() + ': Sıtkı Çoban' : 'Sıtkı Çoban'}</div>
      <p class="desc">${esc(b.d)}</p>
      <dl>${row('Yayınevi', b.pub)}${row('Yıl', b.yil)}${row('Sayfa', b.sayfa)}${row('ISBN', b.isbn)}</dl>
      <a class="btn primary" href="#">Satın al →</a><a class="btn" href="yazilar.html">İlgili yazılar</a>
      ${list.length > 1 ? `<div class="sheet-nav"><button id="m-prev">← Önceki kitap</button><button id="m-next">Sonraki kitap →</button></div>` : ''}`;
    if (list.length > 1) {
      document.getElementById('m-prev').onclick = () => show((cur - 1 + list.length) % list.length);
      document.getElementById('m-next').onclick = () => show((cur + 1) % list.length);
    }
  }
  const open = (liste, i) => { list = liste; show(Math.max(0, list.indexOf(i))); modal.classList.add('open'); document.body.style.overflow = 'hidden'; document.getElementById('m-close').focus(); };
  const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('m-close').onclick = close;
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show((cur + 1) % list.length); else if (e.key === 'ArrowLeft') show((cur - 1 + list.length) % list.length);
  });
  window.kitapAc = open;
})();
