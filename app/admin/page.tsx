"use client"

import { useEffect, useState } from "react"
import { Download, Check, Eye, Lock, Unlock, Search, Users, Calendar, TrendingUp } from "lucide-react"
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
      const data = await fetchCampaigns(true)
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
      toast({
        title: newStatus ? "Registration Opened" : "Registration Closed",
        description: newStatus ? "Registration is now open" : "Registration is now closed",
      })
    } catch (error) {
      console.error("Error toggling registration:", error)
      toast({ title: "Error", description: "Failed to toggle registration status", variant: "destructive" })
    } finally {
      setIsTogglingRegistration(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approveRegistration(id)
      const registration = registrations.find(r => r.id === id)
      
      if (registration) {
        let campaignData
        if (registration.campaign_id) {
          const campaign = campaigns.find(c => c.id === registration.campaign_id)
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

        const emailResult = await sendApprovalEmail(
          registration.email,
          registration.first_name,
          registration.id.toString(),
          campaignData
        )

        toast({
          title: "Registration Approved",
          description: emailResult.success 
            ? `Approval email sent to ${registration.email}`
            : "Approved but email failed to send",
          variant: emailResult.success ? "default" : "destructive",
        })
      }
      
      await loadRegistrations()
    } catch (error) {
      console.error("Error approving registration:", error)
      toast({ title: "Error", description: "Failed to approve registration", variant: "destructive" })
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

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage)

  const approvedCount = registrations.filter(r => r.status === "approved").length
  const pendingCount = registrations.filter(r => r.status === "pending").length
  const rejectedCount = registrations.filter(r => r.status === "rejected").length

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

    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n")
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of all registrations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleRegistration}
            disabled={isTogglingRegistration}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              registrationOpen 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
            } disabled:opacity-50`}
          >
            {registrationOpen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {registrationOpen ? 'Close Registration' : 'Open Registration'}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{registrations.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{campaigns.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <select
            value={selectedCampaignId}
            onChange={(e) => { setSelectedCampaignId(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id.toString()}>
                {campaign.title}
              </option>
            ))}
          </select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
          </div>
        ) : paginatedRegistrations.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{reg.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">
                      {reg.first_name} {reg.middle_name ? `${reg.middle_name} ` : ''}{reg.last_name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{reg.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{reg.phone}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {reg.campaign_title || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        reg.status === "approved" 
                          ? "bg-green-50 text-green-700" 
                          : reg.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApprove(reg.id)}
                          disabled={reg.status === "approved"}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/full-details?view=${reg.id}`}
                          className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredRegistrations.length}
        />
      </div>
    </div>
  )
}
