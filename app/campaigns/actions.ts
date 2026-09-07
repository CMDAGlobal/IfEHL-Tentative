"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

// Types
export type Campaign = {
  id: number
  slug: string
  title: string
  subtitle?: string
  description?: string
  start_date: string
  end_date: string
  location: string
  venue_details?: string
  registration_fee: number
  registration_deadline?: string
  status: 'draft' | 'published' | 'closed' | 'archived'
  is_registration_open: boolean
  target_participants?: number
  banner_image_url?: string
  logo_image_url?: string
  contact_phone?: string
  contact_email?: string
  whatsapp_number?: string
  whatsapp_group_link?: string
  payment_account_name?: string
  payment_account_number?: string
  payment_bank?: string
  payment_instructions?: string
  confirmation_email_text?: string
  approval_email_text?: string
  reminder_email_text?: string
  email_next_steps?: string
  email_footer_text?: string
  social_facebook?: string
  social_twitter?: string
  social_instagram?: string
  social_youtube?: string
  created_at: string
  updated_at: string
  published_at?: string
}

export type CampaignFormData = {
  slug: string
  title: string
  subtitle?: string
  description?: string
  startDate: string
  endDate: string
  location: string
  venueDetails?: string
  registrationFee: number
  registrationDeadline?: string
  targetParticipants?: number
  bannerImageUrl?: string
  logoImageUrl?: string
  contactPhone?: string
  contactEmail?: string
  whatsappNumber?: string
  whatsappGroupLink?: string
  paymentAccountName?: string
  paymentAccountNumber?: string
  paymentBank?: string
  paymentInstructions?: string
  confirmationEmailText?: string
  approvalEmailText?: string
  reminderEmailText?: string
  emailNextSteps?: string
  emailFooterText?: string
  socialFacebook?: string
  socialTwitter?: string
  socialInstagram?: string
  socialYoutube?: string
}

export type CampaignEmailSettingsData = {
  whatsappNumber?: string
  whatsappGroupLink?: string
  confirmationEmailText?: string
  approvalEmailText?: string
  reminderEmailText?: string
  emailNextSteps?: string
  emailFooterText?: string
}

export type EmailTemplateType = 'confirmation' | 'approval' | 'reminder'

export type CampaignEmailTemplate = {
  id?: number
  campaign_id?: number | null
  email_type: EmailTemplateType
  name: string
  subject_template: string
  html_template: string
  text_template?: string
  is_campaign_override?: boolean
  updated_at?: string
}

export type CampaignRegistration = {
  id: number
  campaign_id: number
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
  status: 'pending' | 'approved' | 'rejected'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_reference?: string
  payment_date?: string
  created_at: string
}

export type RegistrationFormData = {
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  altPhone?: string
  gender: string
  dob: string
  maritalStatus?: string
  city?: string
  address?: string
  institute?: string
  professionalStatus?: string
  workplace?: string
  attended?: string
  expectations?: string
  hearAbout?: string
}

const requiredRegistrationFields: Array<keyof RegistrationFormData> = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "altPhone",
  "gender",
  "dob",
  "maritalStatus",
  "city",
  "address",
  "institute",
  "professionalStatus",
  "workplace",
  "attended",
  "expectations",
  "hearAbout",
]

// ============ CAMPAIGN CRUD ============

// Fetch all campaigns
export async function fetchCampaigns(includeArchived = false) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    let result
    if (includeArchived) {
      result = await sql`
        SELECT * FROM campaigns 
        ORDER BY created_at DESC
      `
    } else {
      result = await sql`
        SELECT * FROM campaigns 
        WHERE status != 'archived'
        ORDER BY created_at DESC
      `
    }
    
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    throw new Error("Failed to fetch campaigns")
  }
}

// Fetch published campaigns for public landing page
export async function fetchPublishedCampaigns() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT * FROM campaigns 
      WHERE status = 'published'
      ORDER BY start_date ASC
    `
    
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching published campaigns:", error)
    throw new Error("Failed to fetch published campaigns")
  }
}

// Fetch single campaign by slug
export async function fetchCampaignBySlug(slug: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT * FROM campaigns 
      WHERE slug = ${slug}
      LIMIT 1
    `
    
    if (result.length === 0) {
      return null
    }
    
    return JSON.parse(JSON.stringify(result[0]))
  } catch (error) {
    console.error("Error fetching campaign:", error)
    throw new Error("Failed to fetch campaign")
  }
}

// Fetch single campaign by ID
export async function fetchCampaignById(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT * FROM campaigns 
      WHERE id = ${id}
      LIMIT 1
    `
    
    if (result.length === 0) {
      return null
    }
    
    return JSON.parse(JSON.stringify(result[0]))
  } catch (error) {
    console.error("Error fetching campaign:", error)
    throw new Error("Failed to fetch campaign")
  }
}

// Create a new campaign
export async function createCampaign(data: CampaignFormData) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      INSERT INTO campaigns (
        slug, title, subtitle, description, 
        start_date, end_date, location, venue_details,
        registration_fee, registration_deadline, target_participants,
        banner_image_url, logo_image_url,
        contact_phone, contact_email, whatsapp_number, whatsapp_group_link,
        payment_account_name, payment_account_number, payment_bank, payment_instructions,
        confirmation_email_text, approval_email_text, reminder_email_text,
        email_next_steps, email_footer_text,
        social_facebook, social_twitter, social_instagram, social_youtube,
        status, is_registration_open
      ) VALUES (
        ${data.slug.toLowerCase().replace(/\s+/g, '-')},
        ${data.title},
        ${data.subtitle || null},
        ${data.description || null},
        ${data.startDate},
        ${data.endDate},
        ${data.location},
        ${data.venueDetails || null},
        ${data.registrationFee},
        ${data.registrationDeadline || null},
        ${data.targetParticipants || null},
        ${data.bannerImageUrl || null},
        ${data.logoImageUrl || null},
        ${data.contactPhone || null},
        ${data.contactEmail || null},
        ${data.whatsappNumber || null},
        ${data.whatsappGroupLink || null},
        ${data.paymentAccountName || null},
        ${data.paymentAccountNumber || null},
        ${data.paymentBank || null},
        ${data.paymentInstructions || null},
        ${data.confirmationEmailText || null},
        ${data.approvalEmailText || null},
        ${data.reminderEmailText || null},
        ${data.emailNextSteps || null},
        ${data.emailFooterText || null},
        ${data.socialFacebook || null},
        ${data.socialTwitter || null},
        ${data.socialInstagram || null},
        ${data.socialYoutube || null},
        'draft',
        false
      ) RETURNING id
    `
    
    revalidatePath('/admin/campaigns')
    
    return {
      success: true,
      campaignId: result[0].id,
      message: "Campaign created successfully"
    }
  } catch (error: any) {
    console.error("Error creating campaign:", error)
    
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      return {
        success: false,
        message: "A campaign with this slug already exists. Please use a different slug."
      }
    }
    
    return {
      success: false,
      message: "Failed to create campaign"
    }
  }
}

// Update a campaign
export async function updateCampaign(id: number, data: Partial<CampaignFormData>) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`
      UPDATE campaigns SET
        title = ${data.title || null},
        subtitle = ${data.subtitle || null},
        description = ${data.description || null},
        start_date = ${data.startDate || null},
        end_date = ${data.endDate || null},
        location = ${data.location || null},
        venue_details = ${data.venueDetails || null},
        registration_fee = ${data.registrationFee ?? null},
        registration_deadline = ${data.registrationDeadline || null},
        target_participants = ${data.targetParticipants || null},
        banner_image_url = ${data.bannerImageUrl || null},
        logo_image_url = ${data.logoImageUrl || null},
        contact_phone = ${data.contactPhone || null},
        contact_email = ${data.contactEmail || null},
        whatsapp_number = ${data.whatsappNumber || null},
        whatsapp_group_link = ${data.whatsappGroupLink || null},
        payment_account_name = ${data.paymentAccountName || null},
        payment_account_number = ${data.paymentAccountNumber || null},
        payment_bank = ${data.paymentBank || null},
        payment_instructions = ${data.paymentInstructions || null},
        confirmation_email_text = ${data.confirmationEmailText || null},
        approval_email_text = ${data.approvalEmailText || null},
        reminder_email_text = ${data.reminderEmailText || null},
        email_next_steps = ${data.emailNextSteps || null},
        email_footer_text = ${data.emailFooterText || null},
        social_facebook = ${data.socialFacebook || null},
        social_twitter = ${data.socialTwitter || null},
        social_instagram = ${data.socialInstagram || null},
        social_youtube = ${data.socialYoutube || null},
        updated_at = NOW()
      WHERE id = ${id}
    `
    
    revalidatePath('/admin/campaigns')
    revalidatePath(`/admin/campaigns/${id}`)
    
    return { success: true, message: "Campaign updated successfully" }
  } catch (error) {
    console.error("Error updating campaign:", error)
    return { success: false, message: "Failed to update campaign" }
  }
}

export async function updateCampaignEmailSettings(id: number, data: CampaignEmailSettingsData) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      UPDATE campaigns SET
        whatsapp_number = ${data.whatsappNumber || null},
        whatsapp_group_link = ${data.whatsappGroupLink || null},
        confirmation_email_text = ${data.confirmationEmailText || null},
        approval_email_text = ${data.approvalEmailText || null},
        reminder_email_text = ${data.reminderEmailText || null},
        email_next_steps = ${data.emailNextSteps || null},
        email_footer_text = ${data.emailFooterText || null},
        updated_at = NOW()
      WHERE id = ${id}
    `

    revalidatePath('/admin/email-settings')
    revalidatePath('/admin/campaigns')
    revalidatePath(`/admin/campaigns/${id}`)

    return { success: true, message: "Email settings updated successfully" }
  } catch (error) {
    console.error("Error updating campaign email settings:", error)
    return { success: false, message: "Failed to update email settings" }
  }
}

export async function fetchCampaignEmailTemplates(campaignId: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const result = await sql`
      SELECT
        COALESCE(campaign_template.id, global_template.id) as id,
        campaign_template.campaign_id,
        global_template.email_type,
        COALESCE(campaign_template.name, global_template.name) as name,
        COALESCE(campaign_template.subject_template, global_template.subject_template) as subject_template,
        COALESCE(campaign_template.html_template, global_template.html_template) as html_template,
        COALESCE(campaign_template.text_template, global_template.text_template) as text_template,
        CASE WHEN campaign_template.id IS NOT NULL THEN true ELSE false END as is_campaign_override,
        COALESCE(campaign_template.updated_at, global_template.updated_at) as updated_at
      FROM email_templates global_template
      LEFT JOIN email_templates campaign_template
        ON campaign_template.email_type = global_template.email_type
        AND campaign_template.campaign_id = ${campaignId}
      WHERE global_template.campaign_id IS NULL
        AND global_template.email_type IN ('confirmation', 'approval', 'reminder')
      ORDER BY
        CASE global_template.email_type
          WHEN 'confirmation' THEN 1
          WHEN 'approval' THEN 2
          WHEN 'reminder' THEN 3
          ELSE 4
        END
    `

    return JSON.parse(JSON.stringify(result)) as CampaignEmailTemplate[]
  } catch (error) {
    console.error("Error fetching email templates:", error)
    throw new Error("Failed to fetch email templates")
  }
}

export async function saveCampaignEmailTemplate(campaignId: number, template: CampaignEmailTemplate) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      INSERT INTO email_templates (
        campaign_id,
        email_type,
        name,
        subject_template,
        html_template,
        text_template,
        is_active
      ) VALUES (
        ${campaignId},
        ${template.email_type},
        ${template.name},
        ${template.subject_template},
        ${template.html_template},
        ${template.text_template || null},
        true
      )
      ON CONFLICT (campaign_id, email_type) DO UPDATE SET
        name = EXCLUDED.name,
        subject_template = EXCLUDED.subject_template,
        html_template = EXCLUDED.html_template,
        text_template = EXCLUDED.text_template,
        is_active = true,
        updated_at = NOW()
    `

    revalidatePath('/admin/email-settings')

    return { success: true, message: "Email template saved successfully" }
  } catch (error) {
    console.error("Error saving email template:", error)
    return { success: false, message: "Failed to save email template" }
  }
}

// Publish a campaign
export async function publishCampaign(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`
      UPDATE campaigns SET
        status = 'published',
        is_registration_open = true,
        published_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `
    
    revalidatePath('/admin/campaigns')
    
    return { success: true, message: "Campaign published successfully" }
  } catch (error) {
    console.error("Error publishing campaign:", error)
    return { success: false, message: "Failed to publish campaign" }
  }
}

// Toggle campaign registration
export async function toggleCampaignRegistration(id: number, isOpen: boolean) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`
      UPDATE campaigns SET
        is_registration_open = ${isOpen},
        updated_at = NOW()
      WHERE id = ${id}
    `
    
    revalidatePath('/admin/campaigns')
    
    return { success: true, message: isOpen ? "Registration opened" : "Registration closed" }
  } catch (error) {
    console.error("Error toggling registration:", error)
    return { success: false, message: "Failed to toggle registration" }
  }
}

// Close a campaign
export async function closeCampaign(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`
      UPDATE campaigns SET
        status = 'closed',
        is_registration_open = false,
        updated_at = NOW()
      WHERE id = ${id}
    `
    
    revalidatePath('/admin/campaigns')
    
    return { success: true, message: "Campaign closed" }
  } catch (error) {
    console.error("Error closing campaign:", error)
    return { success: false, message: "Failed to close campaign" }
  }
}

// Archive a campaign
export async function archiveCampaign(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`
      UPDATE campaigns SET
        status = 'archived',
        is_registration_open = false,
        updated_at = NOW()
      WHERE id = ${id}
    `
    
    revalidatePath('/admin/campaigns')
    
    return { success: true, message: "Campaign archived" }
  } catch (error) {
    console.error("Error archiving campaign:", error)
    return { success: false, message: "Failed to archive campaign" }
  }
}

// Delete a campaign (only drafts)
export async function deleteCampaign(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Only allow deleting drafts
    const campaign = await sql`SELECT status FROM campaigns WHERE id = ${id}`
    if (campaign[0]?.status !== 'draft') {
      return { success: false, message: "Only draft campaigns can be deleted" }
    }
    
    await sql`DELETE FROM campaigns WHERE id = ${id}`
    
    revalidatePath('/admin/campaigns')
    
    return { success: true, message: "Campaign deleted" }
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return { success: false, message: "Failed to delete campaign" }
  }
}

// ============ CAMPAIGN REGISTRATIONS ============

// Submit registration for a campaign
export async function submitCampaignRegistration(campaignId: number, formData: RegistrationFormData) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const missingField = requiredRegistrationFields.find((field) => !formData[field]?.trim())
    if (missingField) {
      return { success: false, message: "Please complete all required fields." }
    }
    
    // Check if campaign exists and is accepting registrations
    const campaign = await sql`
      SELECT 
        id, title, is_registration_open, status,
        start_date, end_date, location, registration_fee,
        payment_account_name, payment_account_number, payment_bank,
        contact_phone, contact_email, whatsapp_number, whatsapp_group_link,
        payment_instructions, confirmation_email_text, approval_email_text,
        reminder_email_text, email_next_steps, email_footer_text,
        logo_image_url, banner_image_url
      FROM campaigns 
      WHERE id = ${campaignId}
    `
    
    if (campaign.length === 0) {
      return { success: false, message: "Campaign not found" }
    }
    
    if (!campaign[0].is_registration_open || campaign[0].status !== 'published') {
      return { success: false, message: "Registration is currently closed for this campaign" }
    }
    
    const result = await sql`
      INSERT INTO campaign_registrations (
        campaign_id,
        first_name, middle_name, last_name,
        email, phone, alt_phone,
        gender, dob, marital_status,
        city, address, institute,
        professional_status, workplace, attended,
        expectations, hear_about
      ) VALUES (
        ${campaignId},
        ${formData.firstName},
        ${formData.middleName || null},
        ${formData.lastName},
        ${formData.email},
        ${formData.phone},
        ${formData.altPhone || null},
        ${formData.gender},
        ${formData.dob},
        ${formData.maritalStatus || null},
        ${formData.city || null},
        ${formData.address || null},
        ${formData.institute || null},
        ${formData.professionalStatus || null},
        ${formData.workplace || null},
        ${formData.attended === 'yes' ? true : formData.attended === 'no' ? false : null},
        ${formData.expectations || null},
        ${formData.hearAbout || null}
      ) RETURNING id
    `
    
    const registrationId = result[0]?.id
    
    // Send confirmation email (don't block on email failure)
    let emailStatus = 'not_sent'
    try {
      const { sendConfirmationEmail } = await import('../email-service')
      const fullName = `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim()
      const emailResult = await sendConfirmationEmail(
        formData.email,
        formData.firstName,
        registrationId.toString(),
        fullName,
        {
          id: campaign[0].id,
          title: campaign[0].title,
          start_date: campaign[0].start_date,
          end_date: campaign[0].end_date,
          location: campaign[0].location,
          registration_fee: campaign[0].registration_fee,
          payment_account_name: campaign[0].payment_account_name,
          payment_account_number: campaign[0].payment_account_number,
          payment_bank: campaign[0].payment_bank,
          contact_phone: campaign[0].contact_phone,
          contact_email: campaign[0].contact_email,
          whatsapp_number: campaign[0].whatsapp_number,
          whatsapp_group_link: campaign[0].whatsapp_group_link,
          payment_instructions: campaign[0].payment_instructions,
          confirmation_email_text: campaign[0].confirmation_email_text,
          approval_email_text: campaign[0].approval_email_text,
          reminder_email_text: campaign[0].reminder_email_text,
          email_next_steps: campaign[0].email_next_steps,
          email_footer_text: campaign[0].email_footer_text,
          logo_image_url: campaign[0].logo_image_url,
          banner_image_url: campaign[0].banner_image_url,
        }
      )
      emailStatus = emailResult.success ? 'sent' : 'failed'
      if (!emailResult.success) {
        console.error('Email send returned failure:', emailResult.error)
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
      emailStatus = 'error'
    }
    
    return {
      success: true,
      message: emailStatus === 'sent' 
        ? "Registration submitted successfully! A confirmation email has been sent."
        : "Registration submitted successfully! A confirmation email will be sent shortly.",
      registrationId,
      emailStatus
    }
  } catch (error: any) {
    console.error("Error submitting registration:", error)
    
    if (error.message?.includes('unique_email_per_campaign')) {
      return {
        success: false,
        message: "This email has already been registered for this campaign."
      }
    }
    
    return {
      success: false,
      message: "Failed to submit registration. Please try again."
    }
  }
}

// Fetch registrations for a campaign
export async function fetchCampaignRegistrations(campaignId: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT * FROM campaign_registrations 
      WHERE campaign_id = ${campaignId}
      ORDER BY created_at DESC
    `
    
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching registrations:", error)
    throw new Error("Failed to fetch registrations")
  }
}

// Get campaign stats
export async function getCampaignStats(campaignId: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid,
        COUNT(*) FILTER (WHERE payment_status = 'unpaid') as unpaid
      FROM campaign_registrations 
      WHERE campaign_id = ${campaignId}
    `
    
    return JSON.parse(JSON.stringify(stats[0]))
  } catch (error) {
    console.error("Error fetching campaign stats:", error)
    throw new Error("Failed to fetch campaign stats")
  }
}

// Approve a campaign registration
export async function approveCampaignRegistration(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`
      UPDATE campaign_registrations 
      SET status = 'approved'
      WHERE id = ${id}
    `
    
    revalidatePath('/admin/campaigns')
    
    return { success: true }
  } catch (error) {
    console.error("Error approving registration:", error)
    throw new Error("Failed to approve registration")
  }
}

// Update payment status for campaign registration
export async function updateCampaignPaymentStatus(id: number, status: string, reference?: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`
      UPDATE campaign_registrations SET
        payment_status = ${status},
        payment_reference = ${reference || null},
        payment_date = ${status === 'paid' ? new Date().toISOString() : null}
      WHERE id = ${id}
    `
    
    revalidatePath('/admin/campaigns')
    
    return { success: true }
  } catch (error) {
    console.error("Error updating payment status:", error)
    throw new Error("Failed to update payment status")
  }
}

// ============ CAMPAIGN IMAGES ============

// Add image to campaign
export async function addCampaignImage(campaignId: number, imageUrl: string, imageType: string = 'gallery', altText?: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Get max display order
    const maxOrder = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order 
      FROM campaign_images 
      WHERE campaign_id = ${campaignId}
    `
    
    const result = await sql`
      INSERT INTO campaign_images (campaign_id, image_url, image_type, alt_text, display_order)
      VALUES (${campaignId}, ${imageUrl}, ${imageType}, ${altText || null}, ${maxOrder[0].max_order + 1})
      RETURNING id
    `
    
    revalidatePath(`/admin/campaigns/${campaignId}`)
    
    return { success: true, imageId: result[0].id }
  } catch (error) {
    console.error("Error adding image:", error)
    return { success: false, message: "Failed to add image" }
  }
}

// Fetch campaign images
export async function fetchCampaignImages(campaignId: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT * FROM campaign_images 
      WHERE campaign_id = ${campaignId}
      ORDER BY display_order ASC
    `
    
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching images:", error)
    throw new Error("Failed to fetch images")
  }
}

// Delete campaign image
export async function deleteCampaignImage(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    await sql`DELETE FROM campaign_images WHERE id = ${id}`
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { success: false, message: "Failed to delete image" }
  }
}

// ============ HELPER FUNCTIONS ============

// Get published campaigns for public display
export async function getPublishedCampaigns() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      SELECT id, slug, title, subtitle, start_date, end_date, location, 
             registration_fee, banner_image_url, is_registration_open
      FROM campaigns 
      WHERE status = 'published'
      ORDER BY start_date ASC
    `
    
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching published campaigns:", error)
    throw new Error("Failed to fetch campaigns")
  }
}
