import type {ComponentProps} from 'react'
import NextLink from 'next/link'
import hrefKind, {externalLinkProps} from '../core/hrefKind'

type BlockLinkProps = Omit<ComponentProps<'a'>, 'href'> & {href: string}

/**
 * A link wrapping a block of content — a tile, a card, a map thumbnail, a list
 * row.
 *
 * Routing only. It picks the right element for the href and contributes nothing
 * to the look, which is the whole difference between this and a prose link: a
 * prose link brings an underline, a decoration colour and a brand text colour,
 * and every one of those reads as wrong on a link wrapping a whole card. The
 * caller styles the block; this decides how it navigates.
 *
 * Compose it with the `tw` tier's Link when you want both, rather than
 * reaching for one and overriding it:
 *
 * ```tsx
 * <BlockLink href={href} className="group block h-full">…</BlockLink>
 * ```
 *
 * The accessible name comes from the content inside. That is why a decorative
 * image within one takes `alt=""` — the visible text is the name, and a
 * described image is announced twice.
 *
 * It exists because every consuming app had written the same conditional, or
 * skipped it: two spelled out `isExternalHref(href) ? <a target="_blank"> :
 * <NextLink>` by hand, one hardcoded target and rel with no branch at all so an
 * internal href opened a pointless tab, and one app had 93 files with
 * `target="_blank"` written in place.
 */
export default function BlockLink({href, children, ...rest}: BlockLinkProps) {
  const kind = hrefKind(href)

  // Client-side routing for our own pages only. next/link cannot dial a tel:,
  // and routing to a fragment on the current page is a navigation where the
  // browser only needed to scroll.
  if (kind === 'internal') {
    return (
      <NextLink href={href} {...rest}>
        {children}
      </NextLink>
    )
  }

  return (
    <a href={href} {...(kind === 'external' ? externalLinkProps : {})} {...rest}>
      {children}
    </a>
  )
}

export type {BlockLinkProps}
