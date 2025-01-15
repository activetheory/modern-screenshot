import type { Context } from '../context'
import type { Options } from '../options'
import { createStyleElement, orCreateContext } from '../create-context'

import { svgToDataUrl, XMLNS } from '../utils'
import { domToForeignObjectSvg } from './dom-to-foreign-object-svg'

export async function domToSvgUrl<T extends Node>(node: T, options?: Options): Promise<string>
export async function domToSvgUrl<T extends Node>(context: Context<T>): Promise<string>
export async function domToSvgUrl(node: any, options?: any): Promise<string> {
  const context = await orCreateContext(node, options)
  const svg = await domToForeignObjectSvg(context)
  const dataUrl = svgToDataUrl(svg, context.isEnable('removeControlCharacter'))
  if (!context.autoDestruct) {
    context.svgStyleElement = createStyleElement(context.ownerDocument)
    context.svgDefsElement = context.ownerDocument?.createElementNS(XMLNS, 'defs')
    context.svgStyles.clear()
  }
  return dataUrl
}
