import { CAMERA_BRANDS } from '../data/cameraBrands.js'

const FONT_UI = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif'
const FONT_MONO = 'ui-monospace,"SF Mono",Menlo,"Roboto Mono",monospace'

export function getFrameGeometry(photo, style) {
  const shortSide = Math.min(photo.width, photo.height)
  const border = Math.round(shortSide * style.border / 100)
  const bottom = Math.round(shortSide * style.bottom / 100)
  return {
    shortSide,
    border,
    bottom,
    width: photo.width + border * 2,
    height: photo.height + border * 2 + bottom,
  }
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius || 0, Math.min(width, height) / 2))
  context.beginPath()
  if (context.roundRect) {
    context.roundRect(x, y, width, height, r)
    return
  }
  context.moveTo(x + r, y)
  context.arcTo(x + width, y, x + width, y + height, r)
  context.arcTo(x + width, y + height, x, y + height, r)
  context.arcTo(x, y + height, x, y, r)
  context.arcTo(x, y, x + width, y, r)
  context.closePath()
}

function drawLabel(context, text, x, y, align, size, color, alpha, spacing, font) {
  if (!text) return
  context.save()
  context.font = `${size}px ${font || FONT_UI}`
  if ('letterSpacing' in context) context.letterSpacing = `${spacing || 0}px`
  context.textAlign = align
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.globalAlpha = alpha
  context.fillText(text, x, y)
  context.restore()
}

function measureBrandWidth(context, brandId, size) {
  const brand = CAMERA_BRANDS.find((item) => item.id === brandId)
  if (!brand) return 0
  const spacing = size * brand.tracking
  context.save()
  context.font = `${brand.weight} ${size}px ${brand.font}`
  if ('letterSpacing' in context) context.letterSpacing = `${spacing}px`
  const width = context.measureText(brand.text).width + Math.max(0, brand.text.length - 1) * spacing
  context.restore()
  return width + (brand.dotColor ? size * 0.88 : 0)
}

function drawCameraLogo(context, brandId, x, y, size, color, alpha) {
  const brand = CAMERA_BRANDS.find((item) => item.id === brandId)
  if (!brand) return 0
  const spacing = size * brand.tracking
  context.save()
  context.font = `${brand.weight} ${size}px ${brand.font}`
  if ('letterSpacing' in context) context.letterSpacing = `${spacing}px`
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.globalAlpha = alpha
  context.fillStyle = color
  let textX = x
  let totalWidth = context.measureText(brand.text).width + Math.max(0, brand.text.length - 1) * spacing
  if (brand.dotColor) {
    const dotRadius = Math.max(1.5, size * 0.22)
    context.fillStyle = brand.dotColor
    context.beginPath()
    context.arc(x + dotRadius, y, dotRadius, 0, Math.PI * 2)
    context.fill()
    textX += dotRadius * 2 + size * 0.22
    totalWidth += dotRadius * 2 + size * 0.22
    context.fillStyle = color
  }
  context.fillText(brand.text, textX, y)
  context.restore()
  return totalWidth
}

function measureLabel(context, text, size, spacing, font) {
  context.save()
  context.font = `${size}px ${font || FONT_UI}`
  if ('letterSpacing' in context) context.letterSpacing = `${spacing || 0}px`
  const width = context.measureText(text).width + Math.max(0, text.length - 1) * (spacing || 0)
  context.restore()
  return width
}

function drawFittedLabel(context, text, x, y, align, size, color, alpha, spacing, font, maxWidth) {
  const measuredWidth = measureLabel(context, text, size, spacing, font)
  const scale = measuredWidth > maxWidth && measuredWidth > 0 ? maxWidth / measuredWidth : 1
  drawLabel(context, text, x, y, align, size * scale, color, alpha, spacing * scale, font)
}

function drawWatermarkLine(context, watermark, x, y, align, size, maxWidth) {
  const brandSize = size * 0.72
  const gap = size * 0.42
  const brandWidth = measureBrandWidth(context, watermark.brand, brandSize)
  const textSpacing = size * (align === 'center' ? 0.22 : 0.16)
  const textWidth = watermark.text ? measureLabel(context, watermark.text, size, textSpacing, FONT_UI) : 0
  const totalWidth = brandWidth + (brandWidth && textWidth ? gap : 0) + textWidth
  const scale = totalWidth > maxWidth && totalWidth > 0 ? maxWidth / totalWidth : 1
  const fittedBrandSize = brandSize * scale
  const fittedGap = gap * scale
  const fittedBrandWidth = brandWidth * scale
  const fittedTextSpacing = textSpacing * scale
  const fittedWidth = totalWidth * scale
  const startX = align === 'left' ? x : align === 'right' ? x - fittedWidth : x - fittedWidth / 2
  if (brandWidth) drawCameraLogo(context, watermark.brand, startX, y, fittedBrandSize, watermark.ink, watermark.opacity)
  if (watermark.text) {
    const textX = startX + fittedBrandWidth + (brandWidth && textWidth ? fittedGap : 0)
    drawLabel(context, watermark.text, textX, y, 'left', size * scale, watermark.ink, watermark.opacity, fittedTextSpacing, FONT_UI)
  }
}

function formatExposure(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return '—'
  if (number < 1) return `1/${Math.max(1, Math.round(1 / number))}s`
  return `${Number(number.toFixed(2))}s`
}

function formatAperture(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? `f/${Number(number.toFixed(1))}` : '—'
}

function captureDetails(photo, watermark) {
  const parts = []
  if (watermark.meta) parts.push(`${photo.width} × ${photo.height}`)
  if (watermark.showExposure) {
    const capture = photo.capture || {}
    const shutter = capture.exposureTime ?? (capture.shutterSpeedValue != null && Number.isFinite(Number(capture.shutterSpeedValue)) ? 1 / (2 ** Number(capture.shutterSpeedValue)) : null)
    const aperture = capture.fNumber ?? (capture.apertureValue != null && Number.isFinite(Number(capture.apertureValue)) ? 2 ** (Number(capture.apertureValue) / 2) : null)
    const isoValue = capture.iso
    const iso = Array.isArray(isoValue) ? isoValue[0] : isoValue
    const isoText = Number.isFinite(Number(iso)) && Number(iso) > 0 ? Math.round(Number(iso)) : '—'
    parts.push(`快门 ${formatExposure(shutter)}`, `光圈 ${formatAperture(aperture)}`, `ISO ${isoText}`)
  }
  return parts.join(' · ')
}

export function drawBlurBackground(target, photo, style, maxSide = Infinity) {
  if (!target || !photo?.image) return
  const geometry = getFrameGeometry(photo, style)
  const scale = Math.min(1, maxSide / Math.max(geometry.width, geometry.height))
  target.width = Math.max(1, Math.round(geometry.width * scale))
  target.height = Math.max(1, Math.round(geometry.height * scale))

  const context = target.getContext('2d')
  context.setTransform(scale, 0, 0, scale, 0, 0)
  context.clearRect(0, 0, geometry.width, geometry.height)
  const coverScale = Math.max(geometry.width / photo.width, geometry.height / photo.height)
  const backgroundWidth = photo.width * coverScale
  const backgroundHeight = photo.height * coverScale
  context.drawImage(
    photo.image,
    (geometry.width - backgroundWidth) / 2,
    (geometry.height - backgroundHeight) / 2,
    backgroundWidth,
    backgroundHeight,
  )
}

function blurPixelsWithGaussianKernel(canvas, sigma) {
  if (sigma < 0.75) return
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  const source = image.data
  const radius = Math.ceil(sigma * 3)
  const kernel = new Float32Array(radius * 2 + 1)
  let kernelTotal = 0
  for (let offset = -radius; offset <= radius; offset += 1) {
    const weight = Math.exp(-(offset * offset) / (2 * sigma * sigma))
    kernel[offset + radius] = weight
    kernelTotal += weight
  }
  for (let index = 0; index < kernel.length; index += 1) kernel[index] /= kernelTotal

  const horizontal = new Float32Array(source.length)
  const width = canvas.width
  const height = canvas.height
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * 4
      let red = 0
      let green = 0
      let blue = 0
      let alpha = 0
      for (let offset = -radius; offset <= radius; offset += 1) {
        const sampleX = Math.min(width - 1, Math.max(0, x + offset))
        const sample = (y * width + sampleX) * 4
        const weight = kernel[offset + radius]
        red += source[sample] * weight
        green += source[sample + 1] * weight
        blue += source[sample + 2] * weight
        alpha += source[sample + 3] * weight
      }
      horizontal[pixel] = red
      horizontal[pixel + 1] = green
      horizontal[pixel + 2] = blue
      horizontal[pixel + 3] = alpha
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * 4
      let red = 0
      let green = 0
      let blue = 0
      let alpha = 0
      for (let offset = -radius; offset <= radius; offset += 1) {
        const sampleY = Math.min(height - 1, Math.max(0, y + offset))
        const sample = (sampleY * width + x) * 4
        const weight = kernel[offset + radius]
        red += horizontal[sample] * weight
        green += horizontal[sample + 1] * weight
        blue += horizontal[sample + 2] * weight
        alpha += horizontal[sample + 3] * weight
      }
      source[pixel] = red
      source[pixel + 1] = green
      source[pixel + 2] = blue
      source[pixel + 3] = alpha
    }
  }
  context.putImageData(image, 0, 0)
}

function drawGaussianBackground(context, photo, geometry, blurRadius) {
  const padding = Math.ceil(blurRadius * 4)
  const expandedWidth = geometry.width + padding * 2
  const expandedHeight = geometry.height + padding * 2
  const maxWorkSide = 720
  const maxWorkSigma = 8
  const workScale = blurRadius > 0
    ? Math.min(1, maxWorkSide / Math.max(expandedWidth, expandedHeight), maxWorkSigma / blurRadius)
    : 1
  const backgroundCanvas = document.createElement('canvas')
  backgroundCanvas.width = Math.max(1, Math.round(expandedWidth * workScale))
  backgroundCanvas.height = Math.max(1, Math.round(expandedHeight * workScale))
  const backgroundContext = backgroundCanvas.getContext('2d', { willReadFrequently: true })
  const backgroundScale = Math.max(expandedWidth / photo.width, expandedHeight / photo.height)
  const backgroundWidth = photo.width * backgroundScale
  const backgroundHeight = photo.height * backgroundScale
  backgroundContext.drawImage(
    photo.image,
    (expandedWidth - backgroundWidth) * workScale / 2,
    (expandedHeight - backgroundHeight) * workScale / 2,
    backgroundWidth * workScale,
    backgroundHeight * workScale,
  )

  const workScaleX = backgroundCanvas.width / expandedWidth
  const workScaleY = backgroundCanvas.height / expandedHeight
  blurPixelsWithGaussianKernel(backgroundCanvas, blurRadius * (workScaleX + workScaleY) / 2)
  context.drawImage(
    backgroundCanvas,
    padding * workScaleX,
    padding * workScaleY,
    geometry.width * workScaleX,
    geometry.height * workScaleY,
    0,
    0,
    geometry.width,
    geometry.height,
  )
}

export function drawFrame(target, photo, style, watermark, maxSide = Infinity, { drawBackground = true } = {}) {
  if (!target || !photo?.image) return
  const geometry = getFrameGeometry(photo, style)
  const scale = Math.min(1, maxSide / Math.max(geometry.width, geometry.height))
  target.width = Math.max(1, Math.round(geometry.width * scale))
  target.height = Math.max(1, Math.round(geometry.height * scale))

  const context = target.getContext('2d')
  context.setTransform(scale, 0, 0, scale, 0, 0)
  context.clearRect(0, 0, geometry.width, geometry.height)
  if (style.blurBackground && drawBackground) {
    const blurRadius = geometry.shortSide * (style.blurStrength || 0)
    drawGaussianBackground(context, photo, geometry, blurRadius)
    context.fillStyle = `rgba(8, 14, 11, ${style.darken})`
    context.fillRect(0, 0, geometry.width, geometry.height)
    const vignette = context.createRadialGradient(
      geometry.width / 2,
      geometry.height / 2,
      geometry.shortSide * 0.2,
      geometry.width / 2,
      geometry.height / 2,
      Math.max(geometry.width, geometry.height) * 0.72,
    )
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,.36)')
    context.fillStyle = vignette
    context.fillRect(0, 0, geometry.width, geometry.height)
  } else if (!style.blurBackground) {
    context.fillStyle = style.bg
    context.fillRect(0, 0, geometry.width, geometry.height)
  }

  const border = geometry.border
  const x = border
  const y = border
  const width = photo.width
  const height = photo.height
  const radius = geometry.shortSide * style.radius / 100

  if (style.shadow > 0) {
    context.save()
    context.shadowColor = style.blurBackground
      ? `rgba(0,0,0,${0.72 * style.shadow})`
      : `rgba(34,24,12,${0.34 * style.shadow})`
    context.shadowBlur = geometry.shortSide * (style.blurBackground ? 0.105 : 0.075) * style.shadow
    context.shadowOffsetY = geometry.shortSide * (style.blurBackground ? 0.04 : 0.024) * style.shadow
    context.fillStyle = '#000'
    roundedRect(context, x, y, width, height, radius)
    context.fill()
    context.restore()
  }

  context.save()
  roundedRect(context, x, y, width, height, radius)
  context.clip()
  context.drawImage(photo.image, x, y, width, height)
  if (!style.film) {
    const vignette = context.createLinearGradient(0, y + height * 0.72, 0, y + height)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.06)')
    context.fillStyle = vignette
    context.fillRect(x, y, width, height)
  }
  context.restore()

  if (style.hairline) {
    context.save()
    context.strokeStyle = style.film ? 'rgba(255,255,255,.12)' : 'rgba(24,20,14,.14)'
    context.lineWidth = Math.max(0.8, geometry.shortSide * 0.0012)
    roundedRect(context, x + 0.4, y + 0.4, width - 0.8, height - 0.8, Math.max(0, radius - 0.4))
    context.stroke()
    context.restore()
  }

  if (style.film) {
    const holeWidth = geometry.shortSide * 0.0105
    const holeHeight = geometry.shortSide * 0.0155
    const gap = geometry.shortSide * 0.0305
    const padding = geometry.shortSide * 0.019
    const topY = border / 2 - holeHeight / 2
    const bottomBand = border + geometry.bottom
    const bottomY = geometry.height - bottomBand / 2 - holeHeight / 2
    context.save()
    context.fillStyle = 'rgba(244,239,229,.9)'
    for (let holeX = padding; holeX < geometry.width - padding - holeWidth; holeX += holeWidth + gap) {
      roundedRect(context, holeX, topY, holeWidth, holeHeight, holeWidth * 0.3)
      context.fill()
      roundedRect(context, holeX, bottomY, holeWidth, holeHeight, holeWidth * 0.3)
      context.fill()
    }
    context.restore()
    context.save()
    context.translate(border * 0.48, geometry.height / 2)
    context.rotate(-Math.PI / 2)
    drawLabel(context, 'LIUBAI 400 · 36 EXP', 0, 0, 'center', Math.max(7, geometry.shortSide * 0.0112), watermark.ink, 0.5, geometry.shortSide * 0.004, FONT_MONO)
    context.restore()
  }

  if (style.ticks) {
    const inset = Math.max(4, border * 0.46)
    const length = geometry.shortSide * 0.05
    context.save()
    context.strokeStyle = watermark.ink
    context.lineWidth = Math.max(1, geometry.shortSide * 0.0016)
    context.globalAlpha = 0.55
    ;[[inset, inset, 1, 1], [geometry.width - inset, inset, -1, 1], [inset, geometry.height - inset, 1, -1], [geometry.width - inset, geometry.height - inset, -1, -1]].forEach(([px, py, dx, dy]) => {
      context.beginPath()
      context.moveTo(px + dx * length, py)
      context.lineTo(px, py)
      context.lineTo(px, py + dy * length)
      context.stroke()
    })
    context.globalAlpha = 0.16
    context.lineWidth = Math.max(0.7, geometry.shortSide * 0.0011)
    context.strokeRect(inset, inset, geometry.width - inset * 2, geometry.height - inset * 2)
    context.restore()
  }

  if (!watermark.on) return
  const fontSize = Math.max(8, geometry.shortSide * 0.019 * watermark.size / 100)
  if (geometry.bottom > 0) {
    const bandTop = border + height
    const bandHeight = border + geometry.bottom
    const centerY = bandTop + bandHeight / 2
    const watermarkY = centerY + fontSize * 0.06
    const column = watermark.pos[1]
    const align = column === 'l' ? 'left' : column === 'r' ? 'right' : 'center'
    const textX = align === 'left' ? border : align === 'right' ? geometry.width - border : geometry.width / 2

    if (align !== 'center') {
      context.save()
      context.strokeStyle = watermark.ink
      context.globalAlpha = Math.min(0.4, watermark.opacity * 0.55)
      context.lineWidth = Math.max(0.8, geometry.shortSide * 0.0014)
      const lineY = bandTop + bandHeight * 0.24
      context.beginPath()
      context.moveTo(textX, lineY)
      context.lineTo(textX + (align === 'left' ? 1 : -1) * geometry.shortSide * 0.042, lineY)
      context.stroke()
      context.restore()
    }

    drawWatermarkLine(context, watermark, textX, watermarkY, align, fontSize, geometry.width - border * 2)
    const details = captureDetails(photo, watermark)
    if (details) {
      const detailAlign = align === 'right' ? 'left' : 'right'
      const detailX = detailAlign === 'left' ? border : geometry.width - border
      drawFittedLabel(context, details, detailX, watermarkY, detailAlign, fontSize * 0.63, watermark.ink, watermark.opacity * 0.72, fontSize * 0.025, FONT_MONO, geometry.width - border * 2)
    }
    return
  }

  const column = watermark.pos[1]
  const row = watermark.pos[0]
  const padding = geometry.shortSide * 0.042
  const textX = column === 'l' ? x + padding : column === 'r' ? x + width - padding : x + width / 2
  const textY = row === 't' ? y + padding + fontSize * 0.55 : row === 'm' ? y + height / 2 : y + height - padding - fontSize * 0.15
  const align = column === 'l' ? 'left' : column === 'r' ? 'right' : 'center'
  context.save()
  context.shadowColor = 'rgba(0,0,0,.5)'
  context.shadowBlur = Math.max(2, geometry.shortSide * 0.008)
  drawWatermarkLine(context, watermark, textX, textY, align, fontSize, width - padding * 2)
  const details = captureDetails(photo, watermark)
  if (details) {
    const detailAlign = column === 'r' ? 'left' : 'right'
    const detailX = detailAlign === 'left' ? x + padding : x + width - padding
    drawFittedLabel(context, details, detailX, textY, detailAlign, fontSize * 0.63, watermark.ink, watermark.opacity * 0.72, fontSize * 0.025, FONT_MONO, width - padding * 2)
  }
  context.restore()
}
