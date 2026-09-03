"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Code, Mail, Save } from "lucide-react"
import {
  fetchCampaignEmailTemplates,
  fetchCampaigns,
  saveCampaignEmailTemplate,
  type Campaign,
  type CampaignEmailTemplate,
  type EmailTemplateType,
} from "@/app/campaigns/actions"
import { toast } from "@/components/ui/use-toast"

const emailTypes: Array<{ label: string; value: EmailTemplateType }> = [
  { label: "Confirmation", value: "confirmation" },
  { label: "Approval", value: "approval" },
  { label: "Reminder", value: "reminder" },
]

const placeholders = [
  "{{firstName}}",
  "{{registrationId}}",
  "{{fullName}}",
  "{{email}}",
  "{{registrationDate}}",
  "{{campaignTitle}}",
  "{{campaignDates}}",
  "{{campaignVenue}}",
  "{{registrationFee}}",
  "{{accountName}}",
  "{{accountNumber}}",
  "{{bankName}}",
  "{{contactPhone}}",
  "{{contactEmail}}",
  "{{whatsappNumber}}",
  "{{whatsappGroupLink}}",
  "{{paymentInstructions}}",
  "{{paymentDeadline}}",
  "{{logoUrl}}",
  "{{currentYear}}",
]

const emptyTemplate: CampaignEmailTemplate = {
  email_type: "confirmation",
  name: "",
  subject_template: "",
  html_template: "",
  text_template: "",
}

export default function EmailSettingsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<CampaignEmailTemplate[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState("")
  const [selectedType, setSelectedType] = useState<EmailTemplateType>("confirmation")
  const [formData, setFormData] = useState<CampaignEmailTemplate>(emptyTemplate)
  const [isLoading, setIsLoading] = useState(true)
  const [isTemplateLoading, setIsTemplateLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id.toString() === selectedCampaignId),
    [campaigns, selectedCampaignId]
  )

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await fetchCampaigns(true)
        setCampaigns(data)
        if (data.length > 0) {
          setSelectedCampaignId(data[0].id.toString())
          await loadTemplates(data[0].id, selectedType)
        }
      } catch (error) {
        console.error("Error loading campaigns:", error)
        toast({
          title: "Error",
          description: "Failed to load campaigns",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  async function loadTemplates(campaignId: number, activeType: EmailTemplateType) {
    try {
      setIsTemplateLoading(true)
      const data = await fetchCampaignEmailTemplates(campaignId)
      setTemplates(data)
      setFormData(data.find((template) => template.email_type === activeType) || emptyTemplate)
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      })
    } finally {
      setIsTemplateLoading(false)
    }
  }

  const handleCampaignChange = async (campaignId: string) => {
    setSelectedCampaignId(campaignId)
    const campaign = campaigns.find((item) => item.id.toString() === campaignId)
    if (campaign) {
      await loadTemplates(campaign.id, selectedType)
    }
  }

  const handleTypeChange = (emailType: EmailTemplateType) => {
    setSelectedType(emailType)
    setFormData(templates.find((template) => template.email_type === emailType) || {
      ...emptyTemplate,
      email_type: emailType,
      name: `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} Email`,
    })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCampaign) return

    setIsSaving(true)

    try {
      const templateToSave = {
        ...formData,
        email_type: selectedType,
        name: formData.name || `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Email`,
      }
      const result = await saveCampaignEmailTemplate(selectedCampaign.id, templateToSave)

      if (result.success) {
        await loadTemplates(selectedCampaign.id, selectedType)
        toast({
          title: "Template Saved",
          description: `Saved ${selectedType} template for ${selectedCampaign.title}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save email template",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">Edit the full database templates used to send campaign emails</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="grid gap-4 border-b p-6 md:grid-cols-2">
            <div>
              <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign
              </label>
              <select
                id="campaign"
                value={selectedCampaignId}
                onChange={(event) => handleCampaignChange(event.target.value)}
                disabled={isLoading || campaigns.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {campaigns.length === 0 ? (
                  <option value="">No campaigns found</option>
                ) : (
                  campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id.toString()}>
                      {campaign.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="emailType" className="block text-sm font-medium text-gray-700 mb-2">
                Email Type
              </label>
              <select
                id="emailType"
                value={selectedType}
                onChange={(event) => handleTypeChange(event.target.value as EmailTemplateType)}
                disabled={isTemplateLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {emailTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-950">
              {formData.is_campaign_override
                ? "This campaign already has its own saved template. The text below is what will be used for this campaign."
                : "This is the seeded default template from the database. Saving will create a campaign-specific copy you can customize."}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Default Confirmation Email"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="subject_template" className="block text-sm font-medium text-gray-700 mb-1">
                Subject Template
              </label>
              <input
                id="subject_template"
                name="subject_template"
                value={formData.subject_template}
                onChange={handleChange}
                placeholder="Registration Confirmation - {{campaignTitle}}"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="html_template" className="block text-sm font-medium text-gray-700 mb-1">
                HTML Template
              </label>
              <textarea
                id="html_template"
                name="html_template"
                value={formData.html_template}
                onChange={handleChange}
                rows={22}
                placeholder="<div>Dear {{firstName}}, ...</div>"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-xs leading-5"
                required
              />
            </div>

            <div>
              <label htmlFor="text_template" className="block text-sm font-medium text-gray-700 mb-1">
                Plain Text Template
              </label>
              <textarea
                id="text_template"
                name="text_template"
                value={formData.text_template || ""}
                onChange={handleChange}
                rows={9}
                placeholder="Dear {{firstName}}, ..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-xs leading-5"
              />
            </div>
          </div>

          <div className="flex justify-end border-t p-6">
            <button
              type="submit"
              disabled={!selectedCampaign || isSaving || isTemplateLoading}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-5 w-5 text-purple-700" />
              <h2 className="font-semibold text-gray-900">Placeholders</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Use these inside subject, HTML, or plain text. They are replaced when the email is sent.
            </p>
            <div className="grid gap-2">
              {placeholders.map((placeholder) => (
                <code key={placeholder} className="rounded border bg-gray-50 px-2 py-1 text-xs text-gray-800">
                  {placeholder}
                </code>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="font-semibold text-gray-900 mb-2">How It Works</h2>
            <p className="text-sm text-gray-600">
              The app first looks for a template saved for this campaign and email type. If none exists, it uses the seeded default template in the database. The old in-code React template is only a final fallback.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
