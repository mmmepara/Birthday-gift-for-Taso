/** Shown over everything while the phone is held upright. The night waits behind it. */
export function RotateNotice() {
  return (
    <div className="rotate-notice" role="alertdialog" aria-modal="true" aria-labelledby="rotate-title">
      <div className="rotate-phone" aria-hidden="true">
        <svg viewBox="0 0 64 104">
          <rect x="3" y="3" width="58" height="98" rx="11" />
          <rect x="24" y="9" width="16" height="3" rx="1.5" className="rotate-ear" />
          <circle cx="32" cy="52" r="7" className="rotate-heart" />
        </svg>
        <span className="rotate-arrow">↻</span>
      </div>
      <p className="kicker">დაპაუზებულია</p>
      <h2 className="display" id="rotate-title">
        Rotate your phone
      </h2>
      <p className="lede">მოატრიალე ტელეფონი. ყველაფერი ზუსტად აქ დაგელოდება, სადაც გაჩერდი.</p>
    </div>
  )
}
