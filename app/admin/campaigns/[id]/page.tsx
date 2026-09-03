"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Edit, Globe, Lock, Calendar, MapPin, Phone, Mail,
  ExternalLink, Users, CheckCircle, Clock, DollarSign
} from "lucide-react"
import { 
  fetchCampaignById, 
  getCampaignStats, 
  publishCampaign,
  toggleCampaignRegistration,
  closeCampaign
} from "@/app/campaigns/actions"
import type { Campaign } from "@/app/campaigns/actions"

type CampaignStats = {
  total: number
  approved: number
  pending: number
  rejected: number
  paid: number
  unpaid: number
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCampaign()
  }, [resolvedParams.id])

  const loadCampaign = async () => {
    try {
      setIsLoading(true)
      const id = parseInt(resolvedParams.id)
      const [campaignData, statsData] = await Promise.all([
        fetchCampaignById(id),
        getCampaignStats(id)
      ])
      setCampaign(campaignData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading campaign:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!campaign) return
    if (!confirm("Are you sure you want to publish this campaign?")) return
    try {
      await publishCampaign(campaign.id)
      await loadCampaign()
    } catch (error) {
      console.error("Error publishing campaign:", error)
      alert("Failed to publish campaign")
    }
  }

  const handleToggleRegistration = async () => {
    if (!campaign) return
    try {
      await toggleCampaignRegistration(campaign.id, !campaign.is_registration_open)
      await loadCampaign()
    } catch (error) {
      console.error("Error toggling registration:", error)
      alert("Failed to toggle registration")
    }
  }

  const handleClose = async () => {
    if (!campaign) return
    if (!confirm("Are you sure you want to close this campaign?")) return
    try {
      await closeCampaign(campaign.id)
      await loadCampaign()
    } catch (error) {
      console.error("Error closing campaign:", error)
      alert("Failed to close campaign")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Campaign Not Found</h1>
          <Link href="/admin/campaigns" className="text-purple-600 hover:text-purple-700">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      draft: { bg: "bg-gray-100", text: "text-gray-800" },
      published: { bg: "bg-green-100", text: "text-green-800" },
      closed: { bg: "bg-red-100", text: "text-red-800" },
      archived: { bg: "bg-purple-100", text: "text-purple-800" },
    }
    return badges[status] || badges.draft
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/campaigns"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Campaigns
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-sm font-medium ${getStatusBadge(campaign.status).bg} ${getStatusBadge(campaign.status).text}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  {campaign.status === 'published' && (
                    <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                      campaign.is_registration_open 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {campaign.is_registration_open ? "Registration Open" : "Registration Closed"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === 'published' && (
                <a
                  href={`https://${campaign.slug}.cmdanigeria.org`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live
                </a>
              )}
              <Link
                href={`/admin/campaigns/${campaign.id}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Paid</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.paid}</div>
                </div>
              </div>
            )}

            {/* Campaign Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Slug / URL</span>
                  <div className="font-medium">
                    <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{campaign.slug}</code>
                    <span className="text-gray-500">.cmdanigeria.org</span>
                  </div>
                </div>

                {campaign.subtitle && (
                  <div>
                    <span className="text-sm text-gray-500">Subtitle</span>
                    <div className="font-medium">{campaign.subtitle}</div>
                  </div>
                )}

                {campaign.description && (
                  <div>
                    <span className="text-sm text-gray-500">Description</span>
                    <div className="text-gray-700">{campaign.description}</div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Event Dates</span>
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Location</span>
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {campaign.location}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Registration Fee</span>
                    <div className="font-medium text-lg">₦{Number(campaign.registration_fee).toLocaleString()}</div>
                  </div>

                  {campaign.registration_deadline && (
                    <div>
                      <span className="text-sm text-gray-500">Registration Deadline</span>
                      <div className="font-medium">{new Date(campaign.registration_deadline).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Payment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Payment</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Contact Info</h3>
                  <div className="space-y-2 text-sm">
                    {campaign.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {campaign.contact_phone}
                      </div>
                    )}
                    {campaign.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {campaign.contact_email}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Payment Info</h3>
                  <div className="space-y-1 text-sm">
                    {campaign.payment_account_name && (
                      <div><span className="text-gray-500">Account:</span> {campaign.payment_account_name}</div>
                    )}
                    {campaign.payment_account_number && (
                      <div><span className="text-gray-500">Number:</span> {campaign.payment_account_number}</div>
                    )}
                    {campaign.payment_bank && (
                      <div><span className="text-gray-500">Bank:</span> {campaign.payment_bank}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href={`/admin/campaigns/${campaign.id}/registrations`}
                  className="flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Registrations
                </Link>

                {campaign.status === 'draft' && (
                  <button
                    onClick={handlePublish}
                    className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Publish Campaign
                  </button>
                )}

                {campaign.status === 'published' && (
                  <>
                    <button
                      onClick={handleToggleRegistration}
                      className={`flex items-center justify-center w-full px-4 py-2 rounded-lg ${
                        campaign.is_registration_open
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {campaign.is_registration_open ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Close Registration
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          Open Registration
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleClose}
                      className="flex items-center justify-center w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      End Campaign
                    </button>
                  </>
                )}

                <Link
                  href={`/admin/campaigns/${campaign.id}/edit`}
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </Link>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Info</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Created</span>
                  <div>{new Date(campaign.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated</span>
                  <div>{new Date(campaign.updated_at).toLocaleString()}</div>
                </div>
                {campaign.published_at && (
                  <div>
                    <span className="text-gray-500">Published</span>
                    <div>{new Date(campaign.published_at).toLocaleString()}</div>
                  </div>
                )}
                {campaign.target_participants && (
                  <div>
                    <span className="text-gray-500">Target Participants</span>
                    <div>{campaign.target_participants}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
