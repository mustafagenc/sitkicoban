// Eser verisi ve tam sayfa eser görüntüleyici: Eserler sayfası ve ana sayfa birlikte kullanır
  // Örnek veri: yazı türleri tahminidir, Sıtkı Bey'in teyidi gerekir
  // ar: eserin metni · mean: anlamı · src: kaynağı · desc: kısa açıklama · olcu, malzeme, tezhip, ebru
  window.ESERLER = [
    { f:'e-hilye.jpg',          r:.75, t:'Hilye-i Şerif',                  yazi:['Sülüs','Nesih'], tur:'Hilye',
      desc:"Peygamber Efendimiz'in (s.a.v.) dış görünüşünü ve güzel ahlâkını anlatan metnin klasik hilye düzeninde yazılmış hâli. Başlıkta besmele, göbekte hilye metni, köşelerde dört halifenin isimleri yer alır.",
      ar:'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِلْعَالَمِينَ', mean:'Biz seni ancak âlemlere rahmet olarak gönderdik.', src:'Enbiyâ Sûresi, 107. âyet (hilyenin ayet kuşağı)',
      tezhip:'Bilgi girilecek' },
    { f:'e-subhanallah.jpg',    r:1.44, t:'Sübhânellâh',                   yazi:['Celî Sülüs'],    tur:'Levha', y:'1442',
      ar:'سُبْحَانَ اللّٰهِ', mean:'Allah her türlü noksanlıktan münezzehtir.' },
    { f:'e-fussilet.jpg',       r:4.35, t:'Fussilet Sûresi, 53. Âyet',     yazi:['Sülüs'],         tur:'Âyet',
      ar:'سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنْفُسِهِمْ', mean:'Onlara ufuklarda ve kendi nefislerinde âyetlerimizi göstereceğiz…', src:'Fussilet Sûresi, 53. âyet' },
    { f:'e-seyen-lillah.jpg',   r:1.18, t:"Şey'en Lillâh",                 yazi:['Celî Sülüs'],    tur:'Levha', y:'1445',
      ar:'شَيْئًا لِلّٰهِ', mean:'Allah rızası için…', desc:'Dervişlerin kapıda Allah rızası için bir şey isterken söylediği, tasavvuf geleneğinde sıkça yazılan söz.' },
    { f:'e-tovbe.jpg',          r:1.71, t:'Tövbe Yâ Rabbi',                yazi:["Ta'lik"],        tur:'Beyit' },
    { f:'e-sulus-2.jpg',        r:.96, t:"Kün Mea'llâhi bi's-Sıdk",        yazi:['Sülüs'],         tur:"Kıt'a",
      ar:'كُنْ مَعَ اللّٰهِ بِالصِّدْقِ وَمَعَ النَّاسِ بِالْإِنْصَافِ', mean:"Allah ile sadakatle, insanlarla insafla ol… (kıt'anın devamında nefis, âlimler, şeyhler, fakirler, çocuklar, dostlar, düşmanlar ve cahillerle nasıl olunacağı sayılır)" },
    { f:'e-emrolundugun.jpg',   r:1.86, t:'Emrolunduğun Gibi Dosdoğru Ol', yazi:['Celî Sülüs'],    tur:'Âyet', y:'1444',
      ar:'فَاسْتَقِمْ كَمَا أُمِرْتَ', mean:'Emrolunduğun gibi dosdoğru ol.', src:'Hûd Sûresi, 112. âyet' },
    { f:'e-rika-gazel.jpg',     r:.89, t:'Gazel',                          yazi:["Rik'a"],         tur:"Kıt'a" },
    { f:'e-besmele.jpg',        r:2.63, t:'Besmele-i Şerif',               yazi:['Celî Sülüs'],    tur:'Levha',
      ar:'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ', mean:"Rahmân ve Rahîm olan Allah'ın adıyla." },
    { f:'e-hilye-saadet.png',   r:.8,  t:'Hilye-i Saâdet',                 yazi:['Sülüs','Nesih'], tur:'Hilye' },
    { f:'e-rika-1.jpg',         r:2.03, t:'Beyit',                         yazi:["Rik'a"],         tur:'Beyit' },
    { f:'e-sulus-1.jpg',        r:1.73, t:'Beyit',                         yazi:['Sülüs'],         tur:'Beyit' },
    { f:'e-besmele-levha.png',  r:1.78, t:'Besmele',                       yazi:['Sülüs'],         tur:'Levha' },
  ];

(() => {
  document.body.insertAdjacentHTML('beforeend', `<div class="lb" id="lb" role="dialog" aria-modal="true" aria-labelledby="lb-title">
  <div class="lb-stage" id="stage">
    <img id="lb-img" alt="" draggable="false">
    <div class="lb-hint">Yakınlaştırmak için kaydırın ya da çift tıklayın</div>
    <button class="lb-nav prev" id="lb-prev" aria-label="Önceki eser">←</button>
    <button class="lb-nav next" id="lb-next" aria-label="Sonraki eser">→</button>
    <div class="lb-ctrl">
      <button class="m-nav" id="m-prev" aria-label="Önceki eser">←</button>
      <button id="z-out" aria-label="Uzaklaştır">−</button>
      <button class="pct" id="z-pct" tabindex="-1">100%</button>
      <button id="z-in" aria-label="Yakınlaştır">+</button>
      <button class="m-nav" id="m-next" aria-label="Sonraki eser" style="order:9">→</button>
      <button id="z-fit" aria-label="Ekrana sığdır"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg></button>
    </div>
  </div>
  <aside class="lb-side">
    <div class="lb-head"><span class="pos" id="lb-pos"></span><button class="lb-close" id="lb-close" aria-label="Kapat">×</button></div>
    <div class="lb-body" id="lb-body"></div>
  </aside>
</div>
`);
  const works = window.ESERLER;
  const lb = document.getElementById('lb'), stage = document.getElementById('stage'), lbImg = document.getElementById('lb-img');
  let list = [], cur = 0, z = { s:1, x:0, y:0, w:0, h:0, max:4 };
  const hijri = y => { const a = Math.floor((y - 1) * 0.970229 + 622.5), b = a + 1; return `${y} (${a}–${String(b).slice(2)})`; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const row = (k, v) => `<dt>${k}</dt><dd class="${v ? '' : 'none'}">${v ? esc(v) : 'Bilgi girilecek'}</dd>`;

  // liste: gezinilecek eserlerin ESERLER içindeki sıraları · i: açılacak eser
  function openLb(liste, i){
    list = liste; cur = Math.max(0, list.indexOf(i)); show();
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }
  function closeLb(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
  function show(){
    const w = works[list[cur]];
    lbImg.style.opacity = 0;
    lbImg.onload = () => { fit(); lbImg.style.opacity = 1; };
    lbImg.src = 'img/' + w.f; lbImg.alt = w.t;
    document.getElementById('lb-pos').textContent = `${cur + 1} / ${list.length}`;
    document.getElementById('lb-body').innerHTML = `
      <h2 id="lb-title">${esc(w.t)}</h2>
      <div class="tags">${[...w.yazi, w.tur].map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      ${w.ar ? `<div class="ar" lang="ar">${w.ar}</div>` : ''}
      ${w.mean ? `<p class="mean">“${esc(w.mean)}”</p>` : ''}
      ${w.src ? `<div class="src">${esc(w.src)}</div>` : (w.mean ? '<div class="src"></div>' : '')}
      ${w.desc ? `<p class="desc">${esc(w.desc)}</p>` : ''}
      <dl>
        ${row('Tarih', w.y ? hijri(+w.y) : '')}
        ${row('Ölçü', w.olcu)}
        ${row('Malzeme', w.malzeme)}
        ${row('Tezhip', w.tezhip === 'Bilgi girilecek' ? '' : w.tezhip)}
        ${row('Ebru', w.ebru)}
      </dl>
      <a class="ask" href="iletisim.html?eser=${encodeURIComponent(w.t)}">Bu eser hakkında sorun →</a>`;
    ['lb-prev','lb-next','m-prev','m-next'].forEach(id => document.getElementById(id).hidden = list.length < 2);
  }
  const step = d => { cur = (cur + d + list.length) % list.length; show(); };

  // Yakınlaştırma: tekerlek, çift tık, +/− düğmeleri, sürükleyerek gezinme, iki parmakla büyütme
  function fit(){
    const W = stage.clientWidth, H = stage.clientHeight, mob = innerWidth < 860, mx = mob ? 40 : 160, my = mob ? 90 : 120;
    const r = lbImg.naturalWidth / lbImg.naturalHeight;
    let w = W - mx, h = w / r; if (h > H - my) { h = H - my; w = h * r; }
    Object.assign(z, { s:1, w, h, x:(W - w) / 2, y:(H - h) / 2 - (mob ? 20 : 10), max:Math.max(2, lbImg.naturalWidth / w * 1.5) });
    lbImg.style.width = w + 'px'; lbImg.style.height = h + 'px'; render();
  }
  function clamp(){
    const W = stage.clientWidth, H = stage.clientHeight, sw = z.w * z.s, sh = z.h * z.s;
    z.x = sw <= W ? (W - sw) / 2 : Math.min(0, Math.max(W - sw, z.x));
    z.y = sh <= H ? (H - sh) / 2 : Math.min(0, Math.max(H - sh, z.y));
  }
  function render(anim){
    clamp();
    lbImg.style.transition = anim ? 'transform .25s ease' : 'none';
    lbImg.style.transform = `translate(${z.x}px, ${z.y}px) scale(${z.s})`;
    stage.classList.toggle('zoomed', z.s > 1.01);
    document.getElementById('z-pct').textContent = Math.round(z.s * 100) + '%';
  }
  function zoomAt(ns, px, py, anim){
    ns = Math.min(z.max, Math.max(1, ns));
    z.x = px - (px - z.x) * (ns / z.s); z.y = py - (py - z.y) * (ns / z.s); z.s = ns; render(anim);
  }
  const center = () => [stage.clientWidth / 2, stage.clientHeight / 2];
  stage.addEventListener('wheel', e => { e.preventDefault(); const b = stage.getBoundingClientRect(); zoomAt(z.s * Math.exp(-e.deltaY * 0.0015), e.clientX - b.left, e.clientY - b.top); }, { passive:false });
  stage.addEventListener('dblclick', e => { if (e.target.closest('button')) return; const b = stage.getBoundingClientRect(); zoomAt(z.s > 1.01 ? 1 : 2.5, e.clientX - b.left, e.clientY - b.top, true); });
  document.getElementById('z-in').onclick = () => zoomAt(z.s * 1.5, ...center(), true);
  document.getElementById('z-out').onclick = () => zoomAt(z.s / 1.5, ...center(), true);
  document.getElementById('z-fit').onclick = () => zoomAt(1, ...center(), true);
  const pts = new Map(); let last = null, pinch = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d:Math.hypot(a[0]-b[0], a[1]-b[1]), s:z.s }; }
    last = [e.clientX, e.clientY]; stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()], r = stage.getBoundingClientRect();
      zoomAt(pinch.s * Math.hypot(a[0]-b[0], a[1]-b[1]) / pinch.d, (a[0]+b[0])/2 - r.left, (a[1]+b[1])/2 - r.top);
    } else if (z.s > 1.01) { z.x += e.clientX - last[0]; z.y += e.clientY - last[1]; render(); }
    last = [e.clientX, e.clientY];
  });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) stage.classList.remove('dragging'); last = pts.size ? [...pts.values()][0] : null; };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);

  document.getElementById('lb-close').onclick = closeLb;
  document.getElementById('lb-prev').onclick = () => step(-1);
  document.getElementById('lb-next').onclick = () => step(1);
  document.getElementById('m-prev').onclick = () => step(-1);
  document.getElementById('m-next').onclick = () => step(1);
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
    else if (e.key === '+' || e.key === '=') zoomAt(z.s * 1.5, ...center(), true); else if (e.key === '-') zoomAt(z.s / 1.5, ...center(), true);
  });
  addEventListener('resize', () => { if (lb.classList.contains('open')) fit(); });
  window.eserAc = openLb;
})();
