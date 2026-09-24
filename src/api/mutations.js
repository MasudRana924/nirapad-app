/**
 * React Query Mutations
 * Custom mutation hooks for data mutations
 */

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {familyService, bookingService, authService, inboxService, paymentService, notificationPreferenceService, conversationService, messageService} from './services';
import {queryKeys} from './queryKeys';

/**
 * Family Members Mutations
 */
export const useAddFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => familyService.addFamilyMember(formData),
    onSuccess: () => {
      // Invalidate and refetch family members list
      queryClient.invalidateQueries({queryKey: queryKeys.familyMembers.lists()});
    },
  });
};

export const useUpdateFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, formData}) => familyService.updateFamilyMember(id, formData),
    onSuccess: (data, variables) => {
      // Invalidate family members list and specific detail
      queryClient.invalidateQueries({queryKey: queryKeys.familyMembers.lists()});
      queryClient.invalidateQueries({
        queryKey: queryKeys.familyMembers.detail(variables.id),
      });
    },
  });
};

export const useDeleteFamilyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => familyService.deleteFamilyMember(id),
    onSuccess: () => {
      // Invalidate family members list
      queryClient.invalidateQueries({queryKey: queryKeys.familyMembers.lists()});
    },
  });
};

/**
 * Caregivers Mutations
 */
export const useBookCaregiver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData) => bookingService.createBooking(bookingData),
    onSuccess: () => {
      // Invalidate bookings list
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
    },
  });
};

/**
 * Bookings Mutations
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData) => bookingService.createBooking(bookingData),
    onSuccess: () => {
      // Invalidate bookings list
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, bookingData}) => bookingService.updateBooking(id, bookingData),
    onSuccess: (data, variables) => {
      // Invalidate bookings list and specific detail
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(variables.id),
      });
    },
  });
};

export const useSubmitBookingReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, rating, comment}) =>
      bookingService.submitReview(id, {rating, comment}),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(variables.id),
        });
      }
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: variables => {
      const id = typeof variables === 'object' ? variables.id : variables;
      const reason =
        typeof variables === 'object' ? variables.reason : 'Plans changed';
      return bookingService.cancelBooking(id, reason);
    },
    onSuccess: (data, variables) => {
      const id = typeof variables === 'object' ? variables.id : variables;
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(id),
      });
    },
  });
};

export const useCreateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, reason, details}) =>
      bookingService.createDispute(id, {reason, details}),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.disputes(variables.id),
        });
      }
    },
  });
};

export const useCreateBkashPayment = () => {
  return useMutation({
    mutationFn: variables => {
      const bookingId =
        typeof variables === 'object' ? variables.bookingId : variables;
      const idempotencyKey =
        typeof variables === 'object' ? variables.idempotencyKey : undefined;
      return paymentService.createBkashPayment(bookingId, {idempotencyKey});
    },
  });
};

export const useQueryBkashPayment = () => {
  return useMutation({
    mutationFn: paymentID => paymentService.queryBkashPayment(paymentID),
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload =>
      notificationPreferenceService.updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notificationPreferences.all,
      });
    },
  });
};

export const useExecuteBkashPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({paymentID, bookingId}) =>
      paymentService.executeBkashPayment(paymentID, bookingId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
      if (variables?.bookingId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(variables.bookingId),
        });
      }
    },
  });
};

export const useMarkInboxRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => inboxService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.inbox.all});
    },
  });
};

/**
 * Auth Mutations
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({email, password}) => authService.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.auth.all});
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({name, email, password}) =>
      authService.register(name, email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.auth.all});
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => authService.updateUserProfile(formData),
    onSuccess: () => {
      // Invalidate user profile query
      queryClient.invalidateQueries({queryKey: queryKeys.userProfile.current()});
    },
  });
};

/**
 * Conversations Mutations
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({subject, message}) =>
      conversationService.createConversation({subject, message}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.conversations.all});
    },
  });
};

/**
 * Messages Mutations
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({conversation_id, message, message_type = 'text'}) =>
      messageService.sendMessage({conversation_id, message, message_type}),
    onSuccess: (data, variables) => {
      // Invalidate messages list for this conversation
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(variables.conversation_id),
      });
      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({queryKey: queryKeys.conversations.all});
    },
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationId => messageService.markAsRead(conversationId),
    onSuccess: (data, variables) => {
      // Invalidate messages list for this conversation
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(variables),
      });
      // Invalidate conversations list to update unread status
      queryClient.invalidateQueries({queryKey: queryKeys.conversations.all});
      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.unreadCount(),
      });
    },
  });
};

export default {
  // Family members
  useAddFamilyMember,
  useUpdateFamilyMember,
  useDeleteFamilyMember,

  // Caregivers
  useBookCaregiver,

  // Bookings
  useCreateBooking,
  useUpdateBooking,
  useCancelBooking,
  useSubmitBookingReview,
  useCreateDispute,
  useCreateBkashPayment,
  useQueryBkashPayment,
  useExecuteBkashPayment,
  useUpdateNotificationPreferences,
  useMarkInboxRead,

  // Auth
  useLogin,
  useRegister,
  useUpdateProfile,

  // Conversations
  useCreateConversation,

  // Messages
  useSendMessage,
  useMarkMessagesAsRead,
};
