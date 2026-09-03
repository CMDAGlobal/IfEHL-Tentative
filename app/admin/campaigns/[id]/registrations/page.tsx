"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Check, Eye, Mail, Search } from "lucide-react"
import { 
  fetchCampaignById, 
  fetchCampaignRegistrations, 
  getCampaignStats,
  approveCampaignRegistration,
  updateCampaignPaymentStatus
} from "@/app/campaigns/actions"
import type { Campaign, CampaignRegistration } from "@/app/campaigns/actions"

type CampaignStats = {
  total: number
  approved: number
  pending: number
  rejected: number
  paid: number
  unpaid: number
}

export default function CampaignRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [registrations, setRegistrations] = useState<CampaignRegistration[]>([])
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [selectedRegistration, setSelectedRegistration] = useState<CampaignRegistration | null>(null)

  useEffect(() => {
    loadData()
  }, [resolvedParams.id])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const id = parseInt(resolvedParams.id)
      const [campaignData, registrationsData, statsData] = await Promise.all([
        fetchCampaignById(id),
        fetchCampaignRegistrations(id),
        getCampaignStats(id)
      ])
      setCampaign(campaignData)
      setRegistrations(registrationsData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveCampaignRegistration(id)
      await loadData()
    } catch (error) {
      console.error("Error approving registration:", error)
      alert("Failed to approve registration")
    }
  }

  const handlePaymentUpdate = async (id: number, status: string) => {
    try {
      await updateCampaignPaymentStatus(id, status)
      await loadData()
    } catch (error) {
      console.error("Error updating payment:", error)
      alert("Failed to update payment status")
    }
  }

  const filteredRegistrations = registrations.filter(reg => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      reg.first_name.toLowerCase().includes(searchLower) ||
      reg.last_name.toLowerCase().includes(searchLower) ||
      reg.email.toLowerCase().includes(searchLower) ||
      reg.phone.includes(searchQuery)
    
    // Status filter
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    
    // Payment filter
    const matchesPayment = paymentFilter === "all" || reg.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const exportToCSV = () => {
    if (!campaign) return
    
    const headers = ["ID", "Name", "Email", "Phone", "Status", "Payment", "Registration Date"]
    const csvData = filteredRegistrations.map(reg => [
      reg.id,
      `${reg.first_name}${reg.middle_name ? ` ${reg.middle_name}` : ''} ${reg.last_name}`,
      reg.email,
      reg.phone,
      reg.status,
      reg.payment_status,
      new Date(reg.created_at).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${campaign.slug}-registrations-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/admin/campaigns/${campaign.id}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Campaign
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
                <p className="text-gray-500 text-sm">{campaign.title}</p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-700">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-700">{stats.paid}</div>
              <div className="text-sm text-gray-500">Paid</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-700">{stats.unpaid}</div>
              <div className="text-sm text-gray-500">Unpaid</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">ID</th>
                  <th className="text-left p-4 font-medium text-gray-700">Name</th>
                  <th className="text-left p-4 font-medium text-gray-700">Email</th>
                  <th className="text-left p-4 font-medium text-gray-700">Phone</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Payment</th>
                  <th className="text-left p-4 font-medium text-gray-700">Date</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{reg.id}</td>
                      <td className="p-4">
                        {reg.first_name} {reg.middle_name ? `${reg.middle_name} ` : ''}{reg.last_name}
                      </td>
                      <td className="p-4">{reg.email}</td>
                      <td className="p-4">{reg.phone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          reg.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : reg.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={reg.payment_status}
                          onChange={(e) => handlePaymentUpdate(reg.id, e.target.value)}
                          className={`px-2 py-1 rounded text-sm font-medium border-0 cursor-pointer ${
                            reg.payment_status === 'paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {reg.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(reg.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedRegistration(reg)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredRegistrations.length} of {registrations.length} registrations
        </div>
      </main>

      {/* Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Registration Details</h2>
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm text-gray-500">Full Name</span>
                  <div className="font-medium">
                    {selectedRegistration.first_name} {selectedRegistration.middle_name} {selectedRegistration.last_name}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <div className="font-medium">{selectedRegistration.email}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone</span>
                  <div className="font-medium">{selectedRegistration.phone}</div>
                </div>
                {selectedRegistration.alt_phone && (
                  <div>
                    <span className="text-sm text-gray-500">Alt Phone</span>
                    <div className="font-medium">{selectedRegistration.alt_phone}</div>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Gender</span>
                  <div className="font-medium capitalize">{selectedRegistration.gender}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Date of Birth</span>
                  <div className="font-medium">{new Date(selectedRegistration.dob).toLocaleDateString()}</div>
                </div>
                {selectedRegistration.marital_status && (
                  <div>
                    <span className="text-sm text-gray-500">Marital Status</span>
                    <div className="font-medium capitalize">{selectedRegistration.marital_status}</div>
                  </div>
                )}
                {selectedRegistration.city && (
                  <div>
                    <span className="text-sm text-gray-500">City</span>
                    <div className="font-medium">{selectedRegistration.city}</div>
                  </div>
                )}
                {selectedRegistration.address && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">Address</span>
                    <div className="font-medium">{selectedRegistration.address}</div>
                  </div>
                )}
                {selectedRegistration.institute && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">Institution</span>
                    <div className="font-medium">{selectedRegistration.institute}</div>
                  </div>
                )}
                {selectedRegistration.professional_status && (
                  <div>
                    <span className="text-sm text-gray-500">Professional Status</span>
                    <div className="font-medium">{selectedRegistration.professional_status}</div>
                  </div>
                )}
                {selectedRegistration.workplace && (
                  <div>
                    <span className="text-sm text-gray-500">Workplace</span>
                    <div className="font-medium">{selectedRegistration.workplace}</div>
                  </div>
                )}
                {selectedRegistration.expectations && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">Expectations</span>
                    <div className="font-medium">{selectedRegistration.expectations}</div>
                  </div>
                )}
                {selectedRegistration.hear_about && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">How they heard about us</span>
                    <div className="font-medium">{selectedRegistration.hear_about}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                {selectedRegistration.status !== 'approved' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedRegistration.id)
                      setSelectedRegistration(null)
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                )}
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
