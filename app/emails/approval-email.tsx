import * as React from 'react';

interface ApprovalEmailProps {
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
  paymentDeadline?: string;
  paymentInstructions?: string;
  customMessage?: string;
  footerText?: string;
  logoUrl?: string;
}

export const ApprovalEmail: React.FC<ApprovalEmailProps> = ({
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
  paymentDeadline = 'October 31st, 2026',
  paymentInstructions,
  customMessage,
  footerText,
  logoUrl,
}) => (
  <div style={{
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#333',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  }}>
    {/* Logo Header */}
    <div style={{
      textAlign: 'center' as const,
      marginBottom: '20px',
    }}>
      <img 
        src={logoUrl || 'https://ifehl.cmdanigeria.org/IfHEL.%20Logo.png'} 
        alt="IFEHL Logo" 
        style={{
          maxWidth: '150px',
          height: 'auto',
        }}
      />
    </div>

    <div style={{
      backgroundColor: '#6633cc',
      padding: '20px',
      borderRadius: '8px 8px 0 0',
      textAlign: 'center' as const,
    }}>
      <h1 style={{
        color: 'white',
        margin: '0',
        fontSize: '24px',
        fontWeight: 'bold',
      }}>
        Registration Approved - {campaignTitle}
      </h1>
    </div>
    
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '0 0 8px 8px',
      border: '1px solid #e1e1e1',
      borderTop: 'none',
    }}>
      <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
        Dear <span style={{ fontWeight: 'bold' }}>{firstName}</span>,
      </p>
      
      <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px', whiteSpace: 'pre-line' }}>
        {customMessage || <>We are pleased to inform you that your registration (ID: <span style={{ fontWeight: 'bold', color: '#6633cc' }}>{registrationId}</span>) for {campaignTitle} has been approved.</>}
      </p>
      
      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '0', color: '#6633cc' }}>
          Event Details
        </h2>
        
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div style={{ minWidth: '120px', fontWeight: 'bold' }}>Date:</div>
          <div>{campaignDates}</div>
        </div>
        
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div style={{ minWidth: '120px', fontWeight: 'bold' }}>Venue:</div>
          <div>{campaignVenue}</div>
        </div>

        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div style={{ minWidth: '120px', fontWeight: 'bold' }}>Registration Fee:</div>
          <div>₦{registrationFee.toLocaleString()}</div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fff3cd',
        border: '2px solid #ffc107',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '0', color: '#856404' }}>
          💳 Payment Information
        </h2>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Bank Details:</div>
          <div style={{ lineHeight: '1.8' }}>
            <strong>Bank:</strong> {bankName}<br />
            <strong>Account Number:</strong> {accountNumber}<br />
            <strong>Account Name:</strong> {accountName}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '2px solid #dc3545',
          padding: '15px',
          borderRadius: '6px',
          marginTop: '15px',
        }}>
          <div style={{ fontWeight: 'bold', color: '#dc3545', marginBottom: '5px', fontSize: '16px' }}>
            ⚠️ IMPORTANT: Transfer Narration
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            When making your transfer, please add <strong style={{ color: '#dc3545' }}>"{campaignTitle}"</strong> to your transfer narration/description to help us identify your payment quickly.
          </div>
        </div>

        <div style={{
          backgroundColor: '#f8d7da',
          border: '2px solid #dc3545',
          padding: '15px',
          borderRadius: '6px',
          marginTop: '15px',
          textAlign: 'center' as const,
        }}>
          <div style={{ fontWeight: 'bold', color: '#721c24', fontSize: '16px' }}>
            ⏰ PAYMENT DEADLINE: {paymentDeadline}
          </div>
          <div style={{ color: '#721c24', marginTop: '5px', fontSize: '14px' }}>
            Last Day of Collection - Please complete your payment before this date
          </div>
        </div>
      </div>
      
      <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
        We look forward to seeing you at the event. If you have any questions, please don't hesitate to contact us at <strong>{contactPhone}</strong> or email <strong>{contactEmail}</strong>.
      </p>
      {whatsappNumber && (
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
          Send payment receipts to <strong>{whatsappNumber}</strong> on WhatsApp.
        </p>
      )}
      {whatsappGroupLink && (
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
          Join the WhatsApp group here: <a href={whatsappGroupLink} style={{ color: '#6633cc' }}>WhatsApp Group</a>
        </p>
      )}
      
      <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '0' }}>
        Best regards,<br />
        <span style={{ fontWeight: 'bold' }}>IFEHL Team</span>
        {footerText && (
          <>
            <br />
            {footerText}
          </>
        )}
      </p>
    </div>
    
    <div style={{ textAlign: 'center' as const, margin: '20px 0', color: '#666', fontSize: '12px' }}>
      © {new Date().getFullYear()} IfEHL. All rights reserved.
    </div>
  </div>
);
