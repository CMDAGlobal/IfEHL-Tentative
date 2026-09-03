"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { headers } from "next/headers"
import { sendConfirmationEmail } from "./email-service"

// Type for form data
type FormData = {
  firstName: string
  middleName: string
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

// Function to submit registration to the database
export async function submitRegistration(formData: FormData) {
  try {
    // Initialize the Neon SQL client
    const sql = neon(process.env.DATABASE_URL!)    // Insert the registration data into the database
    const result = await sql`
      INSERT INTO registrations (
        first_name, 
        middle_name,
        last_name, 
        email, 
        phone, 
        alt_phone, 
        gender, 
        dob, 
        marital_status, 
        city, 
        address, 
        institute, 
        professional_status, 
        workplace, 
        attended, 
        expectations, 
        hear_about
      ) VALUES (
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
        ${formData.attended === "yes" ? true : formData.attended === "no" ? false : null},
        ${formData.expectations || null},
        ${formData.hearAbout || null}
      ) RETURNING id
    `

    // Get the registration ID from the result
    const registrationId = result[0]?.id

    if (registrationId) {
      // Send confirmation email
      const fullName = `${formData.firstName}${formData.middleName ? ` ${formData.middleName}` : ''} ${formData.lastName}`;
      try {
        await sendConfirmationEmail(
          formData.email,
          formData.firstName,
          registrationId.toString(),
          fullName
        );
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the registration if email fails
      }
    }

    const response = {
      success: true,
      message: "Registration submitted successfully! Please check your email for confirmation.",
      registrationId: Number(registrationId) || null,
    }
    return JSON.parse(JSON.stringify(response))
  } catch (error: any) {
    console.error("Error submitting registration:", error)

    // Check for duplicate email error
    const errorResponse = {
      success: false,
      message: error.message?.includes("unique_email_registration")
        ? "This email address has already been registered. Please use a different email."
        : "Failed to submit registration. Please try again.",
      registrationId: null,
    }
    return JSON.parse(JSON.stringify(errorResponse))
  }
}

// Function to fetch all registrations
export async function fetchRegistrations() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT 
        r.id, 
        r.first_name, 
        r.middle_name,
        r.last_name, 
        r.email, 
        r.phone, 
        r.status, 
        r.created_at,
        r.campaign_id,
        c.title as campaign_title
      FROM registrations r
      LEFT JOIN campaigns c ON r.campaign_id = c.id
      ORDER BY r.created_at DESC
    `
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching registrations:", error)
    throw new Error("Failed to fetch registrations")
  }
}

// Function to approve a registration
export async function approveRegistration(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`
      UPDATE registrations 
      SET status = 'approved'
      WHERE id = ${id}
    `
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Error approving registration:", error)
    throw new Error("Failed to approve registration")
  }
}

// Function to handle admin login
export async function login(email: string, password: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const bcrypt = require('bcryptjs')

    // Get user from database
    const user = await sql`
      SELECT * FROM admin_users 
      WHERE email = ${email}
      LIMIT 1
    `

    if (!user || user.length === 0) {
      return {
        success: false,
        message: "Invalid credentials"
      }
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user[0].password_hash)
    if (!validPassword) {
      return {
        success: false,
        message: "Invalid credentials"
      }
    }

    // Generate the token
    const token = generateToken(user[0].id)

    // Set the cookie
    const cookieStore = await cookies()
    await cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 1 week in seconds
    })

    return {
      success: true,
      message: "Logged in successfully"
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An error occurred during login"
    }
  }
}

// Function to fetch registration details
export async function fetchRegistrationDetails(id: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT * FROM registrations 
      WHERE id = ${id}
      LIMIT 1
    `
    return JSON.parse(JSON.stringify(result[0]))
  } catch (error) {
    console.error("Error fetching registration details:", error)
    throw new Error("Failed to fetch registration details")
  }
}

// Function to update payment status
export async function updatePaymentStatus(id: number, status: string, reference?: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`
      UPDATE registrations 
      SET 
        payment_status = ${status},
        payment_reference = ${reference || null},
        payment_date = ${status === 'paid' ? new Date() : null}
      WHERE id = ${id}
    `
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Error updating payment status:", error)
    throw new Error("Failed to update payment status")
  }
}

// Function to bulk approve registrations
export async function bulkApproveRegistrations(ids: number[]) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`
      UPDATE registrations 
      SET status = 'approved'
      WHERE id = ANY(${ids})
    `
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Error bulk approving registrations:", error)
    throw new Error("Failed to approve registrations")
  }
}

// Function to track sent emails
export async function trackEmailSent(registrationId: number, emailType: 'approval' | 'reminder' | 'confirmation') {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`
      INSERT INTO email_tracking (registration_id, email_type, sent_at)
      VALUES (${registrationId}, ${emailType}, NOW())
    `
    revalidatePath('/admin/full-details')
    return { success: true }
  } catch (error) {
    console.error("Error tracking email:", error)
    throw new Error("Failed to track email")
  }
}

// Function to check if an email has been sent to a registration
export async function checkEmailSent(registrationId: number, emailType: 'approval' | 'reminder' | 'confirmation') {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT * FROM email_tracking
      WHERE registration_id = ${registrationId}
      AND email_type = ${emailType}
      ORDER BY sent_at DESC
      LIMIT 1
    `
    return JSON.parse(JSON.stringify(result[0] || null))
  } catch (error) {
    console.error("Error checking email status:", error)
    throw new Error("Failed to check email status")
  }
}

// Function to get all sent emails for a registration
export async function getSentEmails(registrationId: number) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT * FROM email_tracking
      WHERE registration_id = ${registrationId}
      ORDER BY sent_at DESC
    `
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching sent emails:", error)
    throw new Error("Failed to fetch sent emails")
  }
}

// Optimized function to fetch all registrations with full details and email tracking
export async function fetchAllRegistrationsWithDetails() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Fetch all registrations with campaign info from campaign_registrations table
    const registrations = await sql`
      SELECT 
        r.*,
        c.title as campaign_title,
        c.slug as campaign_slug
      FROM campaign_registrations r
      LEFT JOIN campaigns c ON r.campaign_id = c.id
      ORDER BY r.created_at DESC
    `
    
    // Fetch all email tracking records
    const emailTracking = await sql`
      SELECT 
        registration_id,
        email_type,
        MAX(sent_at) as last_sent_at
      FROM email_tracking
      GROUP BY registration_id, email_type
    `
    
    // Create a map for quick lookup
    const emailMap = new Map()
    emailTracking.forEach((track: any) => {
      const key = `${track.registration_id}_${track.email_type}`
      emailMap.set(key, true)
    })
    
    // Combine the data
    const result = registrations.map((reg: any) => ({
      ...reg,
      approval_email_sent: emailMap.has(`${reg.id}_approval`) || false,
      reminder_email_sent: emailMap.has(`${reg.id}_reminder`) || false,
    }))
    
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error fetching all registrations with details:", error)
    throw new Error("Failed to fetch all registrations with details")
  }
}

// Function to check if registration is open
export async function isRegistrationOpen() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT registration_open, close_reason 
      FROM registration_settings 
      ORDER BY id DESC 
      LIMIT 1
    `
    
    if (result.length === 0) {
      // If no settings exist, default to open
      return { 
        isOpen: true, 
        closeReason: 'Registration has closed as we have met the target number of participants.' 
      }
    }
    
    return {
      isOpen: result[0].registration_open,
      closeReason: result[0].close_reason
    }
  } catch (error) {
    console.error("Error checking registration status:", error)
    // Default to open on error
    return { 
      isOpen: true, 
      closeReason: 'Registration has closed as we have met the target number of participants.' 
    }
  }
}

// Function to toggle registration status
export async function toggleRegistrationStatus(shouldOpen: boolean) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Update or insert the setting
    await sql`
      INSERT INTO registration_settings (id, registration_open, updated_at)
      VALUES (1, ${shouldOpen}, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        registration_open = ${shouldOpen},
        updated_at = NOW()
    `
    
    revalidatePath('/')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error("Error toggling registration status:", error)
    throw new Error("Failed to toggle registration status")
  }
}

// Helper function to generate JWT token
function generateToken(userId: number) {
  const jwt = require('jsonwebtoken')
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}
