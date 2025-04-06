import { useState, useRef } from 'react'
import './styles/fileUpload.sass'

export default function FileUpload({ onFileUpload }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      await uploadFile(file)
    }
  }

  const handleChange = async (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    if (file && file.type.startsWith('video/')) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('video', file)

    try {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.response)
          onFileUpload(file, response.data)
        }
      }

      xhr.open('POST', '/api/upload', true)
      xhr.send(formData)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div className="file-upload-container">
      <form 
        className={`upload-form ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="video/*"
          onChange={handleChange}
          className="input-file"
        />
        
        <div className="upload-content">
          <span className="icon">upload</span>
          <p>Drag and drop your video or click to browse</p>
          <button 
            className="upload-button"
            onClick={(e) => {
              e.preventDefault()
              inputRef.current.click()
            }}
          >
            Choose File
          </button>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
      </form>
    </div>
  )
}
