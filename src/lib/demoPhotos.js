function addNoise(context, width, height) {
  context.save()
  context.globalAlpha = 0.06
  for (let index = 0; index < 2600; index += 1) {
    const value = Math.floor(Math.random() * 255)
    context.fillStyle = `rgb(${value},${value},${value})`
    context.fillRect(Math.random() * width, Math.random() * height, 1, 1)
  }
  context.restore()
}

function drawDusk(context, width, height) {
  const sky = context.createLinearGradient(0, 0, 0, height)
  ;[[0, '#F0D6B6'], [0.3, '#E0AC82'], [0.48, '#C9835C'], [0.6, '#8E5B4E'], [0.78, '#4B3532'], [1, '#2A1F22']].forEach(([stop, color]) => sky.addColorStop(stop, color))
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)
  const sun = context.createRadialGradient(width * 0.63, height * 0.34, 0, width * 0.63, height * 0.34, height * 0.5)
  sun.addColorStop(0, 'rgba(255,236,200,.85)')
  sun.addColorStop(0.35, 'rgba(255,206,160,.28)')
  sun.addColorStop(1, 'rgba(255,190,140,0)')
  context.fillStyle = sun
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#FCEDD2'
  context.beginPath()
  context.arc(width * 0.63, height * 0.335, height * 0.062, 0, Math.PI * 2)
  context.fill()
  ;[[0.6, 0.035, '#8C5C55', 0.55], [0.685, 0.03, '#61403F', 0.8], [0.775, 0.022, '#33262A', 0.95]].forEach(([base, amp, color, alpha], layer) => {
    context.beginPath()
    context.moveTo(0, height)
    for (let index = 0; index <= 48; index += 1) {
      const px = width * index / 48
      const py = height * base + Math.sin(index * 0.42 + layer * 2) * height * amp + Math.sin(index * 1.13 + layer) * height * amp * 0.42
      context.lineTo(px, py)
    }
    context.lineTo(width, height)
    context.closePath()
    context.globalAlpha = alpha
    context.fillStyle = color
    context.fill()
  })
  context.globalAlpha = 1
  const water = context.createLinearGradient(0, height * 0.8, 0, height)
  water.addColorStop(0, 'rgba(58,42,44,.55)')
  water.addColorStop(1, 'rgba(24,19,22,.95)')
  context.fillStyle = water
  context.fillRect(0, height * 0.8, width, height * 0.2)
}

function drawArch(context, width, height) {
  const background = context.createLinearGradient(0, 0, width, height)
  background.addColorStop(0, '#D6D2C0')
  background.addColorStop(1, '#B9B49E')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)
  const archWidth = width * 0.3
  const archHeight = height * 0.62
  const left = width * 0.4
  const floor = height * 0.79
  context.fillStyle = 'rgba(150,136,110,.35)'
  context.fillRect(0, floor, width, 2)
  context.beginPath()
  context.moveTo(left, floor)
  context.lineTo(left, floor - archHeight + archWidth / 2)
  context.arc(left + archWidth / 2, floor - archHeight + archWidth / 2, archWidth / 2, Math.PI, 0)
  context.lineTo(left + archWidth, floor)
  context.closePath()
  const arch = context.createLinearGradient(left, floor - archHeight, left + archWidth, floor)
  arch.addColorStop(0, '#C08A56')
  arch.addColorStop(0.6, '#A5703F')
  arch.addColorStop(1, '#7B522D')
  context.fillStyle = arch
  context.fill()
  context.fillStyle = '#F2EAD8'
  context.beginPath()
  context.arc(width * 0.235, height * 0.725, height * 0.052, 0, Math.PI * 2)
  context.fill()
}

function drawBauhaus(context, width, height) {
  context.fillStyle = '#F1EBDD'
  context.fillRect(0, 0, width, height)
  context.strokeStyle = 'rgba(60,50,36,.09)'
  for (let index = 1; index < 6; index += 1) {
    context.beginPath()
    context.moveTo(width * index / 6, 0)
    context.lineTo(width * index / 6, height)
    context.moveTo(0, height * index / 6)
    context.lineTo(width, height * index / 6)
    context.stroke()
  }
  context.fillStyle = '#1D1B17'
  context.beginPath()
  context.arc(width * 0.3, height * 0.62, height * 0.3, Math.PI, 0)
  context.closePath()
  context.fill()
  context.fillStyle = '#B4432B'
  context.fillRect(width * 0.52, height * 0.2, width * 0.22, height * 0.22)
  context.strokeStyle = 'rgba(29,27,23,.65)'
  context.lineWidth = 2
  context.beginPath()
  context.arc(width * 0.72, height * 0.62, height * 0.17, 0, Math.PI * 2)
  context.stroke()
  context.fillStyle = '#8C7A5C'
  context.fillRect(width * 0.445, height * 0.1, 3, height * 0.8)
}

export async function createDemoPhotos() {
  const examples = [
    { name: '示例 · 暮色山湖.jpg', paint: drawDusk },
    { name: '示例 · 拱门静物.jpg', paint: drawArch },
    { name: '示例 · 构成练习.jpg', paint: drawBauhaus },
  ]
  const width = 1680
  const height = 1120
  return Promise.all(examples.map(async ({ name, paint }, index) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    paint(context, width, height)
    if (index === 0) addNoise(context, width, height)
    const image = new Image()
    image.src = canvas.toDataURL('image/jpeg', 0.88)
    if (image.decode) await image.decode()
    else await new Promise((resolve) => { image.onload = resolve })
    return { id: `demo-${index}`, name, image, url: image.src, width, height, selected: true }
  }))
}
