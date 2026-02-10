import twilio from 'twilio';

/**
 * Sends an SOS SMS to the emergency recipient
 */
export const sendSOSMS = async (userName: string, location: any) => {
    console.log('🔄 [SMS] Attempting to send SOS alert...');

    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim() || '+12602339412';
    const emergencyNumber = (process.env.EMERGENCY_RECIPIENT_NUMBER || '01627603818').trim();

    if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
        console.warn('⚠️ [SMS] Twilio credentials, Messaging Service SID, or From Number missing.');
        return;
    }

    // Safe debug of credentials
    console.log(`🔍 [SMS] Debug: SID starts with ${accountSid.substring(0, 5)} (Length: ${accountSid.length})`);
    console.log(`🔍 [SMS] Debug: Token starts with ${authToken.substring(0, 5)} (Length: ${authToken.length})`);

    try {
        const client = twilio(accountSid, authToken);
        const mapsLink = `https://www.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}`;

        // Ensure number is in E.164 format (+88 for Bangladesh)
        let to = emergencyNumber;
        if (!to.startsWith('+')) {
            to = to.startsWith('0') ? `+88${to}` : `+880${to}`;
        }

        console.log(`📡 [SMS] Sending to: ${to} from ${fromNumber || messagingServiceSid}`);

        const messageData: any = {
            body: `🚨 SOS ALERT from DeshiTrip 🚨\n\nExplorer: ${userName}\nis in an emergency!\n\n📍 Location: ${mapsLink}\n\n(This is an automated emergency alert)`,
            to: to
        };

        // Prefer Messaging Service, fallback to direct number
        if (messagingServiceSid) {
            messageData.messagingServiceSid = messagingServiceSid;
        } else {
            messageData.from = fromNumber;
        }

        const message = await client.messages.create(messageData);

        console.log(`✅ [SMS] Alert sent successfully: ${message.sid} (Status: ${message.status})`);
        return message;
    } catch (error: any) {
        console.error('❌ [SMS] Twilio Error:', {
            message: error.message,
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo
        });
    }
};
