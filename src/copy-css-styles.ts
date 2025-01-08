import type { Context } from './context'
import { getDefaultStyle } from './get-default-style'
import { getDiffStyle } from './get-diff-style'
import { IN_CHROME } from './utils'

export function copyCssStyles<T extends HTMLElement | SVGElement>(
  node: T,
  cloned: T,
  isRoot: boolean,
  context: Context,
): Map<string, [string, string]> {
  const { ownerWindow, includeStyleProperties, currentParentNodeStyle, reduceFontSizeFactor } = context
  const clonedStyle = cloned.style
  const computedStyle = ownerWindow!.getComputedStyle(node)
  const defaultStyle = getDefaultStyle(node, null, context)
  currentParentNodeStyle?.forEach((_, key) => {
    defaultStyle.delete(key)
  })
  const style = getDiffStyle(computedStyle, defaultStyle, includeStyleProperties)

  // fix
  style.delete('transition-property')
  style.delete('all') // svg: all
  style.delete('d') // svg: d
  style.delete('content') // Safari shows pseudoelements if content is set
  if (isRoot) {
    style.delete('margin-top')
    style.delete('margin-right')
    style.delete('margin-bottom')
    style.delete('margin-left')
    style.delete('margin-block-start')
    style.delete('margin-block-end')
    style.delete('margin-inline-start')
    style.delete('margin-inline-end')
    style.set('box-sizing', ['border-box', ''])
  }
  // fix background-clip: text
  if (style.get('background-clip')?.[0] === 'text') {
    cloned.classList.add('______background-clip--text')
  }
  // fix chromium
  // https://github.com/RigoCorp/html-to-image/blob/master/src/cssFixes.ts
  if (IN_CHROME) {
    if (!style.has('font-kerning'))
      style.set('font-kerning', ['normal', ''])

    if (
      (
        style.get('overflow-x')?.[0] === 'hidden'
        || style.get('overflow-y')?.[0] === 'hidden'
      )
      && style.get('text-overflow')?.[0] === 'ellipsis'
      && node.scrollWidth === node.clientWidth
    ) {
      style.set('text-overflow', ['clip', ''])
    }
  }

  style.forEach(([value, priority], name) => {
    if (name === 'font-size') {
      // reduce font size by a factor
      value = `${(Number.parseFloat(value) * reduceFontSizeFactor).toString()}px`
    }

    clonedStyle.setProperty(name, value, priority)
  })

  return style
}
