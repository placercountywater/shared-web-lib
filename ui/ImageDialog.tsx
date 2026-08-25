'use client'

import {type ReactNode, type ReactElement, type MouseEvent, Children, isValidElement, useCallback, useRef, useState} from 'react'
import imgixPreloadUrl from '../next/imgixPreloadUrl'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog'
import {Button} from '../../components/ui/button'
import {ButtonGroup} from '../../components/ui/button-group'
import {cn} from '../_classnames'

export type ImageDialogSize = 'sm' | 'base' | 'lg' | 'xl' | 'fit'

export type ImageDialogProps = {
  /**
   * Element that opens the dialog (thumbnail, button, etc.)
   *
   * Example:
   * <ImageDialog
   *   trigger={
   *     <button type="button">
   *       <img ... />
   *     </button>
   *   }
   * >
   *   <img ... />
   * </ImageDialog>
   */
  trigger: ReactNode

  /** Dialog title for accessibility. If omitted, a visually-hidden title is rendered. */
  title?: string

  /** Optional description text below the title. */
  description?: string

  /** Dialog body content (typically a large image). */
  children: ReactNode

  /** Optional className for DialogContent container. */
  contentClassName?: string

  /** Optional className for the body wrapper around children. */
  bodyClassName?: string

  /** Control dialog open state (optional). */
  open?: boolean

  /** Handler for controlled open state (optional). */
  onOpenChange?: (open: boolean) => void

  /** Preset dialog width. Defaults to 'base'. */
  size?: ImageDialogSize

  /** Close the dialog when the image is double-clicked / double-tapped. Defaults to true. */
  closeOnDoubleTap?: boolean

  /** Show a small toolbar with icon buttons (e.g., download, close). */
  showToolbar?: boolean

  /**
   * Icon for the toolbar's close button, from your app's icon library. This
   * library ships no icons of its own. Optional — the button is labelled
   * "Close", so omitting this just gives a text-only button. Only used when
   * `showToolbar` is true.
   */
  closeIcon?: ReactNode

  /**
   * Icon for the toolbar's download button, from your app's icon library.
   * Optional for the same reason as `closeIcon`. Only used when `showToolbar`
   * is true.
   */
  downloadIcon?: ReactNode

  /** Optional explicit URL to use for downloading the image. */
  downloadHref?: string

  /** Optional filename to suggest when downloading the image. */
  downloadFilename?: string

  /** Optional caption overlaid at the bottom of the image. */
  caption?: string

  /**
   * Optional className applied to the caption element.
   * Use this to override text color, background, size, etc. when the image
   * colors make the default white-on-dark-scrim hard to read.
   */
  captionClassName?: string

  /**
   * Optional URL to preload on hover/focus so the full-res image is already
   * in the browser cache when the dialog opens.
   *
   * Tip: pass `imgixUrlLoader({ src, width: 1200, quality: 75 })` — or use
   * `window.innerWidth` at hover time by passing a function:
   *   preloadSrc={() => imgixUrlLoader({ src, width: window.innerWidth, quality: 75 })}
   */
  preloadSrc?: string | (() => string)
}

const widthClasses: Record<ImageDialogSize, string> = {
  // IMPORTANT: These must be *static strings* so Tailwind can generate the
  // arbitrary-value utilities. If these are built from template strings at
  // runtime, Tailwind won't see them and the dialog falls back to `w-full`.
  //
  // The upstream DialogContent includes `w-full` and `sm:max-w-md`, so we
  // override BOTH width and max-width.
  sm: 'max-w-none sm:max-w-none w-[min(96vw,720px)] sm:w-[min(94vw,720px)] md:w-[min(92vw,720px)]',
  base: 'max-w-none sm:max-w-none w-[min(96vw,900px)] sm:w-[min(94vw,900px)] md:w-[min(92vw,900px)]',
  lg: 'max-w-none sm:max-w-none w-[min(96vw,1200px)] sm:w-[min(94vw,1200px)] md:w-[min(92vw,1200px)]',
  xl: 'max-w-none sm:max-w-none w-[min(96vw,1600px)] sm:w-[min(94vw,1600px)] md:w-[min(92vw,1600px)]',
  fit: 'max-w-none sm:max-w-none w-[100vw]'
}

// The px cap baked into each `widthClasses` entry above, in CSS pixels. Keep
// in sync with it by hand — needed so the hover-preload fallback below can
// warm the same URL the dialog's <Image> will actually request; `fit` has no
// cap since that preset is genuinely 100vw.
const sizeMaxWidth: Record<ImageDialogSize, number | undefined> = {
  sm: 720,
  base: 900,
  lg: 1200,
  xl: 1600,
  fit: undefined
}

/**
 * ImageDialog
 *
 * A shadcn/ui (Base UI) dialog wrapper for image/lightbox-style previews.
 *
 * Key behaviors:
 * - Accepts any trigger via `trigger` (passed as the `render` prop to DialogTrigger).
 * - Renders an accessible title (visually hidden if not provided). Description
 *   is only rendered when explicitly passed to avoid screen readers reading the
 *   title twice.
 * - Uses `size` presets to control DialogContent width (and removes shadcn's default max-width via `max-w-none`).
 * - Click outside the image (on the backdrop area within the dialog) closes it.
 * - Double-tap/double-click to close is on by default (`closeOnDoubleTap`).
 * - Optional toolbar (download + close) renders inside the dialog so it stays
 *   within Base UI's focus trap.
 */
export default function ImageDialog({
  trigger,
  title,
  description,
  children,
  contentClassName,
  bodyClassName,
  open,
  onOpenChange,
  size = 'base',
  closeOnDoubleTap = true,
  showToolbar = false,
  closeIcon,
  downloadIcon,
  downloadHref,
  downloadFilename,
  caption,
  captionClassName,
  preloadSrc
}: ImageDialogProps) {
  const isControlled = open !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const effectiveOpen = isControlled ? open : uncontrolledOpen

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const imageContainerRef = useRef<HTMLElement | null>(null)
  const preloadedRef = useRef(false)

  // Extract src from the children React element so call sites don't need to
  // repeat the URL as a separate prop.
  const autoSrc = (() => {
    let src: string | undefined
    Children.forEach(children, (child) => {
      if (!src && isValidElement(child) && typeof (child.props as {src?: string}).src === 'string') {
        src = (child.props as {src: string}).src
      }
    })
    return src
  })()

  const handlePreload = useCallback(() => {
    if (preloadedRef.current) return
    try {
      const url =
        typeof preloadSrc === 'function' ? preloadSrc()
        : preloadSrc
        ?? (autoSrc ? imgixPreloadUrl(autoSrc, 75, sizeMaxWidth[size]) : undefined)
      if (!url) return
      preloadedRef.current = true
      const img = new window.Image()
      img.src = url
    } catch {
      // non-imgix or invalid src — skip preload silently
    }
  }, [preloadSrc, autoSrc, size])

  const resolvedTitle = title ?? 'Image preview'

  // Close when clicking the figure background (beside the image) or the
  // body wrapper (above/below the figure). Mouse-only shortcut for an
  // action (close) that's already fully keyboard-accessible via Base UI's
  // native Escape handling.
  const handleBodyClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const figure = imageContainerRef.current
      if (!figure) return
      const target = e.target as Node
      if (target === figure || target === e.currentTarget) {
        handleOpenChange(false)
      }
    },
    [handleOpenChange]
  )

  const handleDownload = useCallback(() => {
    const source = downloadHref ?? getImgSrc()

    if (!source) return

    const u = new URL(source, window.location.href)

    // Detect Imgix URLs (e.g. *.imgix.net)
    const isImgix = u.hostname.endsWith('imgix.net')

    if (isImgix) {
      // Strip Imgix transforms
      u.search = ''

      // Suggest filename
      const filename =
        downloadFilename ??
        decodeURIComponent(u.pathname.split('/').pop() || 'image')

      // Imgix-specific download query param
      u.searchParams.set('dl', filename)

      // Navigate to trigger download (Imgix will force attachment via headers)
      window.location.href = u.toString()
      return
    }

    // Non-Imgix: fall back to opening the image in a new tab.
    // (Some browsers ignore the `download` attribute for cross-origin URLs.)
    if (downloadFilename) {
      const a = document.createElement('a')
      a.href = source
      a.download = downloadFilename
      a.rel = 'noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      window.open(source, '_blank', 'noopener,noreferrer')
    }

    function getImgSrc() {
      const img = imageContainerRef.current?.querySelector(
        'img'
      ) as HTMLImageElement | null
      return img?.currentSrc || img?.getAttribute('src') || null
    }
  }, [downloadHref, downloadFilename])

  return (
    <Dialog open={effectiveOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={trigger as ReactElement}
        onPointerEnter={handlePreload}
      />

      <DialogContent
        showCloseButton={false}
        className={cn(
          'border-none bg-transparent shadow-none ring-0 outline-none p-0',
          widthClasses[size],
          contentClassName
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle className="sr-only">{resolvedTitle}</DialogTitle>
          {description && (
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* relative wrapper keeps the toolbar inside the focus trap without
            disturbing DialogContent's fixed centering */}
        <div className="relative">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- mouse-only shortcut for an action (close) that's already fully keyboard-accessible via Base UI's native Escape handling */}
          <div
            className={cn(
              'flex size-full justify-center overflow-auto',
              bodyClassName
            )}
            onClick={handleBodyClick}
          >
            <figure
              ref={imageContainerRef}
              onDoubleClick={() => {
                if (closeOnDoubleTap) handleOpenChange(false)
              }}
              className={cn(
                'relative group select-none w-full',
                '[&_img]:mx-auto [&_img]:max-h-[94dvh] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain',
                showToolbar && 'cursor-default',
                closeOnDoubleTap && !showToolbar && 'cursor-pointer',
                size === 'fit' && '[&_img]:max-h-dvh'
              )}
            >
              {children}
              {caption && (
                <figcaption
                  className={cn(
                    'absolute right-2 bottom-2 px-2 py-0.5 text-xs text-white bg-black/50 rounded',
                    captionClassName
                  )}
                >
                  {caption}
                </figcaption>
              )}
            </figure>
          </div>

          {showToolbar && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-10 flex justify-center px-4">
              <div className="bg-popover/90 border-border pointer-events-auto rounded-lg border shadow-xl backdrop-blur">
                <ButtonGroup aria-label="Media controls">
                  <DialogClose
                    render={
                      <Button
                        variant="outline"
                        aria-label="Close image dialog"
                        size="sm"
                      />
                    }
                  >
                    {closeIcon} Close
                  </DialogClose>
                  <Button
                    variant="outline"
                    aria-label="Download image"
                    onClick={handleDownload}
                    size="sm"
                  >
                    {downloadIcon} Download
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
