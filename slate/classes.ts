/**
 * Tailwind classes for each Slate block and mark, shared by the editor
 * renderers (RichElement/RichLeaf) and the static serializer (RichHtml) so text
 * looks the same while it is edited and once it is published.
 *
 * Keyed by `type` or `type-level`, the same condition both renderers switch on.
 */
export const elementClasses = {
  'block-quote': 'border-l-4 border-border pl-4 italic my-2',
  'bulleted-list': 'list-disc pl-6 my-2',
  'numbered-list': 'list-decimal pl-6 my-2',
  'list-item': '',
  'heading-one': 'font-heading text-4xl font-bold',
  'heading-two': 'font-heading text-3xl font-bold',
  'heading-three': 'font-heading text-2xl font-semibold',
  'heading-four': 'font-heading text-xl font-semibold',
  'heading-five': 'font-heading text-lg font-semibold',
  'heading-six': 'font-heading text-base font-semibold',
  paragraph: 'my-2',
  link: 'text-primary hover:underline'
} as const

export const leafClasses = {
  bold: 'font-semibold',
  code: 'font-mono bg-black/5 rounded px-1 py-0.5 text-[0.9em]',
  italic: 'italic',
  underline: 'underline',
  strikethrough: 'line-through'
} as const
