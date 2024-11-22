// import { ConversationPopulated, MessagePopulated } from "../../../backend/src/util/types";

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

export interface User {
  id: string;
  username: string;
  image: string;
}

/**
 * CONVERSATIONS
 */

// adding import types to the frontend
export interface ParticipantPopulated {
  id: string;
  userId: string;
  conversationId: string;
  hasSeenLatestMessage: boolean;
  user: User;
}


export interface ConversationPopulated {
  id: string;
  createdAt: string;
  updatedAt: string;
  latestMessage: MessagePopulated;
  participants: ParticipantPopulated[];
}


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

export interface ConversationCreatedSubscriptionData {
  subscriptionData: {
    data: {
      conversationCreated: ConversationPopulated;
    };
  };
}

export interface ConversationUpdatedData {
  conversationUpdated: {
    conversation: ConversationPopulated;
  };
}

export interface ConversationDeletedData {
  conversationDeleted: {
    id: string;
  };
}

/**
 * MESSAGES
 */

// adding import types to the frontend
export interface MessagePopulated {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: User;
}


export interface MessagesData {
  messageSent: any;
  messages: Array<MessagePopulated>;
}

export interface MessagesVariables {
  conversationId: string;
}

export interface MessageSubscriptionData {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
}


export interface sendMessageArguments {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}
