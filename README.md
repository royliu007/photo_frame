# 留白 · 边框水印工坊

基于 React 与 Vite 的本地照片边框和水印编辑器。图片在浏览器中处理，不会上传。

## 启动

```bash
npm install
npm run dev
```

生产构建：`npm run build`。预览构建产物：`npm run preview`。

## 代码结构

- `src/components/`：顶部栏、照片列表、画布预览、样式设置和导出工具栏。
- `src/hooks/usePhotoLibrary.js`：图片导入、选择、移除和对象 URL 生命周期。
- `src/data/presets.js`：边框预设及初始编辑参数。
- `src/lib/canvasRenderer.js`：画布尺寸计算、实时绘制和导出渲染。
- `src/data/cameraBrands.js`：可选的相机品牌字标样式。
- `src/hooks/usePhotoLibrary.js`：在本地读取照片的快门、光圈和 ISO EXIF 信息。
- `src/lib/demoPhotos.js`：本地生成的示例图片。
- `src/App.jsx`：组合页面组件并维护编辑器状态。
