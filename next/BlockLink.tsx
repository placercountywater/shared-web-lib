import type {ComponentProps} from 'react'
import NextLink from 'next/link'
import hrefKind, {externalLinkProps} from '../core/hrefKind'

type BlockLinkProps = Omit<ComponentProps<'a'>, 'href'> & {href: string}

/**
 * A link wrapping a block of content — a tile, a card, an image thumbnail, a
 * list row.
 *
 * Routing only: it picks the element the href needs and contributes nothing to
 * the look. That split is the point. Styling a link is a separate concern from
 * deciding how it navigates, and the two want opposite things here — an
 * underline and a text colour belong on a word inside a sentence, and read as a
 * mistake on a link wrapping an entire card.
 *
 * So the caller styles the block:
 *
 * ```tsx
 * <BlockLink href={href} className="block rounded-lg hover:shadow-md">
 *   <Card>…</Card>
 * </BlockLink>
 * ```
 *
 * For a link inside prose, use the `tw` tier's Link, which styles an anchor and
 * composes with next/link through its `render` prop. An app that wants its own
 * brand colour on prose links should wrap that once rather than reach for this.
 *
 * The accessible name comes from the content inside, which is why a decorative
 * image within one takes `alt=""` — the visible text is already the name, and a
 * described image is announced twice.
 *
 * It is here because the alternative is every app writing the same conditional,
 * and getting it inconsistently right: spelling the ternary out by hand,
 * hardcoding target and rel with no branch so an internal href opens a
 * pointless tab, or writing target="_blank" in place across dozens of files.
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
    <a
      href={href}
      {...(kind === 'external' ? externalLinkProps : {})}
      {...rest}
    >
      {children}
    </a>
  )
}

export type {BlockLinkProps}
