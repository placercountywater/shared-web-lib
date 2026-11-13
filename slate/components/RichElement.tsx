import {cn} from '../../_classnames'
import {elementClasses} from '../classes'
import type {CustomRenderElementProps} from '../types'

const tags = {
  'block-quote': 'blockquote',
  'bulleted-list': 'ul',
  'numbered-list': 'ol',
  'list-item': 'li',
  'heading-one': 'h1',
  'heading-two': 'h2',
  'heading-three': 'h3',
  'heading-four': 'h4',
  'heading-five': 'h5',
  'heading-six': 'h6',
  paragraph: 'p'
} as const

/**
 * Renders a Slate element as its semantic HTML tag (paragraph, heading, list,
 * block quote, link), styled to match `RichHtml`.
 *
 * Links render as a plain `<a>`: inside an editor a click places the caret
 * rather than navigating, so routing is `RichHtml`'s concern, not this one's.
 */
export default function RichElement({
  attributes,
  children,
  element,
  className
}: CustomRenderElementProps) {
  const {style, type, level, url} = element
  const condition = level ? `${type}-${level}` : type

  if (condition === 'link') {
    return (
      <a
        href={url ?? ''}
        className={cn(elementClasses.link, className)}
        style={style}
        {...attributes}
      >
        {children}
      </a>
    )
  }

  const Tag = condition in tags ? tags[condition as keyof typeof tags] : 'div'
  const classes =
    condition in elementClasses
      ? elementClasses[condition as keyof typeof elementClasses]
      : undefined

  return (
    <Tag className={cn(classes, className)} style={style} {...attributes}>
      {children}
    </Tag>
  )
}
