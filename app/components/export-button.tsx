"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type ExportButtonProps = {
  data: any[]
  filename?: string
  className?: string
}

export default function ExportButton({ data, filename = "export", className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    if (!data.length) return

    try {
      setIsExporting(true)
      
      // Extract headers from the first item
      const firstItem = data[0]
      const headers = Object.keys(firstItem)
      
      // Format data for CSV
      const csvData = data.map(item => 
        headers.map(header => {
          const value = item[header]
          // Handle various data types and format appropriately
          if (value === null || value === undefined) return ""
          if (value instanceof Date) return value.toISOString()
          if (typeof value === "boolean") return value ? "Yes" : "No"
          return String(value).replace(/"/g, '""') // Escape quotes in strings
        })
      )
      
      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n")
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      onClick={exportToCSV} 
      disabled={isExporting || !data.length}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  )
}
