import { UIDetection } from '@/core/types'
import { createLogger } from './logger'

const logger = createLogger('imageUtils')

/**
 * 图像处理工具类
 */
export class ImageProcessor {
  /**
   * 从HTMLImageElement创建ImageData
   */
  static imageToImageData(image: HTMLImageElement): ImageData {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }

    ctx.drawImage(image, 0, 0)
    return ctx.getImageData(0, 0, image.width, image.height)
  }

  /**
   * 根据检测边界框裁剪图像
   */
  static cropDetection(image: HTMLImageElement, bbox: [number, number, number, number]): HTMLImageElement {
    const [x, y, width, height] = bbox

    // 创建一个新的Canvas并裁剪图像
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }

    // 裁剪图像
    ctx.drawImage(
      image,
      x,
      y,
      width,
      height, // 源矩形
      0,
      0,
      width,
      height // 目标矩形
    )

    // 将Canvas转换为Image元素
    const croppedImage = new Image()
    croppedImage.src = canvas.toDataURL()

    return croppedImage
  }

  /**
   * 可视化检测结果并返回数据URL
   */
  static visualizeDetections(image: HTMLImageElement, detections: UIDetection[]): string {
    // 创建Canvas
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }

    // 绘制原始图像
    ctx.drawImage(image, 0, 0)

    // 绘制检测框
    detections.forEach((detection, i) => {
      const [x, y, w, h] = detection.bbox

      // 绘制矩形
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, w, h)

      // 绘制标签背景
      const label = `${i + 1}: ${detection.type}`
      const textWidth = ctx.measureText(label).width + 10

      ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'
      ctx.fillRect(x, y - 25, textWidth, 25)

      // 绘制标签文本
      ctx.fillStyle = 'black'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(label, x + 5, y - 5)
    })

    // 返回数据URL
    return canvas.toDataURL('image/png')
  }

  /**
   * 调整图像大小，保持宽高比
   */
  static resizeImage(image: HTMLImageElement, maxWidth: number, maxHeight: number): HTMLImageElement {
    const canvas = document.createElement('canvas')
    let width = image.width
    let height = image.height

    // 计算新尺寸
    if (width > maxWidth || height > maxHeight) {
      if (width / height > maxWidth / maxHeight) {
        // 宽度限制
        height = height * (maxWidth / width)
        width = maxWidth
      } else {
        // 高度限制
        width = width * (maxHeight / height)
        height = maxHeight
      }
    }

    // 设置Canvas尺寸
    canvas.width = width
    canvas.height = height

    // 绘制调整大小的图像
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }

    ctx.drawImage(image, 0, 0, width, height)

    // 创建新的Image元素
    const resizedImage = new Image()
    resizedImage.src = canvas.toDataURL()

    return resizedImage
  }
}
