"use client"

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 font-medium">Processing your registration...</p>
      </div>
    </div>
  )
}
