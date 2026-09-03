/**
 * Test Email Script
 * Run this with: npx tsx test-email.js
 * Make sure to have your environment variables set up first
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

async function sendTestEmail() {
  try {
    console.log('🚀 Starting email test...\n')

    // Verify environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in .env.local')
    }
    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error('RESEND_FROM_EMAIL is not set in .env.local')
    }
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set - cannot fetch campaign data')
    }

    // Import the database client
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)

    // Fetch the latest campaign from the database
    console.log('📊 Fetching latest campaign from database...')
    const campaigns = await sql`
      SELECT * FROM campaigns 
      WHERE status = 'published' AND is_registration_open = true
      ORDER BY created_at DESC 
      LIMIT 1
    `

    let campaignData
    if (!campaigns || campaigns.length === 0) {
      console.log('⚠️  No published campaigns with open registration found.')
      console.log('Trying to fetch any campaign...')
      
      const anyCampaigns = await sql`
        SELECT * FROM campaigns 
        ORDER BY created_at DESC 
        LIMIT 1
      `
      
      if (!anyCampaigns || anyCampaigns.length === 0) {
        throw new Error('No campaigns found in database. Please create a campaign first.')
      }
      
      campaignData = anyCampaigns[0]
      console.log('ℹ️  Using campaign (status: ' + campaignData.status + '):', campaignData.title)
    } else {
      campaignData = campaigns[0]
      console.log('✅ Found active campaign:', campaignData.title)
    }

    // Import the email service
    const { sendConfirmationEmail, sendApprovalEmail, sendReminderEmail } = await import('./app/email-service.ts')

    const testRecipient = 'dicksonhardy7@gmail.com'
    const firstName = 'Dickson'
    const fullName = 'Dickson Hardy'
    const registrationId = 'TEST-001'

    console.log('\n📧 Test Email Details:')
    console.log('   To:', testRecipient)
    console.log('   Name:', fullName)
    console.log('   Registration ID:', registrationId)
    console.log('\n📅 Campaign Data from Database:')
    console.log('   ID:', campaignData.id)
    console.log('   Title:', campaignData.title)
    console.log('   Slug:', campaignData.slug)
    console.log('   Dates:', `${campaignData.start_date} to ${campaignData.end_date}`)
    console.log('   Location:', campaignData.location)
    console.log('   Fee:', `₦${campaignData.registration_fee?.toLocaleString() || 'N/A'}`)
    console.log('   Payment Deadline:', campaignData.registration_deadline || 'Not set')
    console.log('   Bank:', campaignData.payment_bank)
    console.log('   Account:', `${campaignData.payment_account_number} (${campaignData.payment_account_name})`)
    console.log('   Contact:', campaignData.contact_phone)
    console.log('\n' + '='.repeat(60) + '\n')

    // Ask which email type to send
    console.log('Which email would you like to send?')
    console.log('1. Confirmation Email')
    console.log('2. Approval Email')
    console.log('3. Reminder Email')
    console.log('4. All Three\n')

    // Default to confirmation email for this test
    const emailType = process.argv[2] || '1'

    if (emailType === '1' || emailType === '4') {
      console.log('📤 Sending Confirmation Email...')
      const result1 = await sendConfirmationEmail(
        testRecipient,
        firstName,
        registrationId,
        fullName,
        campaignData
      )
      
      if (result1.success) {
        console.log('✅ Confirmation Email sent successfully!')
        console.log('   Email ID:', result1.data?.id)
      } else {
        console.error('❌ Failed to send Confirmation Email:', result1.error)
      }
      console.log('')
    }

    if (emailType === '2' || emailType === '4') {
      console.log('📤 Sending Approval Email...')
      const result2 = await sendApprovalEmail(
        testRecipient,
        firstName,
        registrationId,
        campaignData
      )
      
      if (result2.success) {
        console.log('✅ Approval Email sent successfully!')
        console.log('   Email ID:', result2.data?.id)
      } else {
        console.error('❌ Failed to send Approval Email:', result2.error)
      }
      console.log('')
    }

    if (emailType === '3' || emailType === '4') {
      console.log('📤 Sending Reminder Email...')
      const result3 = await sendReminderEmail(
        testRecipient,
        firstName,
        registrationId,
        campaignData
      )
      
      if (result3.success) {
        console.log('✅ Reminder Email sent successfully!')
        console.log('   Email ID:', result3.data?.id)
      } else {
        console.error('❌ Failed to send Reminder Email:', result3.error)
      }
      console.log('')
    }

    console.log('='.repeat(60))
    console.log('✨ Test completed! Check the inbox at', testRecipient)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Error running email test:', error)
    console.error('\nMake sure:')
    console.error('1. Your .env file has RESEND_API_KEY and RESEND_FROM_EMAIL')
    console.error('2. You have the required dependencies installed')
    console.error('3. Your database is accessible (for email tracking)')
    process.exit(1)
  }
}

// Run the test
sendTestEmail()
