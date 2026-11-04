import { useCallback, useEffect, useRef, useState } from 'react'
import exifr from 'exifr'
import { createDemoPhotos } from '../lib/demoPhotos.js'

async function readCaptureMetadata(file) {
  try {
    const data = await exifr.parse(file, ['ExposureTime', 'ShutterSpeedValue', 'FNumber', 'ApertureValue', 'ISO', 'PhotographicSensitivity', 'ISOSpeedRatings'])
    if (!data) return null
    return {
      exposureTime: data.ExposureTime ?? null,
      shutterSpeedValue: data.ShutterSpeedValue ?? null,
      fNumber: data.FNumber ?? null,
      apertureValue: data.ApertureValue ?? null,
      iso: data.ISO ?? data.PhotographicSensitivity ?? data.ISOSpeedRatings ?? null,
    }
  } catch {
    return null
  }
}

async function loadImage(file) {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    const imageReady = new Promise((resolve, reject) => {
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error(file.name))
    })
    const metadataReady = readCaptureMetadata(file)
    image.src = url
    const [loadedImage, capture] = await Promise.all([imageReady, metadataReady])
    return {
      id: `photo-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
      name: file.name,
      image: loadedImage,
      url,
      width: loadedImage.naturalWidth,
      height: loadedImage.naturalHeight,
      selected: true,
      local: true,
      capture,
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

export function usePhotoLibrary(onError) {
  const [photos, setPhotos] = useState([])
  const [activeId, setActiveId] = useState(null)
  const photosRef = useRef(photos)

  useEffect(() => { photosRef.current = photos }, [photos])

  useEffect(() => {
    let cancelled = false
    createDemoPhotos().then((examples) => {
      if (cancelled) return
      setPhotos((current) => current.length ? [...examples, ...current] : examples)
      setActiveId((current) => current || examples[0]?.id || null)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => () => {
    photosRef.current.forEach((photo) => {
      if (photo.local) URL.revokeObjectURL(photo.url)
    })
  }, [])

  const addFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'))
    if (!files.length) {
      onError('请选择图片文件')
      return
    }
    const results = await Promise.allSettled(files.map(loadImage))
    const loaded = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
    results.filter((result) => result.status === 'rejected').forEach((result) => onError(`无法读取 ${result.reason.message}`))
    if (!loaded.length) return
    setPhotos((current) => [...current, ...loaded])
    setActiveId((current) => current || loaded[0].id)
  }, [onError])

  const removePhoto = useCallback((id) => {
    const removed = photosRef.current.find((photo) => photo.id === id)
    if (removed?.local) URL.revokeObjectURL(removed.url)
    setActiveId((currentId) => currentId === id ? photosRef.current.find((photo) => photo.id !== id)?.id ?? null : currentId)
    setPhotos((current) => current.filter((photo) => photo.id !== id))
  }, [])

  const clearPhotos = useCallback(() => {
    photosRef.current.forEach((photo) => {
      if (photo.local) URL.revokeObjectURL(photo.url)
    })
    setPhotos([])
    setActiveId(null)
  }, [])

  const toggleSelected = useCallback((id) => {
    setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, selected: !photo.selected } : photo))
  }, [])

  const toggleSelectAll = useCallback(() => {
    setPhotos((current) => {
      const select = !current.length || !current.every((photo) => photo.selected)
      return current.map((photo) => ({ ...photo, selected: select }))
    })
  }, [])

  return { photos, setPhotos, activeId, setActiveId, addFiles, removePhoto, clearPhotos, toggleSelected, toggleSelectAll }
}
