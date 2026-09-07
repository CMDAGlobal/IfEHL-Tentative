import * as React from 'react';

interface ConfirmationEmailProps {
  firstName: string;
  registrationId: string;
  fullName: string;
  email: string;
  campaignTitle?: string;
  campaignDates?: string;
  campaignVenue?: string;
  registrationFee?: number;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  whatsappGroupLink?: string;
  paymentInstructions?: string;
  customMessage?: string;
  nextStepsText?: string;
  footerText?: string;
  logoUrl?: string;
}

export const ConfirmationEmail: React.FC<ConfirmationEmailProps> = ({
  firstName,
  registrationId,
  fullName,
  email,
  campaignTitle = 'IFEHL 2026',
  campaignDates = '16-23rd November, 2026',
  campaignVenue = 'Wholeness House, Gwagalada, Abuja',
  registrationFee = 50000,
  accountName = 'Institute for Excellence in Healthcare and Leadership',
  accountNumber = '1018339742',
  bankName = 'UBA',
  contactPhone = '08091533339',
  contactEmail = 'ifehl@cmdanigeria.org',
  whatsappNumber,
  whatsappGroupLink = 'https://chat.whatsapp.com/DA2iIYHr332EMknkfoWyIr?mode=gi_t',
  paymentInstructions,
  customMessage,
  nextStepsText,
  footerText,
  logoUrl,
}) => (
  <div style={{ 
    fontFamily: 'Arial, sans-serif', 
    maxWidth: '600px', 
    margin: '0 auto',
    backgroundColor: '#f9fafb',
    padding: '20px'
  }}>
    {/* Header */}
    <div style={{ 
      backgroundColor: '#7c3aed', 
      color: 'white', 
      padding: '30px 20px', 
      textAlign: 'center',
      borderRadius: '8px 8px 0 0'
    }}>
      <img 
        src={logoUrl || 'https://ifehl.cmdanigeria.org/ifehl-logo-new.png'} 
        alt="IFEHL Logo" 
        style={{ 
          height: '60px', 
          width: 'auto', 
          margin: '0 auto 15px auto', 
          display: 'block' 
        }} 
      />
      <h1 style={{ margin: '0', fontSize: '28px' }}>{campaignTitle}</h1>
      <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: '0.9' }}>
        IfEHL
      </p>
    </div>

    {/* Main Content */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '40px 30px',
      borderRadius: '0 0 8px 8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Success Message */}
      <div style={{ 
        backgroundColor: '#ecfdf5', 
        border: '1px solid #10b981', 
        borderRadius: '6px', 
        padding: '15px', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          color: '#065f46', 
          margin: '0 0 10px 0', 
          fontSize: '20px' 
        }}>
          ✅ Registration Received!
        </h2>
        <p style={{ 
          color: '#047857', 
          margin: '0', 
          fontSize: '14px' 
        }}>
          Your registration has been successfully submitted
        </p>
      </div>

      <h2 style={{ color: '#374151', marginBottom: '20px' }}>
        Dear {firstName},
      </h2>

      <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-line' }}>
        {customMessage || <>Thank you for registering for <strong>{campaignTitle}</strong>! We have successfully received your registration and you should receive this confirmation email as proof of your submission.</>}
      </p>

      {/* Registration Details */}
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        border: '1px solid #d1d5db', 
        borderRadius: '6px', 
        padding: '20px', 
        marginBottom: '25px' 
      }}>
        <h3 style={{ 
          color: '#374151', 
          margin: '0 0 15px 0', 
          fontSize: '18px' 
        }}>
          Your Registration Details:
        </h3>
        <div style={{ color: '#4b5563', lineHeight: '1.8' }}>
          <p style={{ margin: '5px 0' }}>
            <strong>Registration ID:</strong> {registrationId}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Name:</strong> {fullName}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Email:</strong> {email}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Registration Date:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Event Details */}
      <div style={{ 
        backgroundColor: '#fef3c7', 
        border: '1px solid #f59e0b', 
        borderRadius: '6px', 
        padding: '20px', 
        marginBottom: '25px' 
      }}>
        <h3 style={{ 
          color: '#92400e', 
          margin: '0 0 15px 0', 
          fontSize: '18px' 
        }}>
          Event Information:
        </h3>
        <div style={{ color: '#78350f', lineHeight: '1.8' }}>
          <p style={{ margin: '5px 0' }}>
            <strong>📅 Date:</strong> {campaignDates}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>📍 Venue:</strong> {campaignVenue}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>💰 Registration Fee:</strong> ₦{registrationFee.toLocaleString()}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>📞 Contact:</strong> {contactPhone}
          </p>
        </div>
      </div>

      {/* Payment Information */}
      <div style={{ 
        backgroundColor: '#fef2f2', 
        border: '1px solid #ef4444', 
        borderRadius: '6px', 
        padding: '20px', 
        marginBottom: '25px' 
      }}>
        <h3 style={{ 
          color: '#dc2626', 
          margin: '0 0 15px 0', 
          fontSize: '18px' 
        }}>
          ⚠️ Important: Complete Your Payment
        </h3>
        <p style={{ color: '#991b1b', lineHeight: '1.6', marginBottom: '15px' }}>
          Your registration is <strong>not complete</strong> until payment is made. Please transfer ₦{registrationFee.toLocaleString()} to:
        </p>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '4px',
          color: '#374151'
        }}>
          <p style={{ margin: '5px 0' }}>
            <strong>Account Name:</strong> {accountName}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Account Number:</strong> {accountNumber}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Bank:</strong> {bankName}
          </p>
        </div>
        {paymentInstructions && (
          <p style={{ 
            color: '#991b1b', 
            fontSize: '14px', 
            marginTop: '15px',
            fontWeight: 'bold'
          }}>
            ⚠️ Transfer Instruction: {paymentInstructions}
          </p>
        )}
        <p style={{ 
          color: '#991b1b', 
          fontSize: '14px', 
          marginTop: '10px',
          fontStyle: 'italic' 
        }}>
          Please use your Registration ID ({registrationId}) as the payment reference.
        </p>
      </div>

      {/* Next Steps */}
      <div style={{ 
        backgroundColor: '#eff6ff', 
        border: '1px solid #3b82f6', 
        borderRadius: '6px', 
        padding: '20px', 
        marginBottom: '25px' 
      }}>
        <h3 style={{ 
          color: '#1e40af', 
          margin: '0 0 15px 0', 
          fontSize: '18px' 
        }}>
          What's Next?
        </h3>
        <ol style={{ color: '#1e3a8a', lineHeight: '1.8', margin: '0', paddingLeft: '20px' }}>
          {nextStepsText ? (
            <li style={{ whiteSpace: 'pre-line' }}>{nextStepsText}</li>
          ) : (
            <>
              <li>Complete your payment using the details above</li>
              <li>Send your payment receipt to {whatsappNumber || contactPhone} on WhatsApp</li>
              <li>Join our WhatsApp group for updates (link below)</li>
              <li>Keep this email and your Registration ID safe</li>
              <li>You will receive further instructions closer to the event date</li>
            </>
          )}
        </ol>
      </div>

      {/* WhatsApp Group Button */}
      {whatsappGroupLink && (
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '25px' 
      }}>
        <a 
          href={whatsappGroupLink}
          style={{
            display: 'inline-block',
            backgroundColor: '#25D366',
            color: 'white',
            padding: '15px 30px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          📱 Join WhatsApp Group
        </a>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '13px', 
          marginTop: '10px',
          margin: '10px 0 0 0'
        }}>
          Click the button above to join our community group
        </p>
      </div>
      )}

      <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '20px' }}>
        If you have any questions or concerns, please don't hesitate to contact us at 
        <strong> {contactPhone}</strong> or email us at 
        <strong> {contactEmail}</strong>.
      </p>

      <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
        We look forward to seeing you at {campaignTitle}!
      </p>

      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: '20px', 
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '14px', 
          margin: '0' 
        }}>
          Best regards,<br />
          <strong>IFEHL Team</strong>
          {footerText && (
            <>
              <br />
              {footerText}
            </>
          )}
        </p>
      </div>
    </div>

    {/* Footer */}
    <div style={{ 
      textAlign: 'center', 
      padding: '20px', 
      color: '#6b7280', 
      fontSize: '12px' 
    }}>
      <p style={{ margin: '0 0 10px 0' }}>
        IfEHL
      </p>
      <p style={{ margin: '0' }}>
        This email was sent to {email} regarding your {campaignTitle} registration.
      </p>
    </div>
  </div>
);
