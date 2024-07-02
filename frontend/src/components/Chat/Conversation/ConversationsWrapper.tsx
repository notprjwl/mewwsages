import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { Box } from "@chakra-ui/react";
import ConversationOperations from "../../../graphql/operations/conversation";
import {
  ConversationDeletedData,
  ConversationsData,
  ConversationUpdatedData,
} from "@/src/util/types";
import { ParticipantPopulated } from "../../../../../backend/src/util/types";
import { ConversationCreatedSubscriptionData } from "../../../util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "../../common/SkeletonLoader";


interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({ session }) => {
  const router = useRouter();
  const { conversationId } = router.query;
  const { id: userId } = session.user;

  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  const [markConversationAsRead] = useMutation<
    { markConversationAsRead: boolean },
    { userId: string; conversationId: string }
  >(ConversationOperations.Mutations.markConversationAsRead);

  useSubscription<ConversationUpdatedData>(
    ConversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        // console.log("ON DATA FIRING", subscriptionData);

        if (!subscriptionData) return;

        const {
          conversationUpdated: { conversation: updatedConversation },
        } = subscriptionData;
        const { id: updatedConversationId, latestMessage } = updatedConversation;

        if (updatedConversationId === conversationId) {
          onViewConversation(conversationId, false);
          return;
        }
      },
    }
  );

  useSubscription<ConversationDeletedData>(
    ConversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const existing = client.readQuery<ConversationsData>({
          query: ConversationOperations.Queries.conversations,
        });

        if (!existing) return;

        const { conversations } = existing;
        const {
          conversationDeleted: { id: deleteConversationId },
        } = subscriptionData;

        // Use setTimeout to delay router push
        setTimeout(() => {
          client.writeQuery<ConversationsData>({
            query: ConversationOperations.Queries.conversations,
            data: {
              conversations: conversations.filter(
                (conversation) => conversation.id !== deleteConversationId
              ),
            },
          });

          if (router.isReady && conversationId === deleteConversationId) {
            router.push("/");
          }
        }, 1000); 
      },
    }
  );

  // const onViewConversation = async (
  //   conversationId: string,
  //   hasSeenLatestMessage: boolean | undefined
  // ) => {
  //   /**
  //    * 1. Push the ConversationID to the router query params
  //    */
  //   router.push({ query: { conversationId } });

  //   /**
  //    * 2. Mark the Conversation as read
  //    */

  //   if (hasSeenLatestMessage) return;

  //   /**
  //    *  markConversationAsRead mutation
  //    */

  //   try {
  //     await markConversationAsRead({
  //       variables: {
  //         userId,
  //         conversationId,
  //       },
  //       optimisticResponse: {
  //         markConversationAsRead: true,
  //       },
  //       update: (cache) => {
  //         /**
  //          * Get conversation participants from cache
  //          */

  //         const participantFragment = cache.readFragment<{
  //           participants: Array<ParticipantPopulated>;
  //         }>({
  //           id: `Conversation:${conversationId}`,
  //           fragment: gql`
  //             fragment Participants on Conversation {
  //               participants {
  //                 user {
  //                   id
  //                   username
  //                 }
  //                 hasSeenLatestMessage
  //               }
  //             }
  //           `,
  //         });

  //         if (!participantFragment) return;

  //         const participants = [...participantFragment.participants];

  //         const userParticipantIndex = participants.findIndex((p) => p.user.id === userId);

  //         if (userParticipantIndex === -1) return;

  //         const userParticipant = participants[userParticipantIndex];

  //         /**
  //          * update participant to show latest message as read
  //          */

  //         participants[userParticipantIndex] = {
  //           ...userParticipant,
  //           hasSeenLatestMessage: true,
  //         };

  //         /**
  //          * update cache
  //          */

  //         cache.writeFragment({
  //           id: `Conversation:${conversationId}`,
  //           fragment: gql`
  //             fragment UpdatedParticipant on Conversation {
  //               participants
  //             }
  //           `,
  //           data: {
  //             participants,
  //           },
  //         });
  //       },
  //     });
  //   } catch (error: any) {
  //     console.log("onViewConversation error ", error);
  //     toast.error(error?.message);
  //   }
  // };

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) => {
    router.push({ query: { conversationId } });

    /**
     * Only mark as read if conversation is unread
     */
    if (hasSeenLatestMessage) return;

    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
        },
        update: (cache) => {
          /**
           * Get conversation participants
           * from cache
           */
          const participantsFragment = cache.readFragment<{
            participants: Array<ParticipantPopulated>;
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                    image
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          });

          if (!participantsFragment) return;

          /**
           * Create copy to
           * allow mutation
           */
          const participants = [...participantsFragment.participants];

          const userParticipantIdx = participants.findIndex((p) => p.user.id === userId);

          /**
           * Should always be found
           * but just in case
           */
          if (userParticipantIdx === -1) return;

          const userParticipant = participants[userParticipantIdx];

          /**
           * Update user to show latest
           * message as read
           */
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };

          /**
           * Update cache
           */
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipants on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          });
        },
      });
    } catch (error) {
      console.log("onViewConversation error", error);
    }
  };

  // subscribe to new conversations. refer docs: https://www.apollographql.com/docs/react/data/subscriptions
  const subscribeToNewConversation = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (prev, { subscriptionData }: ConversationCreatedSubscriptionData) => {
        if (!subscriptionData.data) return prev;

        // console.log("SUBSCRIPTION DATA", subscriptionData);

        const newConversation = subscriptionData.data.conversationCreated;

        // console.log("SUBSCRIPTION FIRED", newConversation);
        const exists = prev.conversations.find(
          (conversation) => conversation.id === newConversation.id
        );
        if (exists) return prev;

        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };

  /**
   * EXECUTE SUBSCRIPTION ON MOUNT
   */
  useEffect(() => {
    console.log("subscribe on mount");
    subscribeToNewConversation();
  }, []);

  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      bg='whiteAlpha.50'
      py={5}
      px={3}
      flexDirection='column'
      gap={3}
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}>
      {conversationsLoading ? (
        <SkeletonLoader count={7} height='65px' />
      ) : (
        <ConversationList
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </Box>
  );
};

export default ConversationsWrapper;
