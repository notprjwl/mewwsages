import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../util/functions";
import {
  ConversationDeletedSubscriptionPayload,
  ConversationPopulated,
  ConversationUpdatedSubscriptionPayload,
  GraphQLContext,
} from "../../util/types";

/**
 * a query is a request for data, a mutation is a request to change data, and a resolver is the function that gets the data for a specific field in your schema.
 */

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new GraphQLError("NOT AUTHORIZED");
      }
      const {
        user: { id: userId },
      } = session;

      // using prisma to query all of the conversations
      try {
        /**
         * Find all conversation that the user is part of
         */
        const conversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: {
                  equals: userId,
                },
              },
            },
          },
          include: conversationPopulated,
        });
        // return conversations.filter((conversation) => !!conversation.participants.find((p) => p.userId === userId));
        return conversations;
      } catch (error: any) {
        console.log("CONVERSATIONS ERROR", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: Array<string> },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { participantIds } = args;
      const { session, prisma, pubsub } = context;

      console.log("PARTICIPANT IDS", participantIds);

      if (!session?.user) {
        throw new GraphQLError("NOT AUTHORIZED");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        // ADDING A CONVERSATION CREATE EVENT USING PUBSUB
        /**
         * this conversation event is going to be published with a payload conversation
         */
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });

        return {
          conversationId: conversation.id,
        };
      } catch (error: any) {
        console.log("CREATE CONVERSATION ERROR", error);
        throw new GraphQLError("ERROR CREATING CONVERSATION");
      }
    },
    markConversationAsRead: async (
      _: any,
      args: { userId: string; conversationId: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { session, prisma } = context;
      const { userId, conversationId } = args;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId,
            conversationId,
          },
        });

        /**
         *  SHOULD ALWAYS EXISTS BUT BEING SAFE HAHAHA
         */
        if (!participant) {
          throw new GraphQLError("PARTICIPANT ENTITY NOT FOUND");
        }

        // updating the hasSeenLatestMessage
        await prisma.conversationParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            hasSeenLatestMessage: true,
          },
        });

        return true;
      } catch (error: any) {
        console.log("markConversationAsRead error", error);
        throw new GraphQLError(error?.message);
      }
    },
    deleteConversation: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { session, prisma, pubsub } = context;

      const { conversationId } = args;

      if (!session?.user) throw new GraphQLError("Not authorized");

      try {
        const [deletedConversation] = await prisma.$transaction([
          prisma.conversation.delete({
            where: {
              id: conversationId,
            },
            include: conversationPopulated,
          }),
          prisma.conversationParticipant.deleteMany({
            where: {
              conversationId,
            },
          }),
          prisma.message.deleteMany({
            where: {
              conversationId,
            },
          }),
        ]);
        pubsub.publish("CONVERSATION_DELETED", {
          conversationDeleted: deletedConversation,
        });
      } catch (error: any) {
        console.log("deleteConversation error:", error);
        throw new GraphQLError("Failed to delete conversation");
      }
      return true;
    },
  },

  Subscription: {
    conversationCreated: {
      // now since the conversationCreated subscription is listening to the event, then this function will be called every time the conversation is created
      //  basic subscription without using withFilter
      // subscribe: (_: any, __: any, context: GraphQLContext) => {
      //   const { pubsub, session } = context;
      //   console.log("SUBSCRIPTION FIRED");
      //   console.log("Session in subscription", session);
      //   return pubsub.asyncIterator(["CONVERSATION_CREATED"]); // we are listening to the "CONVERSATION_CREATED" event
      // },

      /**
       * If the sign in user is the part of the conversation we are going to return tre and then we are submitting the event. Else will will not fire the event. This is all done using withFilter function
       */

      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (payload: ConversationCreatedSubscriptionPayload, _: any, context: GraphQLContext) => {
          const { session } = context;
          if (!session?.user) throw new GraphQLError("Not authorized");
          const {
            conversationCreated: { participants },
          } = payload;

          const userIsParticipant = userIsConversationParticipant(participants, session?.user?.id);
          console.log("user is participant", userIsParticipant);
          return userIsParticipant;
        }
      ),
    },
    conversationUpdated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
        },
        (payload: ConversationUpdatedSubscriptionPayload, _: any, context: GraphQLContext) => {
          const { session } = context;

          console.log("HERE IS THE PAYLOAD", payload);

          if (!session?.user) {
            console.log("Not authorized");
            return false;
          }

          const { id: userId } = session.user;

          const {
            conversationUpdated: {
              conversation: { participants },
            },
          } = payload;

          // console.log(userIsParticipant);
          return userIsConversationParticipant(participants, userId);
        }
      ),
    },
    conversationDeleted: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_DELETED"]);
        },
        (payload: ConversationDeletedSubscriptionPayload, _, context: GraphQLContext) => {
          const { session } = context;

          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }

          const { id: userId } = session.user;
          const {
            conversationDeleted: { participants },
          } = payload;

          return userIsConversationParticipant(participants, userId);
        }
      ),
    },
  },
};
// }

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

// we created this to say what we want to return
export const participantPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
  user: {
    select: {
      id: true,
      username: true,
      image: true,
    },
  },
});

export const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({
  participants: {
    include: participantPopulated,
  },
  latestMessage: {
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
    },
  },
});

export default resolvers;
