export {default as slateValueToPlainText} from './slateValueToPlainText'
export {withRichPaste} from './withRichPaste'
export {withStripLinks} from './withStripLinks'
export {default as useSlateChangeHandler} from './hooks/useSlateChangeHandler'
export {default as useSlateDebouncedChangeHandler} from './hooks/useSlateDebouncedChangeHandler'
export {type useSlateDebouncedChangeHandlerProps} from './hooks/useSlateDebouncedChangeHandler'
export {default as RichElement} from './components/RichElement'
export {default as RichLeaf} from './components/RichLeaf'
export {default as SimpleElement} from './components/SimpleElement'
export {default as SimpleLeaf} from './components/SimpleLeaf'
export {default as Readable} from './components/Readable'
export {default as SimpleHtml} from './components/SimpleHtml'
export {default as RichHtml} from './components/RichHtml'
export {elementClasses, leafClasses} from './classes'

export type {
  CustomText,
  CustomElement,
  CustomRenderElementProps,
  CustomRenderLeafProps
} from './types'
