/**
 * Google etiketi, Google'ın izin moduyla (Consent Mode v2): her ziyarette yüklenir ama izin
 * verilene kadar çerez yazmaz, yalnızca çerezsiz ölçüm sinyalleri gönderir. Ziyaretçi kabul
 * ederse CerezIzni `consent update` ile analiz çerezlerini açar. Reklam izinleri hiç açılmaz.
 * Sunucuda düz <script> olarak çizilir ki etiket sayfa kaynağında görünsün (Google'ın kurulum
 * kontrolü bunu arar).
 */
export function GoogleTag({ id }: { id: string }) {
  const kurulum = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var izin = null;
try { izin = localStorage.getItem('cerez'); } catch (e) {}
gtag('consent', 'default', {
  analytics_storage: izin === 'kabul' ? 'granted' : 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});
`
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: kurulum }} />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} />
    </>
  )
}
