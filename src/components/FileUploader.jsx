import React, { useCallback } from 'react'

export default function FileUploader({ onFileSelect }) {
  const [dragging, setDragging] = React.useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFileSelect(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
        dragging ? 'border-hmi-accent bg-hmi-accent/5' : 'border-hmi-border hover:border-hmi-accent/50'
      }`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="text-5xl mb-4">📂</div>
      <div className="text-lg font-medium mb-2">DXF, DWG, PNG, PDF 파일을 드래그하거나</div>
      <label className="cursor-pointer inline-block mt-2 px-6 py-3 bg-hmi-accent text-white rounded-xl font-medium hover:bg-hmi-accent/80 transition-colors">
        파일 선택
        <input type="file" accept=".dxf,.dwg,.png,.pdf" className="hidden" onChange={handleChange} />
      </label>
      <div className="text-xs text-hmi-muted mt-3">DXF/DWG (vector) 우선, PNG/PDF는 벡터화 자동 진행</div>
    </div>
  )
}