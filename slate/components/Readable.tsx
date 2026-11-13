'use client'

import {useCallback, useEffect, useMemo} from 'react'
import {createEditor, type Descendant, Transforms, Node} from 'slate'
import {Slate, Editable, withReact} from 'slate-react'
import SimpleElement from './SimpleElement'
import SimpleLeaf from './SimpleLeaf'
import slateValueToPlainText from '../slateValueToPlainText'
import {
  type CustomRenderElementProps,
  type CustomRenderLeafProps
} from '../types'
import {EditableProps} from 'slate-react/dist/components/editable'
import RichElement from './RichElement'
import RichLeaf from './RichLeaf'

const defaultDefaultValue: Descendant[] = [
  {
    type: 'undefined',
    children: [{text: ''}]
  }
]

export default function Readable({
  data = defaultDefaultValue,
  showHtmlTitle = false,
  rich = true,
  ...props
}: {
  data?: Descendant[]
  showHtmlTitle?: boolean
  rich?: boolean
} & EditableProps) {
  // use a sensible default value with title (note, postgres creates a similar jsonb value by default when new rows are added so this isn't necessary, though, good practice)
  const {tabIndex} = props

  const editor = useMemo(() => withReact(createEditor()), [])

  const renderElement = useCallback(
    (props: CustomRenderElementProps) =>
      !rich ? <SimpleElement {...props} /> : <RichElement {...props} />,
    [rich]
  )
  const renderLeaf = useCallback(
    (props: CustomRenderLeafProps) =>
      !rich ? <SimpleLeaf {...props} /> : <RichLeaf {...props} />,
    [rich]
  )

  useEffect(() => {
    // Function to compare the editor's content with the new value
    const isEqual = (a: Node[], b: Node[]): boolean => {
      return JSON.stringify(a) === JSON.stringify(b)
    }

    // Only update if the content has actually changed
    if (!isEqual(editor.children, data)) {
      // Remove existing content
      Transforms.removeNodes(editor, {
        at: [0] // Adjust as necessary for your specific use case
      })

      // Insert the new content
      Transforms.insertNodes(editor, data, {
        at: [0] // Adjust as necessary for your specific use case
      })
    }
  }, [data, editor])

  const htmlTitle = slateValueToPlainText(data)

  return (
    <div>
      <Slate editor={editor} initialValue={data}>
        <div>
          <Editable
            {...(showHtmlTitle && {title: htmlTitle})}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            readOnly
            // TODO - not entirely sure tabIndex is working correctly
            tabIndex={tabIndex}
            {...props}
          />
        </div>
      </Slate>
    </div>
  )
}
