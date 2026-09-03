"use client"

import { useEffect, useState, use, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { fetchCampaignById, updateCampaign, type Campaign, type CampaignFormData } from "@/app/campaigns/actions"
import ImageUpload from "@/app/components/image-upload"

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  
  const [formData, setFormData] = useState<CampaignFormData>({
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    venueDetails: "",
    registrationFee: 0,
    registrationDeadline: "",
    targetParticipants: undefined,
    bannerImageUrl: "",
    logoImageUrl: "",
    contactPhone: "",
    contactEmail: "",
    whatsappNumber: "",
    whatsappGroupLink: "",
    paymentAccountName: "",
    paymentAccountNumber: "",
    paymentBank: "",
    paymentInstructions: "",
    confirmationEmailText: "",
    approvalEmailText: "",
    reminderEmailText: "",
    emailNextSteps: "",
    emailFooterText: "",
    socialFacebook: "",
    socialTwitter: "",
    socialInstagram: "",
    socialYoutube: "",
  })

  useEffect(() => {
    loadCampaign()
  }, [resolvedParams.id])

  const loadCampaign = async () => {
    try {
      setIsLoading(true)
      const id = parseInt(resolvedParams.id)
      const data = await fetchCampaignById(id)
      
      if (!data) {
        setError("Campaign not found")
        return
      }

      setCampaign(data)
      setFormData({
        slug: data.slug || "",
        title: data.title || "",
        subtitle: data.subtitle || "",
        description: data.description || "",
        startDate: data.start_date ? data.start_date.split('T')[0] : "",
        endDate: data.end_date ? data.end_date.split('T')[0] : "",
        location: data.location || "",
        venueDetails: data.venue_details || "",
        registrationFee: Number(data.registration_fee) || 0,
        registrationDeadline: data.registration_deadline ? data.registration_deadline.split('T')[0] : "",
        targetParticipants: data.target_participants || undefined,
        bannerImageUrl: data.banner_image_url || "",
        logoImageUrl: data.logo_image_url || "",
        contactPhone: data.contact_phone || "",
        contactEmail: data.contact_email || "",
        whatsappNumber: data.whatsapp_number || "",
        whatsappGroupLink: data.whatsapp_group_link || "",
        paymentAccountName: data.payment_account_name || "",
        paymentAccountNumber: data.payment_account_number || "",
        paymentBank: data.payment_bank || "",
        paymentInstructions: data.payment_instructions || "",
        confirmationEmailText: data.confirmation_email_text || "",
        approvalEmailText: data.approval_email_text || "",
        reminderEmailText: data.reminder_email_text || "",
        emailNextSteps: data.email_next_steps || "",
        emailFooterText: data.email_footer_text || "",
        socialFacebook: data.social_facebook || "",
        socialTwitter: data.social_twitter || "",
        socialInstagram: data.social_instagram || "",
        socialYoutube: data.social_youtube || "",
      })
    } catch (err) {
      setError("Failed to load campaign")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!campaign) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateCampaign(campaign.id, formData)
      
      if (result.success) {
        router.push(`/admin/campaigns/${campaign.id}`)
      } else {
        setError(result.message || "Failed to update campaign")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">https://</span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    disabled
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                  />
                  <span className="text-gray-500 text-sm">.cmdanigeria.org</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Slug cannot be changed. Live at: https://{formData.slug}.cmdanigeria.org</p>
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="venueDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Details
                </label>
                <input
                  type="text"
                  id="venueDetails"
                  name="venueDetails"
                  value={formData.venueDetails}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Fee (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="registrationFee"
                  name="registrationFee"
                  value={formData.registrationFee}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="targetParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Participants
                </label>
                <input
                  type="number"
                  id="targetParticipants"
                  name="targetParticipants"
                  value={formData.targetParticipants || ""}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="paymentAccountName" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  id="paymentAccountName"
                  name="paymentAccountName"
                  value={formData.paymentAccountName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="paymentAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  id="paymentAccountNumber"
                  name="paymentAccountNumber"
                  value={formData.paymentAccountNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="paymentBank" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="paymentBank"
                  name="paymentBank"
                  value={formData.paymentBank}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="paymentInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Instructions
                </label>
                <textarea
                  id="paymentInstructions"
                  name="paymentInstructions"
                  value={formData.paymentInstructions}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Receipt Number
                </label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="whatsappGroupLink" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Group Link
                </label>
                <input
                  type="url"
                  id="whatsappGroupLink"
                  name="whatsappGroupLink"
                  value={formData.whatsappGroupLink}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="confirmationEmailText" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmation Email Message
                </label>
                <textarea
                  id="confirmationEmailText"
                  name="confirmationEmailText"
                  value={formData.confirmationEmailText}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="approvalEmailText" className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Email Message
                </label>
                <textarea
                  id="approvalEmailText"
                  name="approvalEmailText"
                  value={formData.approvalEmailText}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="reminderEmailText" className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Email Message
                </label>
                <textarea
                  id="reminderEmailText"
                  name="reminderEmailText"
                  value={formData.reminderEmailText}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="emailNextSteps" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmation Email Next Steps
                </label>
                <textarea
                  id="emailNextSteps"
                  name="emailNextSteps"
                  value={formData.emailNextSteps}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="emailFooterText" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Footer Note
                </label>
                <textarea
                  id="emailFooterText"
                  name="emailFooterText"
                  value={formData.emailFooterText}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
            
            <div className="grid gap-6">
              <ImageUpload
                campaignId={campaign.id.toString()}
                imageType="logo"
                currentImage={formData.logoImageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, logoImageUrl: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, logoImageUrl: "" }))}
              />

              <ImageUpload
                campaignId={campaign.id.toString()}
                imageType="banner"
                currentImage={formData.bannerImageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, bannerImageUrl: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, bannerImageUrl: "" }))}
              />

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Or enter image URLs manually:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="logoImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Logo Image URL
                    </label>
                    <input
                      type="url"
                      id="logoImageUrl"
                      name="logoImageUrl"
                      value={formData.logoImageUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="bannerImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      id="bannerImageUrl"
                      name="bannerImageUrl"
                      value={formData.bannerImageUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="socialFacebook" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  id="socialFacebook"
                  name="socialFacebook"
                  value={formData.socialFacebook}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="socialTwitter" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter/X URL
                </label>
                <input
                  type="url"
                  id="socialTwitter"
                  name="socialTwitter"
                  value={formData.socialTwitter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="socialInstagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="socialInstagram"
                  name="socialInstagram"
                  value={formData.socialInstagram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="socialYoutube" className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  id="socialYoutube"
                  name="socialYoutube"
                  value={formData.socialYoutube}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/admin/campaigns/${campaign.id}`}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
