// Taslak sayfaların ortak parçaları: üst bilgi, mobil menü, alt bilgi, tema
(function () {
  const pages = [
    ['eserler.html', 'Eserler'], ['yazilar.html', 'Yazılar'], ['kitaplar.html', 'Kitaplar'],
    ['videolar.html', 'Videolar'], ['hayati.html', 'Hayatı'], ['iletisim.html', 'İletişim'],
  ];
  if (!document.querySelector('link[rel=icon]')) document.head.insertAdjacentHTML('beforeend', '<link rel="icon" type="image/svg+xml" href="img/favicon.svg">');
  const active = document.body.dataset.page;
  const links = pages.map(([h, t]) => `<a href="${h}" class="${t === active ? 'on' : ''}">${t}</a>`).join('');
  const moon = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  const sun = '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  const logo = '<a class="logo" href="index.html"><span class="logo-mark"><img src="img/imza.png" alt="Sıtkı Çoban imza"></span><span class="name">Sıtkı Çoban</span></a>';

  document.body.insertAdjacentHTML('afterbegin', `
    <header><div class="wrap">${logo}
      <div style="display:flex;align-items:center"><nav>${links}</nav>
        <div class="tools">
          <button class="circle" aria-label="Dil seçin (şu an Türkçe)">TR</button>
          <button class="circle" id="tbtn" aria-label="Gece görünümüne geç">${moon}${sun}</button>
          <button class="circle menu-btn" id="mbtn" aria-label="Menüyü aç" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M8 17h12"/></svg></button>
        </div>
      </div>
    </div></header>
    <div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="Menü">
      <div class="top">${logo}<button class="circle" id="mclose" aria-label="Menüyü kapat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <div class="links" role="navigation">${links}</div>
    </div>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer><div class="wrap">
      <img src="img/imza.png" alt="">
      <div class="links">${pages.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
      <div class="side"><div class="social-ic"><a href="https://www.instagram.com/hattatstkcoban/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg></a><a href="https://www.facebook.com/s.tk.coban.619408" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M14.5 21v-7.5h2.6l.4-3.2h-3V8.4c0-.9.3-1.6 1.6-1.6h1.6V4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.4H8.9v3.2h2.6V21"/></svg></a></div><small>© 2026 Sıtkı Çoban · sitkicoban.com</small><small class="credit">Tasarım ve geliştirme: <a href="https://mustafagenc.info" target="_blank" rel="noopener">Mustafa Genç</a></small></div>
    </div></footer>`);

  const mnav = document.getElementById('mnav'), mbtn = document.getElementById('mbtn');
  const setMenu = o => { mnav.classList.toggle('open', o); mbtn.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  mbtn.onclick = () => setMenu(true);
  document.getElementById('mclose').onclick = () => setMenu(false);
  addEventListener('keydown', e => { if (e.key === 'Escape' && mnav.classList.contains('open')) setMenu(false); });

  // Logo parıltısı: sayfa açılınca bir kez, fareyle üzerine gelince yeniden
  const mark = document.querySelector('header .logo-mark');
  const parla = () => { if (mark.classList.contains('parla')) return; mark.classList.add('parla'); setTimeout(() => mark.classList.remove('parla'), 1400); };
  mark.style.setProperty('--logo-src', `url("${mark.querySelector('img').src}")`);
  mark.closest('.logo').addEventListener('mouseenter', parla);
  setTimeout(parla, 600);

  const tbtn = document.getElementById('tbtn');
  window.setTheme = t => {
    document.documentElement.dataset.theme = t;
    tbtn.setAttribute('aria-label', t === 'dark' ? 'Gündüz görünümüne geç' : 'Gece görünümüne geç');
    try { localStorage.setItem('tema', t); } catch (e) {}
  };
  tbtn.onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  try { const t = localStorage.getItem('tema'); if (t) setTheme(t); } catch (e) {}
})();
