import type { Context } from '../context'
import type { Options } from '../options'
import { createStyleElement, orCreateContext } from '../create-context'

import { createImage, svgToDataUrl, XMLNS } from '../utils'
import { domToForeignObjectSvg } from './dom-to-foreign-object-svg'

export async function domToSvgImage<T extends Node>(node: T, options?: Options): Promise<HTMLImageElement>
export async function domToSvgImage<T extends Node>(context: Context<T>): Promise<HTMLImageElement>
export async function domToSvgImage(node: any, options?: any): Promise<HTMLImageElement> {
  const context = await orCreateContext(node, options)
  const svg = await domToForeignObjectSvg(context)
  const dataUrl = svgToDataUrl(svg, context.isEnable('removeControlCharacter'))
  if (!context.autoDestruct) {
    context.svgStyleElement = createStyleElement(context.ownerDocument)
    context.svgDefsElement = context.ownerDocument?.createElementNS(XMLNS, 'defs')
    context.svgStyles.clear()
  }
  const image = createImage(dataUrl, svg.ownerDocument)
  return image
}
