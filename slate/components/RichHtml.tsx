import React from 'react'
import {Descendant, Text} from 'slate'
import xss from 'xss'
import {TextLink} from '../../tw'
import {cn} from '../../_classnames'
import {elementClasses, leafClasses} from '../classes'

type ElementKey =
  | 'paragraph'
  | 'blockquote'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
  | 'link'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'heading-four'
  | 'heading-five'
  | 'heading-six'

export type RichHtmlClassNames = Partial<Record<ElementKey, string>>

function serialize(
  node: Descendant,
  classNames: RichHtmlClassNames
): React.ReactNode {
  if (Text.isText(node)) {
    const cleanContent = xss(node.text)
    let textNode: React.ReactNode = <>{cleanContent}</>

    if (node.bold) {
      textNode = <strong className={leafClasses.bold}>{textNode}</strong>
    }
    if (node.code) {
      textNode = (
        <code className={leafClasses.code}>
          {textNode}
        </code>
      )
    }
    if (node.italic) {
      textNode = <em className={leafClasses.italic}>{textNode}</em>
    }
    if (node.underline) {
      textNode = <u className={leafClasses.underline}>{textNode}</u>
    }
    if (node.strikethrough) {
      textNode = <s className={leafClasses.strikethrough}>{textNode}</s>
    }

    return textNode
  }

  let children = <></>
  if ('children' in node) {
    children = (
      <>
        {node.children.map((child, index) => (
          <React.Fragment key={index}>{serialize(child, classNames)}</React.Fragment>
        ))}
      </>
    )
  }

  const elementCondition = node.level
    ? `${node.type}-${node.level}`
    : node.type

  switch (elementCondition) {
    case 'block-quote':
      return (
        <blockquote
          className={cn(elementClasses['block-quote'], classNames.blockquote)}
        >
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul className={cn(elementClasses['bulleted-list'], classNames['bulleted-list'])}>
          {children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1 className={cn(elementClasses['heading-one'], classNames['heading-one'])}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 className={cn(elementClasses['heading-two'], classNames['heading-two'])}>
          {children}
        </h2>
      )
    case 'heading-three':
      return (
        <h3 className={cn(elementClasses['heading-three'], classNames['heading-three'])}>
          {children}
        </h3>
      )
    case 'heading-four':
      return (
        <h4 className={cn(elementClasses['heading-four'], classNames['heading-four'])}>
          {children}
        </h4>
      )
    case 'heading-five':
      return (
        <h5 className={cn(elementClasses['heading-five'], classNames['heading-five'])}>
          {children}
        </h5>
      )
    case 'heading-six':
      return (
        <h6 className={cn(elementClasses['heading-six'], classNames['heading-six'])}>
          {children}
        </h6>
      )
    case 'list-item':
      return <li className={cn(classNames['list-item'])}>{children}</li>
    case 'numbered-list':
      return (
        <ol className={cn(elementClasses['numbered-list'], classNames['numbered-list'])}>
          {children}
        </ol>
      )
    case 'paragraph':
      return (
        <p className={cn(elementClasses.paragraph, classNames.paragraph)}>{children}</p>
      )
    case 'link': {
      const sanitizedUrl = xss(node.url ?? '')
      return (
        <TextLink
          href={sanitizedUrl}
          underline="hover"
          className={cn(elementClasses.link, classNames.link)}
        >
          {children}
        </TextLink>
      )
    }
    default:
      return <div>{children}</div>
  }
}

export default function RichHtml({
  data,
  classNames = {},
}: {
  data: Descendant[]
  classNames?: RichHtmlClassNames
}): React.ReactNode {
  return (
    <>
      {data.map((node, index) => (
        <React.Fragment key={index}>{serialize(node, classNames)}</React.Fragment>
      ))}
    </>
  )
}
