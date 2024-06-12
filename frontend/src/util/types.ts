
// import { ConversationPopulated } from "../../../backend/src/util/types"

import { Prisma } from "@prisma/client";

/**
 * USERS
 */
export interface CreateUsernameData {
  createUsername: {
    success: boolean;
    error: boolean;
  };
}

export interface CreateUsernameVariables {
  username: string;
}

export interface SearchUsersInput {
  username: string;
}

export interface SearchUsersData {
  searchUsers: Array<SearchedUser>;
}

export interface SearchedUser {
  id: string;
  username: string;
  image: string;
}

/**
 * CONVERSATIONS
 */

export interface ConversationsData {
  conversations: Array<ConversationPopulated>;
}

export interface CreateConversationData {
  createConversation: {
    conversationId: string;
  };
}

export interface CreateConversationInput {
  participantIds: Array<string>;
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{ include: typeof conversationPopulated }>;

export interface 