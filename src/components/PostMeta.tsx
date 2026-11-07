import { Fragment } from 'react'

/** Tarih · okuma süresi gibi parçaları ❖ ile ayırır; boş parçalar çizilmez. */
export function PostMeta({
  parts,
  className = 'meta',
  style,
}: {
  parts: (string | null | undefined)[]
  className?: string
  style?: React.CSSProperties
}) {
  const list = parts.filter((p): p is string => Boolean(p))
  if (!list.length) return null
  return (
    <div className={className} style={style}>
      {list.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="dot" aria-hidden="true">
              ❖
            </span>
          )}
          {p}
        </Fragment>
      ))}
    </div>
  )
}
