/** <head> içinde, ilk boyamadan önce kayıtlı temayı (localStorage "tema") uygular. */
const code = `try{var t=localStorage.getItem('tema');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
