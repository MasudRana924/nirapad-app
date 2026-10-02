/**
 * React Query Mutations
 * Custom mutation hooks for data mutations
 */

import {useCallback} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {accountService, familyService, bookingService, authService, inboxService, paymentService, notificationPreferenceService} from './services';
import {queryKeys} from './queryKeys';
import {useAuth} from '../context/AuthContext';

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

export const useMarkAllInboxRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => inboxService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.inbox.all});
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => inboxService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.inbox.all});
    },
  });
};

const invalidateBooking = (queryClient, id) => {
  queryClient.invalidateQueries({queryKey: queryKeys.bookings.all});
  if (id) {
    queryClient.invalidateQueries({queryKey: queryKeys.bookings.detail(id)});
  }
};

export const useAcceptNextCaregiver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => bookingService.acceptNextCaregiver(id),
    onSuccess: (_data, id) => invalidateBooking(queryClient, id),
  });
};

export const useDeclineNextCaregiver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => bookingService.declineNextCaregiver(id),
    onSuccess: (_data, id) => invalidateBooking(queryClient, id),
  });
};

/**
 * Auth Mutations
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({email, phone, password}) =>
      authService.login({email, phone, password}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.auth.all});
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({name, email, phone, password}) =>
      authService.register({name, email, phone, password}),
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
 * Refetch GET /user/me (never served from cache), store it as the global
 * user and refresh other profile queries (home header etc.).
 */
export const useRefreshMyAccount = () => {
  const queryClient = useQueryClient();
  const {updateUser} = useAuth();

  return useCallback(async () => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.userProfile.me(),
      queryFn: () => accountService.getMe(),
      staleTime: 0,
    });
    if (response?.data) {
      await updateUser(response.data);
    }
    queryClient.invalidateQueries({queryKey: queryKeys.userProfile.current()});
    return response?.data;
  }, [queryClient, updateUser]);
};

export const useUpdateMyPhoto = () =>
  useMutation({
    mutationFn: formData => accountService.updateMyPhoto(formData),
  });

export const useUpdateMyAccount = () =>
  useMutation({
    mutationFn: fields => accountService.updateMe(fields),
  });

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
  useMarkAllInboxRead,
  useDeleteNotification,
  useAcceptNextCaregiver,
  useDeclineNextCaregiver,

  // Auth
  useLogin,
  useRegister,
  useUpdateProfile,
  useUpdateMyPhoto,
  useUpdateMyAccount,
};
