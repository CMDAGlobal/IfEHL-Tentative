"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Plus, Eye, Edit, Trash2, Globe, Lock, 
  Calendar, MapPin, Users, CheckCircle, Clock, Archive,
  ExternalLink, Search
} from "lucide-react"
import { 
  fetchCampaigns, 
  publishCampaign, 
  closeCampaign, 
  archiveCampaign, 
  deleteCampaign,
  toggleCampaignRegistration,
  getCampaignStats
} from "@/app/campaigns/actions"
import type { Campaign } from "@/app/campaigns/actions"
import PaginationControls from "@/app/components/pagination-controls"

type CampaignWithStats = Campaign & {
  stats?: {
    total: number
    approved: number
    pending: number
    paid: number
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)

  useEffect(() => {
    loadCampaigns()
  }, [showArchived])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const data = await fetchCampaigns(showArchived)
      
      // Load stats for each campaign
      const campaignsWithStats = await Promise.all(
        data.map(async (campaign: Campaign) => {
          try {
            const stats = await getCampaignStats(campaign.id)
            return { ...campaign, stats }
          } catch {
            return campaign
          }
        })
      )
      
      setCampaigns(campaignsWithStats)
    } catch (error) {
      console.error("Error loading campaigns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async (id: number) => {
    if (!confirm("Are you sure you want to publish this campaign? It will become visible to the public.")) return
    try {
      await publishCampaign(id)
      await loadCampaigns()
    } catch (error) {
      console.error("Error publishing campaign:", error)
      alert("Failed to publish campaign")
    }
  }

  const handleToggleRegistration = async (id: number, currentStatus: boolean) => {
    try {
      await toggleCampaignRegistration(id, !currentStatus)
      await loadCampaigns()
    } catch (error) {
      console.error("Error toggling registration:", error)
      alert("Failed to toggle registration")
    }
  }

  const handleClose = async (id: number) => {
    if (!confirm("Are you sure you want to close this campaign? Registration will be disabled.")) return
    try {
      await closeCampaign(id)
      await loadCampaigns()
    } catch (error) {
      console.error("Error closing campaign:", error)
      alert("Failed to close campaign")
    }
  }

  const handleArchive = async (id: number) => {
    if (!confirm("Are you sure you want to archive this campaign? It will be hidden from the list.")) return
    try {
      await archiveCampaign(id)
      await loadCampaigns()
    } catch (error) {
      console.error("Error archiving campaign:", error)
      alert("Failed to archive campaign")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this draft campaign? This cannot be undone.")) return
    try {
      const result = await deleteCampaign(id)
      if (!result.success) {
        alert(result.message)
        return
      }
      await loadCampaigns()
    } catch (error) {
      console.error("Error deleting campaign:", error)
      alert("Failed to delete campaign")
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string, isRegistrationOpen: boolean) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      published: { bg: "bg-green-100", text: "text-green-800", label: "Published" },
      closed: { bg: "bg-red-100", text: "text-red-800", label: "Closed" },
      archived: { bg: "bg-purple-100", text: "text-purple-800", label: "Archived" },
    }
    const badge = badges[status] || badges.draft
    
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-sm font-medium ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
        {status === 'published' && (
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isRegistrationOpen 
              ? "bg-blue-100 text-blue-800" 
              : "bg-orange-100 text-orange-800"
          }`}>
            {isRegistrationOpen ? "Reg. Open" : "Reg. Closed"}
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
        <p className="text-gray-600 mt-1">Create and manage registration campaigns</p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => {
                setShowArchived(e.target.checked)
                setCurrentPage(1)
              }}
              className="rounded"
            />
            Show Archived
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <Link
          href="/admin/campaigns/create"
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns by title, slug, or location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery || statusFilter !== "all" ? "No campaigns found" : "No Campaigns Yet"}
          </h2>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first campaign to get started"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Link
              href="/admin/campaigns/create"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Campaign
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {paginatedCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{campaign.title}</h2>
                        {getStatusBadge(campaign.status, campaign.is_registration_open)}
                      </div>
                      
                      <p className="text-gray-500 text-sm mb-4">
                        Slug: <code className="bg-gray-100 px-2 py-0.5 rounded">{campaign.slug}</code>
                        {campaign.status === 'published' && (
                          <a 
                            href={`https://ifehl.cmdanigeria.org/campaigns/${campaign.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-purple-600 hover:text-purple-800 inline-flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Live
                          </a>
                        )}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {campaign.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">₦</span>
                          {Number(campaign.registration_fee).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    {campaign.stats && (
                      <div className="flex gap-4 text-center">
                        <div className="bg-purple-50 rounded-lg px-4 py-2">
                          <div className="text-2xl font-bold text-purple-700">{campaign.stats.total}</div>
                          <div className="text-xs text-purple-600">Total</div>
                        </div>
                        <div className="bg-green-50 rounded-lg px-4 py-2">
                          <div className="text-2xl font-bold text-green-700">{campaign.stats.approved}</div>
                          <div className="text-xs text-green-600">Approved</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg px-4 py-2">
                          <div className="text-2xl font-bold text-yellow-700">{campaign.stats.pending}</div>
                          <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg px-4 py-2">
                          <div className="text-2xl font-bold text-blue-700">{campaign.stats.paid}</div>
                          <div className="text-xs text-blue-600">Paid</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                    <Link
                      href={`/admin/campaigns/${campaign.id}`}
                      className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    
                    <Link
                      href={`/admin/campaigns/${campaign.id}/edit`}
                      className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    
                    <Link
                      href={`/admin/campaigns/${campaign.id}/registrations`}
                      className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Registrations
                    </Link>
                    
                    {campaign.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handlePublish(campaign.id)}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-auto"
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Publish
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </>
                    )}
                    
                    {campaign.status === 'published' && (
                      <>
                        <button
                          onClick={() => handleToggleRegistration(campaign.id, campaign.is_registration_open)}
                          className={`flex items-center px-3 py-2 rounded ml-auto ${
                            campaign.is_registration_open
                              ? "bg-orange-600 text-white hover:bg-orange-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {campaign.is_registration_open ? (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Close Registration
                            </>
                          ) : (
                            <>
                              <Globe className="h-4 w-4 mr-1" />
                              Open Registration
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleClose(campaign.id)}
                          className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          End Campaign
                        </button>
                      </>
                    )}
                    
                    {campaign.status === 'closed' && (
                      <button
                        onClick={() => handleArchive(campaign.id)}
                        className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 ml-auto"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCampaigns.length}
            />
          </div>
        </>
      )}
    </>
  )
}
