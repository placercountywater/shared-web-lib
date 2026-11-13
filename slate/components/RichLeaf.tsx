import {cn} from '../../_classnames'
import {leafClasses} from '../classes'
import type {CustomRenderLeafProps} from '../types'

/**
 * Renders a Slate leaf with its marks (bold, italic, underline,
 * strikethrough, code) as semantic inline elements.
 */
export default function RichLeaf({
  attributes,
  children,
  leaf,
  className
}: CustomRenderLeafProps) {
  if (leaf.bold) {
    children = <strong className={leafClasses.bold}>{children}</strong>
  }
  if (leaf.code) {
    children = <code className={leafClasses.code}>{children}</code>
  }
  if (leaf.italic) {
    children = <em className={leafClasses.italic}>{children}</em>
  }
  if (leaf.underline) {
    children = <u className={leafClasses.underline}>{children}</u>
  }
  if (leaf.strikethrough) {
    children = <s className={leafClasses.strikethrough}>{children}</s>
  }

  return (
    <span className={cn(className)} style={leaf.style} {...attributes}>
      {children}
    </span>
  )
}
