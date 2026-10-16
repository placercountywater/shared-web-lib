import {Editor, Transforms, type Descendant} from 'slate'
import type {CustomElement, CustomText} from './types'

type Marks = Partial<Pick<CustomText, 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'>>

const MARK_TAGS: Partial<Record<string, keyof Marks>> = {
  strong: 'bold',
  b: 'bold',
  em: 'italic',
  i: 'italic',
  u: 'underline',
  s: 'strikethrough',
  del: 'strikethrough',
  strike: 'strikethrough',
  code: 'code'
}

const HEADING_LEVELS: Record<string, CustomElement['level']> = {
  h1: 'one',
  h2: 'two',
  h3: 'three',
  h4: 'four',
  h5: 'five',
  h6: 'six'
}

export interface RichPasteOptions {
  stripLinks?: boolean
}

/*  Browsers serialize a selection inside a single block as <span style="font-weight: 600"> rather than <strong>, so a
  one-line copy loses its formatting unless inline styles are read too. Google Docs marks formatting the same way.
*/
function applyStyleMarks(style: CSSStyleDeclaration, marks: Marks) {
  const {fontWeight, fontStyle} = style
  if (fontWeight) {
    const weight = fontWeight === 'bold' || fontWeight === 'bolder' ? 700 : Number(fontWeight)
    if (weight >= 600) marks.bold = true
    else if (fontWeight === 'normal' || weight < 600) delete marks.bold
  }
  if (fontStyle === 'italic' || fontStyle === 'oblique') marks.italic = true
  else if (fontStyle === 'normal') delete marks.italic

  const decoration = style.textDecorationLine || style.textDecoration
  if (decoration.includes('underline')) marks.underline = true
  if (decoration.includes('line-through')) marks.strikethrough = true
}

function deserializeNode(node: Node, marks: Marks = {}, options: RichPasteOptions = {}): Descendant[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    if (!text) return []
    return [{...marks, text} as CustomText]
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return []

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  if (tag === 'br') {
    return [{...marks, text: '\n'} as CustomText]
  }

  // Accumulate inline marks and pass down to children
  const currentMarks: Marks = {...marks}
  const markKey = MARK_TAGS[tag]
  // Google Docs sets font-weight:normal on <b> tags to reset browser defaults — skip those
  if (markKey === 'bold' && el.style.fontWeight === 'normal') {
    // don't apply bold
  } else if (markKey) {
    currentMarks[markKey] = true
  }
  applyStyleMarks(el.style, currentMarks)

  const children = Array.from(el.childNodes).flatMap(child =>
    deserializeNode(child, currentMarks, options)
  )
  const safeChildren = children.length > 0 ? children : [{text: ''} as CustomText]

  if (tag in HEADING_LEVELS) {
    return [{type: 'heading', level: HEADING_LEVELS[tag], children: safeChildren} as CustomElement]
  }

  switch (tag) {
    case 'p':
    case 'div':
      return [{type: 'paragraph', children: safeChildren} as CustomElement]
    case 'blockquote':
      return [{type: 'block-quote', children: safeChildren} as CustomElement]
    case 'ul':
      return [{type: 'bulleted-list', children: safeChildren} as CustomElement]
    case 'ol':
      return [{type: 'numbered-list', children: safeChildren} as CustomElement]
    case 'li':
      return [{type: 'list-item', children: safeChildren} as CustomElement]
    case 'a':
      if (options.stripLinks) return children
      return [{type: 'link', url: el.getAttribute('href') || '', children: safeChildren} as CustomElement]
    default:
      // Inline/transparent elements (span, strong, em, body, etc.) — pass children through
      return children
  }
}

function normalizeFragment(nodes: Descendant[]): Descendant[] {
  const hasBlocks = nodes.some(node => 'type' in node)
  if (!hasBlocks) return nodes

  // Wrap any stray text nodes in paragraphs so the fragment is uniformly block-level
  return nodes.map(node => {
    if ('text' in node) {
      return {type: 'paragraph', children: [node]} as CustomElement
    }
    return node
  })
}

export function withRichPaste(editor: Editor, options: RichPasteOptions = {}): Editor {
  const {insertData} = editor

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html')

    if (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const fragment = normalizeFragment(deserializeNode(doc.body, {}, options))

      if (fragment.length > 0) {
        Transforms.insertFragment(editor, fragment)
        return
      }
    }

    insertData(data)
  }

  return editor
}
