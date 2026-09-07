import * as React from 'react';

interface ReminderEmailProps {
  firstName: string;
  registrationId: string;
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
  footerText?: string;
  logoUrl?: string;
}

export const ReminderEmail: React.FC<ReminderEmailProps> = ({
  firstName,
  registrationId,
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
  whatsappGroupLink,
  paymentInstructions,
  customMessage,
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
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '30px 20px',
      textAlign: 'center' as const,
      borderRadius: '8px 8px 0 0',
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
      <h1 style={{
        color: 'white',
        margin: '0',
        fontSize: '28px',
        fontWeight: 'bold',
      }}>
        Payment Reminder - {campaignTitle}
      </h1>
    </div>
    
    {/* Main Content */}
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px 30px',
      borderRadius: '0 0 8px 8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px', color: '#374151' }}>
        Dear <span style={{ fontWeight: 'bold' }}>{firstName}</span>,
      </p>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px', color: '#4b5563', whiteSpace: 'pre-line' }}>
        {customMessage || <>This is a friendly reminder regarding your registration (ID: <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{registrationId}</span>) for <strong>{campaignTitle}</strong>.</>}
      </p>
      
      {/* Payment Reminder */}
      <div style={{
        backgroundColor: '#fef3c7',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px',
        border: '1px solid #f59e0b',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '0', color: '#92400e' }}>
          ⚠️ Action Required: Complete Your Payment
        </h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '15px', color: '#78350f' }}>
          To secure your spot at {campaignTitle}, please complete your payment of <strong>₦{registrationFee.toLocaleString()}</strong> to:
        </p>
        
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '15px',
          border: '1px solid #fcd34d',
        }}>
          <p style={{ margin: '5px 0', color: '#374151' }}>
            <strong>Account Name:</strong> {accountName}
          </p>
          <p style={{ margin: '5px 0', color: '#374151' }}>
            <strong>Account Number:</strong> {accountNumber}
          </p>
          <p style={{ margin: '5px 0', color: '#374151' }}>
            <strong>Bank:</strong> {bankName}
          </p>
        </div>
        
        {paymentInstructions && (
          <div style={{
            backgroundColor: '#fee2e2',
            padding: '15px',
            borderRadius: '6px',
            border: '1px solid #ef4444',
          }}>
            <p style={{ 
              margin: '0',
              fontSize: '14px',
              color: '#991b1b',
              fontWeight: 'bold'
            }}>
              ⚠️ Transfer Instruction: {paymentInstructions}
            </p>
            <p style={{ 
              margin: '10px 0 0 0',
              fontSize: '14px',
              color: '#991b1b',
              fontStyle: 'italic'
            }}>
              Use your Registration ID ({registrationId}) as the payment reference.
            </p>
          </div>
        )}
      </div>
      
      {/* Event Details */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px',
        border: '1px solid #d1d5db',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '0', color: '#374151' }}>
          Event Details
        </h2>
        
        <p style={{ margin: '10px 0', color: '#4b5563' }}>
          <strong>📅 Date:</strong> {campaignDates}
        </p>
        
        <p style={{ margin: '10px 0', color: '#4b5563' }}>
          <strong>📍 Venue:</strong> {campaignVenue}
        </p>
        
        <p style={{ margin: '10px 0', color: '#4b5563' }}>
          <strong>💰 Registration Fee:</strong> ₦{registrationFee.toLocaleString()}
        </p>
        
        <p style={{ margin: '10px 0', color: '#4b5563' }}>
          <strong>📞 Contact:</strong> {contactPhone}
        </p>
      </div>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px', color: '#4b5563' }}>
        If you have already made the payment, please disregard this reminder. Your confirmation will be processed shortly.
      </p>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '5px', color: '#4b5563' }}>
        For any questions, please contact us at <strong>{contactPhone}</strong> or email <strong>{contactEmail}</strong>.
      </p>
      {whatsappNumber && (
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '5px', color: '#4b5563' }}>
          Send payment receipts to <strong>{whatsappNumber}</strong> on WhatsApp.
        </p>
      )}
      {whatsappGroupLink && (
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '5px', color: '#4b5563' }}>
          Join the WhatsApp group here: <a href={whatsappGroupLink} style={{ color: '#2563eb' }}>WhatsApp Group</a>
        </p>
      )}
      
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        marginTop: '30px',
        textAlign: 'center' as const,
      }}>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0',
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
      textAlign: 'center' as const, 
      padding: '20px', 
      color: '#6b7280', 
      fontSize: '12px' 
    }}>
      <p style={{ margin: '0 0 10px 0' }}>
        IfEHL
      </p>
      <p style={{ margin: '0' }}>
        © {new Date().getFullYear()} IfEHL. All rights reserved.
      </p>
    </div>
  </div>
);
