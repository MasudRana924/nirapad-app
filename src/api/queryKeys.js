/**
 * React Query Keys
 * Centralized query key factory for cache management
 */

export const queryKeys = {
  // Auth keys
  auth: {
    all: ['auth'],
    user: () => ['auth', 'user'],
  },

  // User profile keys
  userProfile: {
    all: ['userProfile'],
    current: () => ['userProfile', 'current'],
  },

  // Family members keys
  familyMembers: {
    all: ['familyMembers'],
    lists: () => ['familyMembers', 'list'],
    list: (filters) => ['familyMembers', 'list', filters],
    details: () => ['familyMembers', 'detail'],
    detail: (id) => ['familyMembers', 'detail', id],
  },

  // Caregivers keys
  caregivers: {
    all: ['caregivers'],
    lists: () => ['caregivers', 'list'],
    list: (filters) => ['caregivers', 'list', filters],
    details: () => ['caregivers', 'detail'],
    detail: (id) => ['caregivers', 'detail', id],
  },

  // Bookings keys
  bookings: {
    all: ['bookings'],
    lists: () => ['bookings', 'list'],
    list: (filters) => ['bookings', 'list', filters],
    details: () => ['bookings', 'detail'],
    detail: (id) => ['bookings', 'detail', id],
  },

  // Hospitals keys
  hospitals: {
    all: ['hospitals'],
    lists: () => ['hospitals', 'list'],
    list: (filters) => ['hospitals', 'list', filters],
    details: () => ['hospitals', 'detail'],
    detail: (id) => ['hospitals', 'detail', id],
  },
};

export default queryKeys;
