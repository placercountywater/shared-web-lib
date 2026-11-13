import React from 'react'
import {type BaseText, type BaseElement} from 'slate'
import {type RenderElementProps, type RenderLeafProps} from 'slate-react'

type BlockType =
  | 'paragraph'
  | 'heading'
  | 'block-quote'
  | 'list-item'
  | 'bulleted-list'
  | 'numbered-list'
  | 'code-block'
  | 'link'
  | 'undefined' // fallback

type HeadingLevel = 'one' | 'two' | 'three' | 'four' | 'five' | 'six' // Use consistent level naming

// Extend the BaseElement to include type and style
export interface CustomElement extends BaseElement {
  type: BlockType
  style?: React.CSSProperties
  level?: HeadingLevel
  url?: string
}

// Extend BaseText to include custom formatting properties
export interface CustomText extends BaseText {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  style?: React.CSSProperties
}

export type CustomRenderLeafProps = RenderLeafProps & {
  leaf: CustomText
  className?: string
}

export type CustomRenderElementProps = RenderElementProps & {
  element: CustomElement
  className?: string
}
