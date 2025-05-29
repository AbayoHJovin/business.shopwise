import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';
import { SubscriptionInfo } from '@/store/slices/authSlice';

/**
 * Start a free trial for the current user
 * @returns Promise with the updated subscription information
 */
export const startFreeTrial = async (): Promise<SubscriptionInfo> => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTIONS.FREE_TRIAL, {
      method: 'POST',
      ...DEFAULT_REQUEST_OPTIONS,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start free trial');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred');
  }
};

/**
 * Check if the user is eligible for a free trial
 * @returns Boolean indicating if the user is eligible
 */
export const checkFreeTrialEligibility = (subscription?: SubscriptionInfo): boolean => {
  // If no subscription exists, user is eligible
  if (!subscription) return true;
  
  // If user has already started a free trial, they're not eligible
  if (subscription.freeTrialStartedAt) return false;
  
  // If user has finished their free trial, they're not eligible
  if (subscription.finishedFreeTrial) return false;
  
  return true;
};
