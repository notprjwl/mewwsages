
import { ConversationPopulated, MessagePopulated } from "../../../backend/src/util/types"


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


export interface ConversationCreatedSubscriptionData {
  subscriptionData: {
    data: {
      conversationCreated: ConversationPopulated;
    };
  };
}


/**
 * MESSAGES
 */

export interface MessagesData {
  messages:  Array<MessagePopulated>;
}

export interface MessagesVariables {
  conversationId: string;
}
