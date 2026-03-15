import { db } from "../../../config/firebase";
import { TwilioService } from "./TwilioService";

// Interface para tipar nossa notificação
interface INotification {
  id?: string;
  recipient: string;
  message: string;
  channel: "WHATSAPP" | "EMAIL" | "SMS";
  status: "PENDING" | "SENT" | "ERROR";
  createdAt: Date;
}

export class NotificationService {
  private collection = db.collection("notifications");
  private twilioService = new TwilioService();

  async createNotification(data: Omit<INotification, "createdAt" | "status">) {
    try {
      // 1. Criar registro inicial como PENDING
      const newDoc = {
        ...data,
        status: "PENDING",
        createdAt: new Date(),
      };
      const docRef = await this.collection.add(newDoc);

      // 2. Tentar enviar o WhatsApp de forma assíncrona
      const sent = await this.twilioService.sendWhatsApp(
        data.recipient,
        data.message,
      );

      // 3. Atualizar o status no Firebase com base no resultado do Twilio
      const finalStatus = sent.success ? "SENT" : "ERROR";
      await docRef.update({ status: finalStatus });

      return {
        id: docRef.id,
        ...newDoc,
        status: finalStatus,
      };
    } catch (error) {
      console.error("Erro no fluxo de notificação:", error);
      throw new Error("Falha ao processar notificação");
    }
  }

  async getAllNotifications() {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
