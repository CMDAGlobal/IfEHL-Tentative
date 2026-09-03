"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  campaignId: string
  imageType: "banner" | "logo" | "gallery"
  currentImage?: string
  onUpload: (url: string) => void
  onRemove?: () => void
  className?: string
}

export default function ImageUpload({
  campaignId,
  imageType,
  currentImage,
  onUpload,
  onRemove,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.")
      return
    }

    setError(null)
    setIsUploading(true)

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("campaignId", campaignId)
      formData.append("imageType", imageType)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      onUpload(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreview(currentImage || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!preview) return

    try {
      // If it's a blob URL, delete from Vercel Blob
      if (preview.includes("blob.vercel-storage.com")) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: preview }),
        })
      }

      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onRemove?.()
    } catch (err) {
      console.error("Error removing image:", err)
    }
  }

  const getPlaceholderSize = () => {
    switch (imageType) {
      case "banner":
        return "aspect-[4/5] max-h-64"
      case "logo":
        return "aspect-square max-h-32"
      default:
        return "aspect-video max-h-40"
    }
  }

  const getLabel = () => {
    switch (imageType) {
      case "banner":
        return "Banner Image (Recommended: 1080x1350px)"
      case "logo":
        return "Logo (Recommended: 200x200px)"
      default:
        return "Image"
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {getLabel()}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg overflow-hidden ${
          preview ? "border-gray-300" : "border-gray-400"
        } ${getPlaceholderSize()}`}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt={`${imageType} preview`}
              className="w-full h-full object-cover"
            />
            {!isUploading && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  title="Change image"
                >
                  <Upload className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  title="Remove image"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-full flex flex-col items-center justify-center p-6 hover:bg-gray-50 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Click to upload {imageType}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, GIF, or WebP (max 5MB)
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
