/**
 * React Query Queries
 * Custom query hooks for data fetching
 */

import {useQuery} from '@tanstack/react-query';
import {familyService, caregiverService, bookingService, hospitalService, authService, inboxService, notificationService, notificationPreferenceService, privacyPolicyService} from './services';
import {queryKeys} from './queryKeys';

/**
 * User Profile Queries
 */
export const useUserProfile = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.userProfile.current(),
    queryFn: () => authService.getUserProfile(),
    ...options,
  });
};

/**
 * Family Members Queries
 */
export const useFamilyMembers = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.familyMembers.lists(),
    queryFn: () => familyService.getFamilyMembers(),
    ...options,
  });
};

export const useFamilyMember = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.familyMembers.detail(id),
    queryFn: () => familyService.getFamilyMember(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Caregivers Queries
 */
export const useCaregivers = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.caregivers.lists(),
    queryFn: () => caregiverService.getCaregivers(),
    ...options,
  });
};

export const useSearchCaregivers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.caregivers.search(params),
    queryFn: () => caregiverService.searchCaregivers(params),
    ...options,
  });
};

export const useCaregiver = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.caregivers.detail(id),
    queryFn: () => caregiverService.getCaregiverDetails(id),
    enabled: !!id,
    ...options,
  });
};

export const useCaregiverAvailability = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.caregivers.availability(id),
    queryFn: () => caregiverService.getAvailability(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Bookings Queries
 */
export const useBookings = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.bookings.lists(),
    queryFn: () => bookingService.getBookings(params),
    ...options,
  });
};

export const useBookingDetails = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingService.getBookingDetails(id),
    enabled: !!id,
    ...options,
  });
};

export const useBookingDisputes = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.bookings.disputes(id),
    queryFn: () => bookingService.getDisputes(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Inbox Queries
 */
export const useInbox = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.inbox.list(params),
    queryFn: () => inboxService.getInbox(params),
    ...options,
  });
};

export const useInboxItem = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.inbox.detail(id),
    queryFn: () => inboxService.getInboxItem(id),
    enabled: !!id,
    ...options,
  });
};

const unreadFromPayload = payload => {
  if (typeof payload?.meta?.unread === 'number') {
    return payload.meta.unread;
  }
  if (typeof payload?.data === 'number') {
    return payload.data;
  }
  return payload?.data?.unread ?? payload?.data?.count ?? 0;
};

export const useInboxUnreadCount = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.inbox.unreadCount(),
    queryFn: () => inboxService.getUnreadCount(),
    select: unreadFromPayload,
    ...options,
  });
};

export const useNotificationPreferences = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.notificationPreferences.current(),
    queryFn: () => notificationPreferenceService.getPreferences(),
    ...options,
  });
};

/** @deprecated Use useInbox */
export const useNotifications = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.inbox.list(params),
    queryFn: () => notificationService.getNotifications(params),
    ...options,
  });
};

/**
 * Hospitals Queries
 */
export const useHospitals = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.hospitals.lists(),
    queryFn: () => hospitalService.getHospitals(),
    ...options,
  });
};

export const useSearchHospitals = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.hospitals.search(params),
    queryFn: () => hospitalService.searchHospitals(params),
    ...options,
  });
};


export const useHospital = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.hospitals.detail(id),
    queryFn: () => hospitalService.getHospitalDetails(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Privacy Policy (public)
 */
export const usePrivacyPolicy = (audience = 'USER', options = {}) => {
  return useQuery({
    queryKey: queryKeys.privacyPolicies.byAudience(audience),
    queryFn: () => privacyPolicyService.getByAudience(audience),
    ...options,
  });
};

export default {
  // Family members
  useFamilyMembers,
  useFamilyMember,

  // Caregivers
  useCaregivers,
  useCaregiver,
  useCaregiverAvailability,

  // Bookings
  useBookings,
  useBookingDetails,
  useBookingDisputes,

  // Hospitals
  useHospitals,
  useHospital,
};
