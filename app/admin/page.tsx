"use client"

import { useEffect, useState } from "react"
import { Download, Check, Eye, Lock, Unlock, Search, Filter } from "lucide-react"
import Link from "next/link"
import { fetchRegistrations, approveRegistration, isRegistrationOpen, toggleRegistrationStatus } from "../actions"
import { fetchCampaigns } from "../campaigns/actions"
import { sendApprovalEmail } from "../email-service"
import PaginationControls from "../components/pagination-controls"
import { toast } from "@/components/ui/use-toast"

type Registration = {
  id: number
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  campaign_id?: number
  campaign_title?: string
}

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all")
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [isTogglingRegistration, setIsTogglingRegistration] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadRegistrations()
    loadCampaigns()
    checkRegistrationStatus()
  }, [])

  const loadRegistrations = async () => {
    try {
      const data = await fetchRegistrations()
      setRegistrations(data)
    } catch (error) {
      console.error("Error loading registrations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCampaigns = async () => {
    try {
      const data = await fetchCampaigns(true) // Include archived
      setCampaigns(data)
    } catch (error) {
      console.error("Error loading campaigns:", error)
    }
  }

  const checkRegistrationStatus = async () => {
    try {
      const status = await isRegistrationOpen()
      setRegistrationOpen(status.isOpen)
    } catch (error) {
      console.error("Error checking registration status:", error)
    }
  }

  const handleToggleRegistration = async () => {
    try {
      setIsTogglingRegistration(true)
      const newStatus = !registrationOpen
      await toggleRegistrationStatus(newStatus)
      setRegistrationOpen(newStatus)
      alert(newStatus ? "Registration is now OPEN" : "Registration is now CLOSED")
    } catch (error) {
      console.error("Error toggling registration:", error)
      alert("Failed to toggle registration status")
    } finally {
      setIsTogglingRegistration(false)
    }
  }
  const handleApprove = async (id: number) => {
    try {
      console.log('Starting approval for ID:', id)
      await approveRegistration(id)
      console.log('Registration approved in database')
      
      // Find the registration and send approval email
      const registration = registrations.find(r => r.id === id)
      console.log('Found registration:', registration)
      
      if (registration) {
        // Fetch campaign details for the email
        let campaignData
        if (registration.campaign_id) {
          const campaign = campaigns.find(c => c.id === registration.campaign_id)
          console.log('Found campaign:', campaign)
          if (campaign) {
            campaignData = {
              id: campaign.id,
              title: campaign.title,
              start_date: campaign.start_date,
              end_date: campaign.end_date,
              location: campaign.location,
              registration_fee: campaign.registration_fee,
              payment_account_name: campaign.payment_account_name,
              payment_account_number: campaign.payment_account_number,
              payment_bank: campaign.payment_bank,
              contact_phone: campaign.contact_phone,
              contact_email: campaign.contact_email,
              whatsapp_number: campaign.whatsapp_number,
              whatsapp_group_link: campaign.whatsapp_group_link,
              payment_instructions: campaign.payment_instructions,
              approval_email_text: campaign.approval_email_text,
              email_footer_text: campaign.email_footer_text,
              registration_deadline: campaign.registration_deadline,
              logo_image_url: campaign.logo_image_url,
              banner_image_url: campaign.banner_image_url,
            }
          }
        }

        console.log('Sending approval email to:', registration.email)
        console.log('Campaign data:', campaignData)
        
        // Send approval email
        const emailResult = await sendApprovalEmail(
          registration.email,
          registration.first_name,
          registration.id.toString(),
          campaignData
        )

        console.log('Email result:', emailResult)

        if (emailResult.success) {
          toast({
            title: "Registration Approved",
            description: `Approval email sent to ${registration.email}`,
            variant: "default",
          })
        } else {
          console.error('Email send failed:', emailResult.error)
          toast({
            title: "Registration Approved",
            description: "Registration approved but email failed to send",
            variant: "destructive",
          })
        }
      }
      
      await loadRegistrations() // Refresh the list
    } catch (error) {
      console.error("Error approving registration:", error)
      toast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive",
      })
    }
  }

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery)
    
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    const matchesCampaign = selectedCampaignId === "all" || reg.campaign_id?.toString() === selectedCampaignId

    return matchesSearch && matchesStatus && matchesCampaign
  })

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage)

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Status", "Registration Date"]
    const csvData = filteredRegistrations.map(reg => [
      reg.id,
      `${reg.first_name}${reg.middle_name ? ` ${reg.middle_name}` : ''} ${reg.last_name}`,
      reg.email,
      reg.phone,
      reg.status,
      new Date(reg.created_at).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `registrations-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Registration Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage and track all registrations</p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Registration Status Banner */}
        <div className={`p-4 rounded-lg text-center font-semibold shadow-sm ${
          registrationOpen 
            ? 'bg-green-100 text-green-800 border-2 border-green-300' 
            : 'bg-red-100 text-red-800 border-2 border-red-300'
        }`}>
          {registrationOpen ? (
            <span className="flex items-center justify-center">
              <Unlock className="h-5 w-5 mr-2" />
              Registration is currently OPEN
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Lock className="h-5 w-5 mr-2" />
              Registration is currently CLOSED - Target number met
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleToggleRegistration}
            disabled={isTogglingRegistration}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              registrationOpen 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {registrationOpen ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Close Registration
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Open Registration
              </>
            )}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-purple-900 font-semibold text-sm">Total Registrations</h3>
              <p className="text-4xl font-bold text-purple-700 mt-2">{registrations.length}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-green-900 font-semibold text-sm">Approved</h3>
              <p className="text-4xl font-bold text-green-700 mt-2">
                {registrations.filter(r => r.status === "approved").length}
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-yellow-900 font-semibold text-sm">Pending</h3>
              <p className="text-4xl font-bold text-yellow-700 mt-2">
                {registrations.filter(r => r.status === "pending").length}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col gap-4">
              {/* Campaign Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Campaign
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-medium"
                >
                  <option value="all">All Campaigns ({registrations.length})</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id.toString()}>
                      {campaign.title} ({registrations.filter(r => r.campaign_id === campaign.id).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : paginatedRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No registrations found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Full Name</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Campaign</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Registration Date</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRegistrations.map((reg) => (
                      <tr key={reg.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{reg.id}</td>
                        <td className="p-4">
                          {reg.first_name} 
                          {reg.middle_name ? ` ${reg.middle_name} ` : ' '}
                          {reg.last_name}
                        </td>
                        <td className="p-4 text-gray-600">{reg.email}</td>
                        <td className="p-4 text-gray-600">{reg.phone}</td>
                        <td className="p-4">
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {reg.campaign_title || 'No Campaign'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            reg.status === "approved" 
                              ? "bg-green-100 text-green-800" 
                              : reg.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(reg.id)}
                              disabled={reg.status === "approved"}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Approve"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <Link
                              href={`/admin/full-details?view=${reg.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRegistrations.length}
          />
        </div>
      </div>
    </>
  )
}
