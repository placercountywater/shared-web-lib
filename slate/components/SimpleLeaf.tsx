import type {CustomRenderLeafProps} from '../types'

/**
 * Renders a Slate leaf as a plain `span`, ignoring its marks.
 */
export default function SimpleLeaf({
  attributes,
  children,
  className
}: CustomRenderLeafProps) {
  return (
    <span className={className} {...attributes}>
      {children}
    </span>
  )
}
