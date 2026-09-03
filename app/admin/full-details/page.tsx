"use client"

import { useEffect, useState } from "react"
import { Eye, Mail, CheckCircle, Search } from "lucide-react"
import Link from "next/link"
import { 
  fetchAllRegistrationsWithDetails
} from "../../actions"
import { fetchCampaigns } from "@/app/campaigns/actions"
import { sendApprovalEmail, sendReminderEmail } from "@/app/email-service"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExportButton from "@/app/components/export-button"
import PaginationControls from "@/app/components/pagination-controls"
import { toast } from "@/components/ui/use-toast"

type Registration = {
  id: number
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone: string
  alt_phone?: string
  gender: string
  dob: string
  marital_status?: string
  city?: string
  address?: string
  institute?: string
  professional_status?: string
  workplace?: string
  attended?: boolean
  expectations?: string
  hear_about?: string
  status: "pending" | "approved" | "rejected"
  payment_status: "paid" | "unpaid"
  payment_reference?: string
  payment_date?: string
  created_at: string
  campaign_id?: number
  campaign_title?: string
  campaign_slug?: string
  // Add email tracking info
  approvalEmailSent?: boolean
  reminderEmailSent?: boolean
}

export default function FullDetailsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadRegistrations()
    loadCampaigns()
  }, [])

  const loadRegistrations = async () => {
    try {
      setIsLoading(true)
      // Fetch all registrations with full details and email tracking in a single optimized query
      const detailedRegistrations = await fetchAllRegistrationsWithDetails()
      
      // Map the database field names to match the component's expected format
      const mappedRegistrations = detailedRegistrations.map((reg: any) => ({
        ...reg,
        approvalEmailSent: reg.approval_email_sent,
        reminderEmailSent: reg.reminder_email_sent
      })) as Registration[]
      
      setRegistrations(mappedRegistrations)
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

  const filteredRegistrations = () => {
    let filtered = registrations

    // Apply tab filter
    if (selectedTab === "approved") filtered = filtered.filter(r => r.status === "approved")
    if (selectedTab === "pending") filtered = filtered.filter(r => r.status === "pending")
    if (selectedTab === "paid") filtered = filtered.filter(r => r.payment_status === "paid")
    if (selectedTab === "unpaid") filtered = filtered.filter(r => r.payment_status === "unpaid")

    // Apply campaign filter
    if (selectedCampaignId !== "all") {
      filtered = filtered.filter(r => r.campaign_id?.toString() === selectedCampaignId)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(reg =>
        reg.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.phone.includes(searchQuery)
      )
    }

    return filtered
  }

  // Pagination
  const totalItems = filteredRegistrations().length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRegistrations = filteredRegistrations().slice(startIndex, startIndex + itemsPerPage)

  const handleSendApprovalEmail = async (registration: Registration) => {
    try {
      // Fetch campaign details if campaign_id exists
      let campaignData
      if (registration.campaign_id) {
        const campaign = campaigns.find(c => c.id === registration.campaign_id)
        console.log('Full campaign object:', campaign)
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
          console.log('Mapped campaignData for approval email:', campaignData)
        }
      }

      const result = await sendApprovalEmail(
        registration.email,
        registration.first_name,
        registration.id.toString(),
        campaignData
      )
      
      if (result.success) {
        // Update local state to reflect that email was sent
        setRegistrations(prevRegistrations => 
          prevRegistrations.map(reg => 
            reg.id === registration.id 
              ? { ...reg, approvalEmailSent: true } 
              : reg
          )
        )
        
        toast({
          title: "Email Sent",
          description: `Approval email sent to ${registration.email}`,
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send approval email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending approval email:", error)
      toast({
        title: "Error",
        description: "Failed to send approval email",
        variant: "destructive",
      })
    }
  }

  const handleSendReminderEmail = async (registration: Registration) => {
    try {
      // Fetch campaign details if campaign_id exists
      let campaignData
      if (registration.campaign_id) {
        const campaign = campaigns.find(c => c.id === registration.campaign_id)
        console.log('Full campaign object:', campaign)
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
            reminder_email_text: campaign.reminder_email_text,
            email_footer_text: campaign.email_footer_text,
            logo_image_url: campaign.logo_image_url,
            banner_image_url: campaign.banner_image_url,
          }
          console.log('Mapped campaignData for reminder email:', campaignData)
        }
      }

      const result = await sendReminderEmail(
        registration.email,
        registration.first_name,
        registration.id.toString(),
        campaignData
      )
      
      if (result.success) {
        // Update local state to reflect that email was sent
        setRegistrations(prevRegistrations => 
          prevRegistrations.map(reg => 
            reg.id === registration.id 
              ? { ...reg, reminderEmailSent: true } 
              : reg
          )
        )
        
        toast({
          title: "Email Sent",
          description: `Reminder email sent to ${registration.email}`,
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send reminder email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending reminder email:", error)
      toast({
        title: "Error",
        description: "Failed to send reminder email",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detailed Registrations</h1>
        <p className="text-gray-600 mt-1">View all registration details with email tracking</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Campaign Selector */}
        <div className="p-6 border-b bg-gray-50">
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

        {/* Tabs for filtering */}
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <Tabs defaultValue="all" onValueChange={(value) => {
              setSelectedTab(value)
              setCurrentPage(1)
            }}>
              <TabsList className="grid grid-cols-5 w-full max-w-xl">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              </TabsList>
            </Tabs>
            <ExportButton 
              data={filteredRegistrations()} 
              filename="ifehl-detailed-registrations" 
              className="bg-green-600 text-white hover:bg-green-700"
            />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b bg-gray-50">
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

        {/* Data display */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-4 text-gray-600">Loading detailed registration data...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No registration data found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">ID</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Campaign</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Full Name</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Alt Phone</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Gender</th>
                    <th className="text-left p-4 font-semibold text-gray-700">DOB</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Marital Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">City</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Address</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Institute</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Professional Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Workplace</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Attended Before</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Expectations</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Heard About</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Payment Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Registration Date</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRegistrations.map((reg) => (
                          <tr key={reg.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{reg.id}</td>
                            <td className="p-3">
                              <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                {reg.campaign_title || 'No Campaign'}
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {reg.first_name} 
                              {reg.middle_name ? ` ${reg.middle_name} ` : ' '}
                              {reg.last_name}
                            </td>
                            <td className="p-3">{reg.email}</td>
                            <td className="p-3">{reg.phone}</td>
                            <td className="p-3">{reg.alt_phone || "-"}</td>
                            <td className="p-3">{reg.gender}</td>
                            <td className="p-3">{new Date(reg.dob).toLocaleDateString()}</td>
                            <td className="p-3">{reg.marital_status || "-"}</td>
                            <td className="p-3">{reg.city || "-"}</td>
                            <td className="p-3 whitespace-normal max-w-xs">
                              <div className="max-h-20 overflow-y-auto">{reg.address || "-"}</div>
                            </td>
                            <td className="p-3">{reg.institute || "-"}</td>
                            <td className="p-3">{reg.professional_status || "-"}</td>
                            <td className="p-3">{reg.workplace || "-"}</td>
                            <td className="p-3">{reg.attended ? "Yes" : "No"}</td>
                            <td className="p-3 whitespace-normal max-w-xs">
                              <div className="max-h-20 overflow-y-auto">{reg.expectations || "-"}</div>
                            </td>
                            <td className="p-3">{reg.hear_about || "-"}</td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                reg.status === "approved" 
                                  ? "bg-green-100 text-green-800" 
                                  : reg.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                reg.payment_status === "paid" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {reg.payment_status.charAt(0).toUpperCase() + reg.payment_status.slice(1)}
                              </span>
                            </td>
                            <td className="p-3">{new Date(reg.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                              <Link 
                                href={`/admin?view=${reg.id}`}
                                className="p-1 text-blue-600 hover:text-blue-800 inline-flex items-center"
                                title="View Details"
                              >
                                <Eye className="h-5 w-5 mr-1" />
                                Details
                              </Link>
                            </td>
                            <td className="p-3">                              <div className="flex items-center space-x-2">
                                <Button
                                  variant={
                                    (reg.status === "approved" && reg.approvalEmailSent) ||
                                    (reg.status !== "approved" && reg.reminderEmailSent)
                                      ? "outline"
                                      : "ghost"
                                  }
                                  size="sm"
                                  className={`${
                                    reg.status === "approved" 
                                      ? (reg.approvalEmailSent 
                                          ? "text-green-600 border-green-600" 
                                          : "text-green-600 hover:text-green-700")
                                      : (reg.reminderEmailSent 
                                          ? "text-yellow-600 border-yellow-600" 
                                          : "text-yellow-600 hover:text-yellow-700")
                                  }`}
                                  onClick={() => 
                                    reg.status === "approved" 
                                      ? handleSendApprovalEmail(reg)
                                      : handleSendReminderEmail(reg)
                                  }
                                >
                                  {(reg.status === "approved" && reg.approvalEmailSent) || 
                                   (reg.status !== "approved" && reg.reminderEmailSent) 
                                    ? <CheckCircle className="h-4 w-4 mr-1" /> 
                                    : <Mail className="h-4 w-4 mr-1" />
                                  }
                                  {reg.status === "approved" 
                                    ? (reg.approvalEmailSent ? "Approval Sent" : "Send Approval")
                                    : (reg.reminderEmailSent ? "Reminder Sent" : "Send Reminder")
                                  }
                                </Button>
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
        {!isLoading && totalItems > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        )}
      </div>
    </>
  )
}
