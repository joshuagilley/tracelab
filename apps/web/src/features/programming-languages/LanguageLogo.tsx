import styles from './LanguageLogo.module.css'

/**
 * Public assets under `public/lang-logos/{id}.svg`.
 * Rust: Ferris from rust-lang/book (wrench removed). Java: UXWing coffee icon.
 * C#: Wikimedia Commons Logo_C_sharp.svg. Others: Simple Icons (cdn.simpleicons.org).
 */
export function LanguageLogo({ languageId }: { languageId: string }) {
  const src = `${import.meta.env.BASE_URL}lang-logos/${languageId}.svg`
  return (
    <img
      src={src}
      alt=""
      className={styles.logo}
      width={18}
      height={18}
      loading="lazy"
      decoding="async"
      aria-hidden
    />
  )
}
