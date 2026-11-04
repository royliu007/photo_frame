export const PRESETS = [
  { id: 'classic', name: '经典白边', note: '均匀留白 · 压边线', bg: '#FFFFFF', ink: '#191713', border: 5.5, bottom: 0, radius: 0.4, hairline: true, shadow: 0, ticks: false, film: false, pos: 'br', dark: false },
  { id: 'polaroid', name: '拍立得', note: '下留白 · 手写标注', bg: '#FAF7F0', ink: '#242220', border: 4.6, bottom: 15, radius: 0.6, hairline: false, shadow: 0.55, ticks: false, film: false, pos: 'bl', dark: false },
  { id: 'gallery', name: '画廊', note: '大留白 · 作品标签', bg: '#FFFFFF', ink: '#191713', border: 11, bottom: 11, radius: 0, hairline: true, shadow: 0, ticks: false, film: false, pos: 'bl', dark: false },
  { id: 'film', name: '胶片', note: '暗场片边 · 齿孔', bg: '#14130F', ink: '#C9C2B4', border: 6.2, bottom: 3.6, radius: 0.8, hairline: false, shadow: 0, ticks: false, film: true, pos: 'bl', dark: true },
  { id: 'float', name: '浮光卡', note: '圆角卡片 · 柔投影', bg: '#F1EDE4', ink: '#242220', border: 6, bottom: 3.2, radius: 2.6, hairline: true, shadow: 0.8, ticks: false, film: false, pos: 'bl', dark: false },
  { id: 'tick', name: '描边框', note: '双线内框 · 角标', bg: '#FBF9F4', ink: '#191713', border: 8, bottom: 8, radius: 0, hairline: true, shadow: 0, ticks: true, film: false, pos: 'bl', dark: false },
  { id: 'frost', name: '磨砂玻璃', note: '毛玻璃底 · 柔光', bg: '#EFE9DE', ink: '#2B251D', border: 6.4, bottom: 6.4, radius: 0.9, hairline: false, shadow: 0.55, ticks: false, film: false, pos: 'bl', dark: true },
  { id: 'liquid', name: '液态玻璃', note: '高光折射 · 通透', bg: '#E9E2D8', ink: '#FFFFFF', border: 7, bottom: 5.6, radius: 2.2, hairline: false, shadow: 0.5, ticks: false, film: false, pos: 'bl', dark: true },
  { id: 'blurred', name: '柔焦背景', note: '原图扩展 · 模糊留边', bg: '#101713', ink: '#F5F2E9', border: 4.2, bottom: 8, radius: 0.8, hairline: false, shadow: 1, ticks: false, film: false, blurBackground: true, blurStrength: 0.09, darken: 0.58, pos: 'bl', dark: true },
]

export const INITIAL_STYLE = {
  border: 11,
  bottom: 11,
  radius: 0,
  bg: '#FFFFFF',
  hairline: true,
  shadow: 0,
  ticks: false,
  film: false,
  blurBackground: false,
  blurStrength: 0,
  darken: 0,
}

export const INITIAL_WATERMARK = {
  on: true,
  text: '© 留白 STUDIO',
  pos: 'bl',
  opacity: 0.62,
  size: 100,
  ink: '#191713',
  meta: true,
  brand: '',
  showExposure: false,
}

export function styleForPreset(preset) {
  return {
    border: preset.border,
    bottom: preset.bottom,
    radius: preset.radius,
    bg: preset.bg,
    hairline: preset.hairline,
    shadow: preset.shadow,
    ticks: preset.ticks,
    film: preset.film,
    blurBackground: preset.blurBackground ?? false,
    blurStrength: preset.blurStrength ?? 0,
    darken: preset.darken ?? 0,
  }
}
