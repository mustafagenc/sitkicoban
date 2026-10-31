// Taslak sayfaların ortak parçaları: üst bilgi, mobil menü, alt bilgi, tema
(function () {
  const pages = [
    ['eserler-v1.html', 'Eserler'], ['yazilar-v1.html', 'Yazılar'], ['sayfa.html?p=kitaplar', 'Kitaplar'],
    ['sayfa.html?p=videolar', 'Videolar'], ['sayfa.html?p=hayati', 'Hayatı'], ['sayfa.html?p=iletisim', 'İletişim'],
  ];
  const active = document.body.dataset.page;
  const links = pages.map(([h, t]) => `<a href="${h}" class="${t === active ? 'on' : ''}">${t}</a>`).join('');
  const moon = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  const sun = '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  const logo = '<a class="logo" href="index.html"><img src="img/imza.png" alt="Sıtkı Çoban imza"><span class="name">Sıtkı Çoban</span></a>';

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
      <div class="side"><small>© 2026 Sıtkı Çoban · sitkicoban.com</small><small class="credit">Tasarım ve geliştirme: <a href="https://mustafagenc.info" target="_blank" rel="noopener">Mustafa Genç</a></small></div>
    </div></footer>`);

  const mnav = document.getElementById('mnav'), mbtn = document.getElementById('mbtn');
  const setMenu = o => { mnav.classList.toggle('open', o); mbtn.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  mbtn.onclick = () => setMenu(true);
  document.getElementById('mclose').onclick = () => setMenu(false);
  addEventListener('keydown', e => { if (e.key === 'Escape' && mnav.classList.contains('open')) setMenu(false); });

  const tbtn = document.getElementById('tbtn');
  window.setTheme = t => {
    document.documentElement.dataset.theme = t;
    tbtn.setAttribute('aria-label', t === 'dark' ? 'Gündüz görünümüne geç' : 'Gece görünümüne geç');
    try { localStorage.setItem('tema', t); } catch (e) {}
  };
  tbtn.onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  try { const t = localStorage.getItem('tema'); if (t) setTheme(t); } catch (e) {}
})();
