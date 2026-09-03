-- Migration: Store full email templates in the database
-- Templates can be global (campaign_id NULL) or campaign-specific.

CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('confirmation', 'approval', 'reminder')),
    name VARCHAR(120) NOT NULL,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_campaign_email_template UNIQUE (campaign_id, email_type)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_global_email_template
ON email_templates(email_type)
WHERE campaign_id IS NULL;

COMMENT ON TABLE email_templates IS 'Full email templates with {{namedPlaceholders}} for campaign and registration details';
COMMENT ON COLUMN email_templates.campaign_id IS 'NULL means default global template. Non-NULL overrides the template for one campaign.';
COMMENT ON COLUMN email_templates.email_type IS 'confirmation, approval, or reminder';
COMMENT ON COLUMN email_templates.subject_template IS 'Subject line with placeholders such as {{campaignTitle}}';
COMMENT ON COLUMN email_templates.html_template IS 'Full HTML email body with placeholders such as {{firstName}} and {{registrationId}}';
COMMENT ON COLUMN email_templates.text_template IS 'Plain-text fallback email body with placeholders';

INSERT INTO email_templates (campaign_id, email_type, name, subject_template, html_template, text_template)
VALUES
(
    NULL,
    'confirmation',
    'Default Confirmation Email',
    'Registration Confirmation - {{campaignTitle}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
  <div style="background-color: #7c3aed; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <img src="{{logoUrl}}" alt="IFEHL Logo" style="height: 60px; width: auto; margin: 0 auto 15px auto; display: block;" />
    <h1 style="margin: 0; font-size: 28px;">{{campaignTitle}}</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Institute for Excellence in Healthcare and Leadership</p>
  </div>
  <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin-bottom: 30px; text-align: center;">
      <h2 style="color: #065f46; margin: 0 0 10px 0; font-size: 20px;">Registration Received!</h2>
      <p style="color: #047857; margin: 0; font-size: 14px;">Your registration has been successfully submitted</p>
    </div>
    <h2 style="color: #374151; margin-bottom: 20px;">Dear {{firstName}},</h2>
    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">Thank you for registering for <strong>{{campaignTitle}}</strong>! We have successfully received your registration and you should receive this confirmation email as proof of your submission.</p>
    <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
      <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Your Registration Details:</h3>
      <p><strong>Registration ID:</strong> {{registrationId}}</p>
      <p><strong>Name:</strong> {{fullName}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Registration Date:</strong> {{registrationDate}}</p>
    </div>
    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
      <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">Event Information:</h3>
      <p><strong>Date:</strong> {{campaignDates}}</p>
      <p><strong>Venue:</strong> {{campaignVenue}}</p>
      <p><strong>Registration Fee:</strong> {{registrationFee}}</p>
      <p><strong>Contact:</strong> {{contactPhone}}</p>
    </div>
    <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
      <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">Important: Complete Your Payment</h3>
      <p style="color: #991b1b; line-height: 1.6;">Your registration is <strong>not complete</strong> until payment is made. Please transfer {{registrationFee}} to:</p>
      <div style="background-color: white; padding: 15px; border-radius: 4px; color: #374151;">
        <p><strong>Account Name:</strong> {{accountName}}</p>
        <p><strong>Account Number:</strong> {{accountNumber}}</p>
        <p><strong>Bank:</strong> {{bankName}}</p>
      </div>
      <p style="color: #991b1b; font-size: 14px; margin-top: 15px; font-weight: bold;">Transfer Instruction: {{paymentInstructions}}</p>
      <p style="color: #991b1b; font-size: 14px; margin-top: 10px; font-style: italic;">Please use your Registration ID ({{registrationId}}) as the payment reference.</p>
    </div>
    <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
      <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">What''s Next?</h3>
      <ol style="color: #1e3a8a; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Complete your payment using the details above</li>
        <li>Send your payment receipt to {{whatsappNumber}} on WhatsApp</li>
        <li>Join our WhatsApp group for updates using {{whatsappGroupLink}}</li>
        <li>Keep this email and your Registration ID safe</li>
        <li>You will receive further instructions closer to the event date</li>
      </ol>
    </div>
    <div style="text-align: center; margin-bottom: 25px;">
      <a href="{{whatsappGroupLink}}" style="display: inline-block; background-color: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Join WhatsApp Group</a>
      <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">Click the button above to join our community group</p>
    </div>
    <p style="color: #4b5563; line-height: 1.6;">If you have any questions or concerns, please contact us at <strong>{{contactPhone}}</strong> or email <strong>{{contactEmail}}</strong>.</p>
    <p style="color: #4b5563; line-height: 1.6;">We look forward to seeing you at {{campaignTitle}}!</p>
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">Best regards,<br /><strong>IFEHL Team</strong></p>
    </div>
  </div>
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>Institute for Excellence in Healthcare and Leadership</p>
    <p>This email was sent to {{email}} regarding your {{campaignTitle}} registration.</p>
  </div>
</div>',
    'Dear {{firstName}},

Thank you for registering for {{campaignTitle}}.

Registration ID: {{registrationId}}
Name: {{fullName}}
Email: {{email}}
Date: {{campaignDates}}
Venue: {{campaignVenue}}
Fee: {{registrationFee}}

Please send your payment receipt to {{whatsappNumber}} on WhatsApp.

IFEHL Team'
),
(
    NULL,
    'approval',
    'Default Approval Email',
    'Registration Approved - {{campaignTitle}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 20px;"><img src="{{logoUrl}}" alt="IFEHL Logo" style="max-width: 150px; height: auto;" /></div>
  <div style="background-color: #6633cc; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;"><h1 style="color: white; margin: 0; font-size: 24px;">Registration Approved - {{campaignTitle}}</h1></div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e1e1e1; border-top: none;">
    <p>Dear <strong>{{firstName}}</strong>,</p>
    <p>We are pleased to inform you that your registration (ID: <strong style="color: #6633cc;">{{registrationId}}</strong>) for {{campaignTitle}} has been approved.</p>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="font-size: 18px; color: #6633cc;">Event Details</h2>
      <p><strong>Date:</strong> {{campaignDates}}</p>
      <p><strong>Venue:</strong> {{campaignVenue}}</p>
      <p><strong>Registration Fee:</strong> {{registrationFee}}</p>
    </div>
    <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="font-size: 18px; color: #856404;">Payment Information</h2>
      <p><strong>Bank:</strong> {{bankName}}<br /><strong>Account Number:</strong> {{accountNumber}}<br /><strong>Account Name:</strong> {{accountName}}</p>
      <div style="background-color: #ffffff; border: 2px solid #dc3545; padding: 15px; border-radius: 6px; margin-top: 15px;">
        <strong style="color: #dc3545;">IMPORTANT: Transfer Narration</strong>
        <p>When making your transfer, please add <strong>{{campaignTitle}}</strong> to your transfer narration/description.</p>
      </div>
      <div style="background-color: #f8d7da; border: 2px solid #dc3545; padding: 15px; border-radius: 6px; margin-top: 15px; text-align: center;">
        <strong style="color: #721c24;">PAYMENT DEADLINE: {{paymentDeadline}}</strong>
      </div>
    </div>
    <p>We look forward to seeing you at the event. If you have any questions, please contact us at <strong>{{contactPhone}}</strong> or email <strong>{{contactEmail}}</strong>.</p>
    <p>Send payment receipts to <strong>{{whatsappNumber}}</strong> on WhatsApp.</p>
    <p>Join the WhatsApp group here: <a href="{{whatsappGroupLink}}">WhatsApp Group</a></p>
    <p>Best regards,<br /><strong>IFEHL Team</strong></p>
  </div>
  <div style="text-align: center; margin: 20px 0; color: #666; font-size: 12px;">© {{currentYear}} IfEHL. All rights reserved.</div>
</div>',
    'Dear {{firstName}},

Your registration (ID: {{registrationId}}) for {{campaignTitle}} has been approved.

Date: {{campaignDates}}
Venue: {{campaignVenue}}
Fee: {{registrationFee}}
Payment deadline: {{paymentDeadline}}

Send payment receipts to {{whatsappNumber}} on WhatsApp.

IFEHL Team'
),
(
    NULL,
    'reminder',
    'Default Reminder Email',
    'Payment Reminder - {{campaignTitle}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
  <div style="background-color: #f59e0b; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <img src="{{logoUrl}}" alt="IFEHL Logo" style="height: 60px; width: auto; margin: 0 auto 15px auto; display: block;" />
    <h1 style="color: white; margin: 0; font-size: 28px;">Payment Reminder - {{campaignTitle}}</h1>
  </div>
  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p>Dear <strong>{{firstName}}</strong>,</p>
    <p>This is a friendly reminder regarding your registration (ID: <strong style="color: #f59e0b;">{{registrationId}}</strong>) for <strong>{{campaignTitle}}</strong>.</p>
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #f59e0b;">
      <h2 style="font-size: 18px; color: #92400e;">Action Required: Complete Your Payment</h2>
      <p>To secure your spot at {{campaignTitle}}, please complete your payment of <strong>{{registrationFee}}</strong> to:</p>
      <div style="background-color: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #fcd34d;">
        <p><strong>Account Name:</strong> {{accountName}}</p>
        <p><strong>Account Number:</strong> {{accountNumber}}</p>
        <p><strong>Bank:</strong> {{bankName}}</p>
      </div>
      <p><strong>Transfer Instruction:</strong> {{paymentInstructions}}</p>
      <p><em>Use your Registration ID ({{registrationId}}) as the payment reference.</em></p>
    </div>
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #d1d5db;">
      <h2 style="font-size: 18px; color: #374151;">Event Details</h2>
      <p><strong>Date:</strong> {{campaignDates}}</p>
      <p><strong>Venue:</strong> {{campaignVenue}}</p>
      <p><strong>Registration Fee:</strong> {{registrationFee}}</p>
      <p><strong>Contact:</strong> {{contactPhone}}</p>
    </div>
    <p>If you have already made the payment, please disregard this reminder.</p>
    <p>For any questions, please contact us at <strong>{{contactPhone}}</strong> or email <strong>{{contactEmail}}</strong>.</p>
    <p>Send payment receipts to <strong>{{whatsappNumber}}</strong> on WhatsApp.</p>
    <p>Join the WhatsApp group here: <a href="{{whatsappGroupLink}}">WhatsApp Group</a></p>
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;"><p>Best regards,<br /><strong>IFEHL Team</strong></p></div>
  </div>
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;"><p>© {{currentYear}} IfEHL. All rights reserved.</p></div>
</div>',
    'Dear {{firstName}},

This is a reminder for your registration (ID: {{registrationId}}) for {{campaignTitle}}.

Please complete your payment of {{registrationFee}}.
Bank: {{bankName}}
Account Number: {{accountNumber}}
Account Name: {{accountName}}

Send payment receipts to {{whatsappNumber}} on WhatsApp.

IFEHL Team'
)
ON CONFLICT (email_type) WHERE campaign_id IS NULL DO UPDATE SET
    name = EXCLUDED.name,
    subject_template = EXCLUDED.subject_template,
    html_template = EXCLUDED.html_template,
    text_template = EXCLUDED.text_template,
    updated_at = NOW();
