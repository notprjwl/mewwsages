import { GraphQLError } from "graphql";
import { GraphQLContext, MessagePopulated, MessageSentSubscriptionPayload, sendMessageArguments } from "../../util/types";
import { Prisma } from "@prisma/client";
import { withFilter } from "graphql-subscriptions";
import { conversationPopulated } from "./conversation";
import { userIsConversationParticipant } from "../../util/functions";

const resolvers = {
  Query: {
    // fetching all the messages when you click a chat
    messages: async (_: any, args: { conversationId: string }, context: GraphQLContext): Promise<Array<MessagePopulated>> => {
      const { session, prisma } = context;
      const { conversationId } = args;

      if (!session?.user) {
        throw new GraphQLError("NOT AUTHORIZED");
      }

      const { id: userId } = session.user;

      /**
       * VERIFY THAT THE USER IS A PARTICIPANT
       */
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });


      // if the conversation is not present
      if (!conversation) {
        throw new GraphQLError("CONVERSATION NOT FOUND");
      }

      // if the user is not part of the conversation
      const allowedToView = userIsConversationParticipant(conversation.participants, userId);

      if (!allowedToView) {
        throw new GraphQLError("NOT AUTHORIZED");
      }

      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });
        
        return messages;
      } catch (error: any) {
        console.log("MESSAGES ERROR", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    // sendMessage function
    sendMessage: async (_: any, args: sendMessageArguments, context: GraphQLContext): Promise<boolean> => {
      const { session, prisma, pubsub } = context;
      const { id: messageId, conversationId, senderId, body } = args;

      if (!session?.user) {
        throw new GraphQLError("NOT AUTHORIZED");
      }

      const { id: userId } = session.user;

      // if the userID is not the same as the senderID we are not going to allow the user to send a message
      if (userId !== senderId) {
        throw new GraphQLError("NOT AUTHORIZED");
      }

      try {
        /**
         * CREATE NEW MESSAGE ENTITY
         */
        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });

        /**
         * UPDATE CONVERSATION ENTITY
         */
        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: senderId,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    id: senderId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
        });

        // publishing event
        pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });
        // pubsub.publish("CONVERSATION_UPDATED", { conversationUpdated: { conversation } });
      } catch (error: any) {
        console.log("sendMessage error", error);
        throw new GraphQLError(error?.message);
      }

      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["MESSAGE_SENT"]);
        },
        (payload: MessageSentSubscriptionPayload, args: { conversationId: string }, context: GraphQLContext) => {
          return payload.messageSent.conversationId === args.conversationId;
        }
      ),
    },
  },
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

export default resolvers;
