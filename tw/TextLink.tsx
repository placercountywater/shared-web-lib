import type {ComponentProps} from 'react'
import NextLink from 'next/link'
import hrefKind, {externalLinkProps} from '../core/hrefKind'
import Link from './Link'

type TextLinkProps = Omit<ComponentProps<typeof Link>, 'render'> & {
  href: string
}

/**
 * A link inside a sentence: styled, and routed according to where it points.
 *
 * The pair to next/BlockLink. That one wraps a card and adds nothing to the
 * look; this one sits in prose and carries the underline, so between them the
 * two shapes a link comes in are both covered without either being a special
 * case of the other.
 *
 * All four href kinds behave, which is the part worth not rewriting per app:
 *
 * - our own pages route client-side, with no target and no rel — `noopener`
 *   guards against a cross-origin window reaching back through `window.opener`,
 *   which does not apply to your own pages
 * - another site opens in a new tab with `rel="noopener noreferrer"`
 * - a `tel:` or `mailto:` is a plain anchor with neither, since the router
 *   cannot dial a phone number and a new tab beside the dialler is a blank tab
 * - a bare `#id` is a plain anchor too, so the browser scrolls rather than the
 *   router navigating to the page you are already on
 *
 * `target` and `rel` remain overridable for the case the classification gets
 * wrong.
 *
 * What it deliberately does not decide is color. Link inherits its own and
 * distinguishes itself by the underline, so an app that wants prose links in a
 * brand color wraps this once:
 *
 * ```tsx
 * export default function AppLink({className, ...rest}: TextLinkProps) {
 *   return <TextLink className={cn('text-primary', className)} {...rest} />
 * }
 * ```
 *
 * That keeps the palette in the app, where it is defined, and the routing here,
 * where it is the same everywhere.
 */
export default function TextLink({href, target, rel, ...rest}: TextLinkProps) {
  const kind = hrefKind(href)

  if (kind === 'internal') {
    return <Link render={<NextLink href={href} />} {...rest} />
  }

  // For an external destination only. A protocol or fragment href gets a plain
  // anchor with no target, which is what the omission below produces.
  const external = kind === 'external' ? externalLinkProps : undefined

  return (
    <Link
      href={href}
      target={target ?? external?.target}
      rel={rel ?? external?.rel}
      {...rest}
    />
  )
}

export type {TextLinkProps}
