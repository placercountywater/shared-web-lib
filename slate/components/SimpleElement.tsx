import type {CustomRenderElementProps} from '../types'

/**
 * Renders any Slate element as a plain `div`, ignoring its type. For
 * single-line fields (titles, captions) where block structure is meaningless.
 */
export default function SimpleElement({
  attributes,
  children,
  className
}: CustomRenderElementProps) {
  return (
    <div className={className} {...attributes}>
      {children}
    </div>
  )
}
