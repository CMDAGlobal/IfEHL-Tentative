'use server';

import { Resend } from 'resend';
import { createElement } from 'react';
import { neon } from '@neondatabase/serverless';
import { ApprovalEmail } from './emails/approval-email';
import { ReminderEmail } from './emails/reminder-email';
import { ConfirmationEmail } from './emails/confirmation-email';
import { trackEmailSent } from './actions';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailType = 'confirmation' | 'approval' | 'reminder'

const IFEHL_FULL_NAME = 'Institute for Excellence in Healthcare and Leadership'
const EMAIL_TEAM_NAME = 'IFEHL Team'

type CampaignEmailData = {
  id?: number
  title?: string
  start_date?: string
  end_date?: string
  location?: string
  registration_fee?: number
  payment_account_name?: string
  payment_account_number?: string
  payment_bank?: string
  contact_email?: string
  contact_phone?: string
  whatsapp_number?: string
  whatsapp_group_link?: string
  payment_instructions?: string
  confirmation_email_text?: string
  approval_email_text?: string
  reminder_email_text?: string
  email_next_steps?: string
  email_footer_text?: string
  registration_deadline?: string
  logo_image_url?: string
  banner_image_url?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatCampaignDates(campaignData?: CampaignEmailData) {
  if (!campaignData?.start_date || !campaignData?.end_date) return ''

  try {
    const startDate = new Date(campaignData.start_date)
    const endDate = new Date(campaignData.end_date)
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      return `${startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`
    }
  } catch (dateError) {
    console.error('Error formatting campaign dates:', dateError)
  }

  return ''
}

function formatPaymentDeadline(campaignData?: CampaignEmailData) {
  if (!campaignData?.registration_deadline) return 'October 31st, 2026'

  try {
    const deadline = new Date(campaignData.registration_deadline)
    if (!isNaN(deadline.getTime())) {
      return deadline.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  } catch (dateError) {
    console.error('Error formatting payment deadline:', dateError)
  }

  return 'October 31st, 2026'
}

function formatCurrency(value?: number) {
  const numericValue = Number(value ?? 50000)
  return `₦${numericValue.toLocaleString()}`
}

function buildTemplateValues(args: {
  to: string
  firstName: string
  registrationId: string
  fullName?: string
  campaignData?: CampaignEmailData
}) {
  const { to, firstName, registrationId, fullName, campaignData } = args
  const campaignTitle = campaignData?.title || 'IFEHL 2026'
  const contactPhone = campaignData?.contact_phone || '08091533339'

  return {
    firstName,
    registrationId,
    fullName: fullName || firstName,
    email: to,
    registrationDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    campaignTitle,
    campaignDates: formatCampaignDates(campaignData) || '16-23rd November, 2026',
    campaignVenue: campaignData?.location || 'Wholeness House, Gwagalada, Abuja',
    registrationFee: formatCurrency(campaignData?.registration_fee),
    registrationFeeRaw: String(campaignData?.registration_fee ?? 50000),
    accountName: campaignData?.payment_account_name || IFEHL_FULL_NAME,
    accountNumber: campaignData?.payment_account_number || '1018339742',
    bankName: campaignData?.payment_bank || 'UBA',
    contactPhone,
    contactEmail: campaignData?.contact_email || 'ifehl@cmdanigeria.org',
    whatsappNumber: campaignData?.whatsapp_number || contactPhone,
    whatsappGroupLink: campaignData?.whatsapp_group_link || 'https://chat.whatsapp.com/DA2iIYHr332EMknkfoWyIr?mode=gi_t',
    paymentInstructions: campaignData?.payment_instructions || `Add ${campaignTitle} to your transfer narration when making payment`,
    paymentDeadline: formatPaymentDeadline(campaignData),
    logoUrl: campaignData?.logo_image_url || campaignData?.banner_image_url || 'https://ifehl.cmdanigeria.org/IfHEL.%20Logo.png',
    currentYear: String(new Date().getFullYear()),
  }
}

function renderTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    return escapeHtml(values[key] ?? '')
  })
}

function normalizeEmailBranding(value: string) {
  return value
    .replace(/CMDA Nigeria Team/g, EMAIL_TEAM_NAME)
    .replace(/IFEHL Team/g, EMAIL_TEAM_NAME)
    .replace(/Christian Medical and Dental Association of Nigeria/g, IFEHL_FULL_NAME)
    .replace(/Christian Medical & Dental Association of Nigeria/g, IFEHL_FULL_NAME)
}

async function renderDatabaseTemplate(
  emailType: EmailType,
  values: Record<string, string>,
  campaignId?: number
) {
  if (!process.env.DATABASE_URL) return null

  const sql = neon(process.env.DATABASE_URL)
  const result = await sql`
    SELECT subject_template, html_template, text_template
    FROM email_templates
    WHERE is_active = true
      AND email_type = ${emailType}
      AND (campaign_id = ${campaignId || null} OR campaign_id IS NULL)
    ORDER BY CASE WHEN campaign_id = ${campaignId || null} THEN 0 ELSE 1 END
    LIMIT 1
  `

  const template = result[0]
  if (!template) return null

  return {
    subject: normalizeEmailBranding(renderTemplate(template.subject_template, values)),
    html: normalizeEmailBranding(renderTemplate(template.html_template, values)),
    text: template.text_template ? normalizeEmailBranding(renderTemplate(template.text_template, values)) : undefined,
  }
}

export async function sendConfirmationEmail(
  to: string, 
  firstName: string, 
  registrationId: string, 
  fullName: string,
  campaignData?: {
    id?: number
  } & CampaignEmailData
) {
  try {
    console.log('sendConfirmationEmail - campaignData:', campaignData)

    const values = buildTemplateValues({ to, firstName, registrationId, fullName, campaignData })
    const dbTemplate = await renderDatabaseTemplate('confirmation', values, campaignData?.id)
      
    const data = await resend.emails.send({
      from: `IFEHL Registration <${process.env.RESEND_FROM_EMAIL}>`,
      to: [to],
      subject: dbTemplate?.subject || `Registration Confirmation - ${values.campaignTitle}`,
      ...(dbTemplate ? {
        html: dbTemplate.html,
        text: dbTemplate.text,
      } : {
        react: createElement(ConfirmationEmail, {
        firstName,
        registrationId,
        fullName,
        email: to,
        campaignTitle: campaignData?.title || 'IFEHL 2026',
        campaignDates: values.campaignDates,
        campaignVenue: campaignData?.location,
        registrationFee: campaignData?.registration_fee,
        accountName: campaignData?.payment_account_name,
        accountNumber: campaignData?.payment_account_number,
        bankName: campaignData?.payment_bank,
        contactPhone: campaignData?.contact_phone,
        contactEmail: campaignData?.contact_email,
        whatsappNumber: campaignData?.whatsapp_number,
        whatsappGroupLink: campaignData?.whatsapp_group_link,
        paymentInstructions: campaignData?.payment_instructions,
        customMessage: campaignData?.confirmation_email_text,
        nextStepsText: campaignData?.email_next_steps,
        footerText: campaignData?.email_footer_text,
        logoUrl: campaignData?.logo_image_url || campaignData?.banner_image_url,
        }),
      }),
    });

    // Track that the email was sent (skip for test IDs)
    const numericId = parseInt(registrationId);
    if (!isNaN(numericId)) {
      await trackEmailSent(numericId, 'confirmation' as any);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendApprovalEmail(
  to: string, 
  firstName: string, 
  registrationId: string,
  campaignData?: {
    id?: number
  } & CampaignEmailData
) {
  try {
    console.log('sendApprovalEmail - campaignData:', campaignData)

    const values = buildTemplateValues({ to, firstName, registrationId, campaignData })
    const paymentDeadline = values.paymentDeadline
    const dbTemplate = await renderDatabaseTemplate('approval', values, campaignData?.id)

    const data = await resend.emails.send({
      from: `IFEHL Registration <${process.env.RESEND_FROM_EMAIL}>`,
      to: [to],
      subject: dbTemplate?.subject || `Registration Approved - ${values.campaignTitle}`,
      ...(dbTemplate ? {
        html: dbTemplate.html,
        text: dbTemplate.text,
      } : {
        react: createElement(ApprovalEmail, {
        firstName,
        registrationId,
        campaignTitle: campaignData?.title,
        campaignDates: values.campaignDates,
        campaignVenue: campaignData?.location,
        registrationFee: campaignData?.registration_fee,
        accountName: campaignData?.payment_account_name,
        accountNumber: campaignData?.payment_account_number,
        bankName: campaignData?.payment_bank,
        contactPhone: campaignData?.contact_phone,
        contactEmail: campaignData?.contact_email,
        whatsappNumber: campaignData?.whatsapp_number,
        whatsappGroupLink: campaignData?.whatsapp_group_link,
        paymentDeadline,
        paymentInstructions: campaignData?.payment_instructions,
        customMessage: campaignData?.approval_email_text,
        footerText: campaignData?.email_footer_text,
        logoUrl: campaignData?.logo_image_url || campaignData?.banner_image_url,
        }),
      }),
    });

    // Track that the email was sent (skip for test IDs)
    const numericId = parseInt(registrationId);
    if (!isNaN(numericId)) {
      await trackEmailSent(numericId, 'approval');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error };
  }
}

export async function sendReminderEmail(
  to: string, 
  firstName: string, 
  registrationId: string,
  campaignData?: {
    id?: number
  } & CampaignEmailData
) {
  try {
    console.log('sendReminderEmail - campaignData:', campaignData)

    const values = buildTemplateValues({ to, firstName, registrationId, campaignData })
    const dbTemplate = await renderDatabaseTemplate('reminder', values, campaignData?.id)

    const data = await resend.emails.send({
      from: `IFEHL Registration <${process.env.RESEND_FROM_EMAIL}>`,
      to: [to],
      subject: dbTemplate?.subject || `Payment Reminder - ${values.campaignTitle}`,
      ...(dbTemplate ? {
        html: dbTemplate.html,
        text: dbTemplate.text,
      } : {
        react: createElement(ReminderEmail, {
        firstName,
        registrationId,
        campaignTitle: campaignData?.title,
        campaignDates: values.campaignDates,
        campaignVenue: campaignData?.location,
        registrationFee: campaignData?.registration_fee,
        accountName: campaignData?.payment_account_name,
        accountNumber: campaignData?.payment_account_number,
        bankName: campaignData?.payment_bank,
        contactPhone: campaignData?.contact_phone,
        contactEmail: campaignData?.contact_email,
        whatsappNumber: campaignData?.whatsapp_number,
        whatsappGroupLink: campaignData?.whatsapp_group_link,
        paymentInstructions: campaignData?.payment_instructions,
        customMessage: campaignData?.reminder_email_text,
        footerText: campaignData?.email_footer_text,
        logoUrl: campaignData?.logo_image_url || campaignData?.banner_image_url,
        }),
      }),
    });

    // Track that the email was sent (skip for test IDs)
    const numericId = parseInt(registrationId);
    if (!isNaN(numericId)) {
      await trackEmailSent(numericId, 'reminder');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, error };
  }
}
