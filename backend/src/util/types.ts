import { Prisma, PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { Context } from "graphql-ws";
import { ISODateString } from "next-auth";
import { conversationPopulated, participantPopulated } from "../graphql/resolvers/conversation";
import { messagePopulated } from "../graphql/resolvers/message";

/**
 * SERVER CONFIGURATION
 */

export interface SubscriptionContext extends Context {
  connectionParams: {
    session: Session | null;
  };
}

export interface GraphQLContext {
  session: Session | null;
  prisma: PrismaClient;
  pubsub: PubSub;
}

export interface Session {
  user: User;
  expires: ISODateString;
}

/**
 * USERS CONFIGURATION
 */

export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  image: string;
  name: string;
}

export interface CreateUsernameResponse {
  success?: boolean;
  error?: string;
}

/**
 * CONVERSATIONS
 */

export type ConversationPopulated = Prisma.ConversationGetPayload<{ include: typeof conversationPopulated }>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{ include: typeof participantPopulated }>;

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

/**
 * MESSAGES
 */

export interface sendMessageArguments {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export interface MessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}

export type MessagePopulated = Prisma.MessageGetPayload<{ include: typeof messagePopulated }>;
