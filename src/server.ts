import express, { Application, Request, Response } from "express";
import { ApolloServer, gql } from "apollo-server-express";
import cors from "cors";
import dotenv from "dotenv";
import { NotificationService } from "./modules/notifications/services/NotificationService";

dotenv.config();
const notificationService = new NotificationService();

async function startServer() {
  const app: Application = express();
  const PORT = process.env.PORT || 4000;

  const typeDefs = gql`
    type Notification {
      id: ID
      recipient: String
      message: String
      channel: String
      status: String
      createdAt: String
    }

    type Query {
      hello: String
      serverStatus: String
      getNotifications: [Notification]
    }

    type Mutation {
      sendTestNotification(recipient: String!, message: String!): Notification
    }
  `;

  const resolvers = {
    Query: {
      hello: () => "Bem-vindo ao OmniConnect GraphQL!",
      serverStatus: () => "Operacional",
      getNotifications: async () =>
        await notificationService.getAllNotifications(),
    },
    Mutation: {
      sendTestNotification: async (
        _: any,
        args: { recipient: string; message: string },
      ) => {
        return await notificationService.createNotification({
          recipient: args.recipient,
          message: args.message,
          channel: "WHATSAPP",
        });
      },
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Ordem correta dos middlewares:
  app.use(cors());

  // Apenas use express.json() se a rota NÃO for /graphql
  // Ou simplesmente aplique o middleware do Apollo ANTES do express.json()
  server.applyMiddleware({ app: app as any, path: "/graphql" });

  app.use(express.json()); // Movido para DEPOIS do Apollo ou gerenciado globalmente

  // Rota REST
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK" });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 GraphQL: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error("Erro ao iniciar o servidor:", error);
});
