import { Prisma } from "@prisma/client";
import { ConversationPopulated, GraphQlContext } from "../../util/types";
import { ApolloError } from "apollo-server-core";
import { withFilter } from "graphql-subscriptions";
import { GraphQLError } from "graphql";
import { userIsConversationParticipant } from "../../util/functions";

const resolvers = {
  Query: {
    conversations: async (_: any, __: any, context: GraphQlContext): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new ApolloError("NOT AUTHORIZED");
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
        return conversations;
        // return conversations.filter((conversation) => !!conversation.participants.find((p) => p.userId === userId));
      } catch (error: any) {
        console.log("CONVERSATIONS ERROR", error);
        throw new ApolloError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (_: any, args: { participantIds: Array<string> }, context: GraphQlContext): Promise<{ conversationId: string }> => {
      const { session, prisma, pubsub } = context;
      const { participantIds } = args;

      // console.log("PARTICIPANT IDS", participantIds);

      if (!session?.user) {
        throw new ApolloError("NOT AUTHORIZED");
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
      } catch (error) {
        console.log("CREATE CONVERSATION ERROR", error);
        throw new ApolloError("ERROR CREATING CONVERSATION");
      }
    },
  },

  Subscription: {
    conversationCreated: {
      // now since the conversationCreated subscription is listening to the event, then this function will be called every time the conversation is created

      // basic subscription without using withFilter
      // subscribe: (_: any, __: any, context: GraphQlContext) => {
      //   const { pubsub } = context;
      //   return pubsub.asyncIterator(["CONVERSATION_CREATED"]); // we are listening to the "CONVERSATION_CREATED" event
      // },

      /**
       * If the sign in user is the part of the conversation we are going to return tre and then we are submitting the event. Else will will not fire the event. This is all done using withFilter function
       */
      // subscribe: withFilter(
      //   (_: any, __: any, context: GraphQlContext) => {
      //     const { pubsub } = context;

      //     return pubsub.asyncIterator(["CONVERSATION_CREATED"]); // we are listening to the "CONVERSATION_CREATED" event
      //   },
      //   (payload: ConversationCreatedSubscriptionPayload, _, context: GraphQlContext )=> {
      //     const { session } = context;
      //     const { conversationCreated: { participants} } = payload;
      //     const userIsParticipant = participants.find((p: { userId: string }) => p.userId === session?.user?.id);
      //     return userIsParticipant;
      //   }
      // ),

      subscribe: withFilter(
        (_: any, __: any, context: GraphQlContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (payload: ConversationCreatedSubscriptionPayload, _, context: GraphQlContext) => {
          const { session } = context;

          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }

          const {
            conversationCreated: { participants },
          } = payload;

          const userIsParticipant = userIsConversationParticipant(participants, session.user.id);
          return userIsParticipant;
        }
      ),
    },
  },
};

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

export const participantPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
  user: {
    select: {
      id: true,
      username: true,
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
        },
      },
    },
  },
});

export default resolvers;
