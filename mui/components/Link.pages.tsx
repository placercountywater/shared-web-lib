/**
 * Pages Router variant of the MUI+Next.js Link component.
 * Uses `useRouter` from `next/router` instead of `usePathname` from `next/navigation`.
 * For App Router projects, use Link.tsx instead.
 */
import * as React from 'react'
import clsx from 'clsx'
import {useRouter} from 'next/router'
import NextLink, {type LinkProps as NextLinkProps} from 'next/link'
import MuiLink, {type LinkProps as MuiLinkProps} from '@mui/material/Link'
import hrefKind, {externalLinkProps} from '../../core/hrefKind'

export interface NextLinkComposedProps
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    Omit<
      NextLinkProps,
      'href' | 'as' | 'passHref' | 'onMouseEnter' | 'onClick' | 'onTouchStart'
    > {
  to: NextLinkProps['href']
  linkAs?: NextLinkProps['as']
}

export const NextLinkComposed = React.forwardRef<
  HTMLAnchorElement,
  NextLinkComposedProps
>(function NextLinkComposed(props, ref) {
  const {to, linkAs, target, rel, ...other} = props

  return (
    <NextLink
      href={to}
      as={linkAs}
      ref={ref}
      target={target}
      rel={rel}
      {...other}
    />
  )
})

export type LinkProps = {
  activeClassName?: string
  as?: NextLinkProps['as']
  href: NextLinkProps['href']
  linkAs?: NextLinkProps['as']
  noLinkStyle?: boolean
  target?: string
  rel?: string
} & Omit<NextLinkComposedProps, 'to' | 'linkAs' | 'href'> &
  Omit<MuiLinkProps, 'href'>

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    const {
      activeClassName = 'active',
      as,
      className: classNameProps,
      href,
      linkAs: linkAsProp,
      noLinkStyle,
      scroll,
      target,
      rel,
      ...other
    } = props

    const {pathname: routerPathname} = useRouter()
    const pathname = typeof href === 'string' ? href : href?.pathname

    const className = clsx(classNameProps, {
      [activeClassName]: routerPathname === pathname && activeClassName
    })

    const linkAs = linkAsProp || as || (href as string)
    const nextjsProps = {
      to: href,
      linkAs,
      scroll,
      target,
      rel
    }

    // core/hrefKind classifies the four kinds one way for every app, so this
    // does not re-derive them per component. It matters here because the three
    // non-internal kinds each need something different:
    //
    // - external opens a new tab, with noopener so the new document cannot
    //   reach back through window.opener
    // - mailto: and tel: are handed to the OS. next/link cannot dial a phone
    //   number, and a new tab beside the mail client is a blank tab -- which is
    //   what this component used to produce, since it counted mailto: as
    //   external and gave it target="_blank"
    // - a bare #id is a scroll on the page you are already on, not a route
    //   change, so it must not go through the router either
    //
    // Narrowed rather than derived so that href is a string inside the branches
    // below. It may also be a UrlObject, which only the router accepts.
    const strHref = typeof href === 'string' ? href : null
    const kind = strHref ? hrefKind(strHref) : 'internal'

    if (strHref && kind === 'external') {
      return (
        <MuiLink
          className={className}
          href={strHref}
          ref={ref}
          target={target ?? externalLinkProps.target}
          rel={rel ?? externalLinkProps.rel}
          {...other}
        />
      )
    }

    // A plain anchor: no router, and no target or rel unless the caller asked.
    if (strHref && (kind === 'protocol' || kind === 'fragment')) {
      return noLinkStyle ? (
        <a
          className={className}
          href={strHref}
          ref={ref}
          target={target}
          rel={rel}
          {...(other as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        />
      ) : (
        <MuiLink
          className={className}
          href={strHref}
          ref={ref}
          target={target}
          rel={rel}
          {...other}
        />
      )
    }

    if (noLinkStyle) {
      return (
        <NextLinkComposed
          className={className}
          ref={ref}
          {...nextjsProps}
          {...other}
        />
      )
    }

    return (
      <MuiLink
        component={NextLinkComposed}
        className={className}
        ref={ref}
        {...nextjsProps}
        {...other}
      />
    )
  }
)

export default Link
