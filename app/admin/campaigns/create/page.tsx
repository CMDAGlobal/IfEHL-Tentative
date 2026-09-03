"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { createCampaign, type CampaignFormData } from "@/app/campaigns/actions"
import ImageUpload from "@/app/components/image-upload"

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Temporary ID for image uploads before campaign is created
  const [tempId] = useState(() => `temp-${Date.now()}`)
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value
    }))
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Submitting campaign data:', formData)
      const result = await createCampaign(formData)
      console.log('Campaign creation result:', result)
      
      if (result.success) {
        alert('Campaign created successfully!')
        router.push(`/admin/campaigns/${result.campaignId}`)
      } else {
        setError(result.message || "Failed to create campaign")
        alert('Error: ' + (result.message || "Failed to create campaign"))
      }
    } catch (err: any) {
      console.error('Campaign creation error:', err)
      setError("An unexpected error occurred: " + err.message)
      alert("An unexpected error occurred: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
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
                  onBlur={generateSlug}
                  placeholder="e.g., IFEHL 2026 (01)"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">https://</span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="ifehl-2026-01"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <span className="text-gray-500 text-sm">.cmdanigeria.org</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Main site: ifehl.cmdanigeria.org | Campaign: [slug].cmdanigeria.org</p>
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
                  placeholder="e.g., Institute for Excellence in Healthcare and Leadership"
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
                  placeholder="Describe the campaign..."
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
                  placeholder="e.g., Wholeness House, Gwagalada, Abuja"
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
                  placeholder="Additional venue information"
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
                  placeholder="Leave empty for unlimited"
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
                  placeholder="e.g., 08091533339"
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
                  placeholder="e.g., info@cmdanigeria.org"
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
                  placeholder="e.g., Christian Medical and Dental Association"
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
                  placeholder="e.g., 1018339742"
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
                  placeholder="e.g., UBA"
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
                  placeholder="e.g., Add campaign name to narration when making transfer"
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
                  placeholder="e.g., 08091533339"
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
                  placeholder="https://chat.whatsapp.com/..."
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
                  placeholder="Opening message for registration confirmation emails"
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
                  placeholder="Opening message for approval emails"
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
                  placeholder="Opening message for reminder emails"
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
                  placeholder="Custom next steps shown after payment details"
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
                  placeholder="Optional signoff note for campaign emails"
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
                campaignId={tempId}
                imageType="logo"
                currentImage={formData.logoImageUrl}
                onUpload={(url) => setFormData(prev => ({ ...prev, logoImageUrl: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, logoImageUrl: "" }))}
              />

              <ImageUpload
                campaignId={tempId}
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
                      placeholder="https://..."
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
                      placeholder="https://..."
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
                  placeholder="https://facebook.com/..."
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
                  placeholder="https://twitter.com/..."
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
                  placeholder="https://instagram.com/..."
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
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/campaigns"
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
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
