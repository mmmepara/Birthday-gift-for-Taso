import { useExperience } from '../experience.ts'

export function SoundToggle() {
  const { soundOn, toggleSound } = useExperience()
  return (
    <button
      type="button"
      className={soundOn ? 'sound-toggle is-on' : 'sound-toggle'}
      aria-pressed={soundOn}
      onClick={() => {
        void toggleSound()
      }}
    >
      <span className="dot" aria-hidden="true" />
      <span className="toggle-icon" aria-hidden="true">
        ✦
      </span>
      <span className="toggle-word">{soundOn ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}
