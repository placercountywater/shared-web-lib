/**
 * What kind of destination an href points at.
 *
 * Four answers, because they want four different treatments and collapsing any
 * two of them produces a bug:
 *
 * - `internal` — somewhere on this site. Client-side routing, no target, no
 *   rel. `rel="noopener"` guards against a cross-origin window reaching back
 *   through `window.opener`, which does not apply to your own pages.
 * - `external` — another site. New tab and `rel="noopener noreferrer"`. That
 *   half is a security decision rather than a cosmetic one.
 * - `protocol` — `tel:` or `mailto:`. Handed to the operating system, so it
 *   must never reach `next/link`, and `target="_blank"` on a phone number
 *   leaves a blank tab open beside the dialler.
 * - `fragment` — a bare `#id` on the current page. A plain anchor, so the
 *   browser scrolls; routing to it is a navigation to the page you are on.
 *
 * Here rather than inside a link component so that whole-block links — a tile,
 * a card, a list row — ask the same question as a prose link without the prose
 * styling coming with the answer.
 *
 * It is in this library because apps were answering it separately and
 * inconsistently — a `startsWith('http')` test, for instance, calls a `mailto:`
 * internal and hands it to the router. Two definitions of "external" mean two
 * answers to "does this need target and rel", and that half is a security
 * question rather than a cosmetic one, so it is worth having once.
 *
 * Protocol-relative `//host/path` counts as external. It is rare in authored
 * content but it is unambiguously another origin.
 */
export type HrefKind = 'internal' | 'external' | 'protocol' | 'fragment'

export default function hrefKind(href: string): HrefKind {
  if (href.startsWith('#')) return 'fragment'
  if (/^(tel:|mailto:)/i.test(href)) return 'protocol'
  if (/^(https?:)?\/\//i.test(href)) return 'external'
  return 'internal'
}

/**
 * Whether an href leaves the site in a way that wants a new tab.
 *
 * True for `external` only. A `mailto:` leaves the site too, but opening the
 * mail client in a new browser tab leaves an empty tab behind.
 */
export const isExternalHref = (href: string) => hrefKind(href) === 'external'

/**
 * The pair an external link needs: a new tab, and `rel="noopener"` so the
 * opened page cannot reach back through `window.opener`.
 */
export const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer'
} as const
