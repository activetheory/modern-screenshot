import type { Context } from '../context'
import type { Options } from '../options'
import { createStyleElement, orCreateContext } from '../create-context'

import { imageToCanvas } from '../image-to-canvas'
import { cleanupCanvas, createImage, svgToDataUrl, XMLNS } from '../utils'
import { domToForeignObjectSvg } from './dom-to-foreign-object-svg'

export async function domToImage2<T extends Node>(node: T, options?: Options): Promise<HTMLImageElement>
export async function domToImage2<T extends Node>(context: Context<T>): Promise<HTMLImageElement>
export async function domToImage2(node: any, options?: any): Promise<HTMLImageElement> {
  const context = await orCreateContext(node, options)
  const { type, quality, previousContext2d } = context
  const svg = await domToForeignObjectSvg(context)
  const dataUrl = svgToDataUrl(svg, context.isEnable('removeControlCharacter'))
  if (!context.autoDestruct) {
    context.svgStyleElement = createStyleElement(context.ownerDocument)
    context.svgDefsElement = context.ownerDocument?.createElementNS(XMLNS, 'defs')
    context.svgStyles.clear()
  }
  const image = createImage(dataUrl, svg.ownerDocument)
  const canvas = await imageToCanvas(image, context, true)
  const url = await new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob))
      }
      else {
        reject(new Error('Failed to create blob'))
      }
    }, type, quality)
  })
  const image2 = createImage(url, svg.ownerDocument)
  cleanupCanvas(canvas, previousContext2d!)
  return image2
}
