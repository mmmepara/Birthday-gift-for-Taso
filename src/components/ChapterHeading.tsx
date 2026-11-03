type HeadingProps = {
  kicker: string
  title: string
  lede?: string
  hero?: boolean
}

export function ChapterHeading({ kicker, title, lede, hero = false }: HeadingProps) {
  return (
    <header className="chapter-head">
      <p className="kicker">{kicker}</p>
      <h1 className={hero ? 'display hero' : 'display'}>{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
    </header>
  )
}
