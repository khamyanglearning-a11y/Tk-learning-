
/**
 * WhatsApp Gateway Service (UltraMsg Integration)
 * --------------------------------------------
 * 1. Sign up at https://ultramsg.com/
 * 2. Scan QR code to link your phone.
 * 3. Copy Instance ID and Token below.
 */

const INSTANCE_ID = 'YOUR_INSTANCE_ID_HERE'; // e.g., 'instance12345'
const API_TOKEN = 'YOUR_TOKEN_HERE';         // e.g., 'abcdef123456'

export interface WhatsAppResponse {
  success: boolean;
  message: string;
  isReal: boolean;
  provider?: string;
}

export const sendWhatsAppOtp = async (whatsappNumber: string, otp: string, messageBody: string): Promise<WhatsAppResponse> => {
  // Check if credentials are still placeholders
  if (INSTANCE_ID === 'YOUR_INSTANCE_ID_HERE' || API_TOKEN === 'YOUR_TOKEN_HERE') {
    console.warn("WhatsApp API Credentials missing. Running in SIMULATION MODE.");
    return { 
      success: true, 
      message: messageBody, 
      isReal: false 
    };
  }

  try {
    // UltraMsg API endpoint for sending a chat message
    const url = `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`;
    
    // Ensure number is in international format without '+' for UltraMsg (e.g., 919876543210)
    const formattedNumber = whatsappNumber.startsWith('91') ? whatsappNumber : `91${whatsappNumber}`;

    const params = new URLSearchParams();
    params.append('token', API_TOKEN);
    params.append('to', formattedNumber);
    params.append('body', messageBody);
    params.append('priority', '10');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    const data = await response.json();

    if (data.sent === 'true' || data.success) {
      return { 
        success: true, 
        message: `OTP sent to +${formattedNumber} via WhatsApp.`, 
        isReal: true,
        provider: 'UltraMsg'
      };
    } else {
      return { 
        success: false, 
        message: data.error || "Server failed to deliver WhatsApp message.", 
        isReal: true 
      };
    }
  } catch (error) {
    console.error("WhatsApp Gateway Error:", error);
    return { 
      success: false, 
      message: "Connection to WhatsApp server failed.", 
      isReal: true 
    };
  }
};
