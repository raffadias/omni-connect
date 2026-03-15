import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

export class TwilioService {
  private client;
  private from;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.from = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
  }

  async sendWhatsApp(to: string, message: string) {
    try {
      // Garante que o número está no formato que o Twilio espera
      const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

      const response = await this.client.messages.create({
        from: this.from,
        to: formattedTo,
        body: message,
      });

      return { success: true, sid: response.sid };
    } catch (error: any) {
      console.error("Erro Twilio:", error.message);
      return { success: false, error: error.message };
    }
  }
}
