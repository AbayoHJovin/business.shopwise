import { SubscriptionInfo, SubscriptionPlan } from '@/store/slices/authSlice';

/**
 * Checks if the user has access to premium features based on their subscription
 * @param subscription The user's subscription object
 * @returns boolean indicating if the user has premium access
 */
export const hasPremiumAccess = (subscription?: SubscriptionInfo): boolean => {
  // If no subscription exists, user doesn't have premium access
  if (!subscription) return false;
  
  // The backend already calculated if the user is allowed premium access
  // Handle both property naming conventions (isAllowedPremium and allowedPremium)
  return subscription.isAllowedPremium === true || subscription.allowedPremium === true;
};

/**
 * Gets the appropriate plan name for display
 * @param plan The subscription plan
 * @returns A formatted plan name for display
 */
export const getPlanDisplayName = (plan?: SubscriptionPlan): string => {
  if (!plan) return 'Free';
  
  switch (plan) {
    case 'FREE':
      return 'Free';
    case 'BASIC':
      return 'Basic';
    case 'WEEKLY':
    case 'PRO_WEEKLY':
      return 'Weekly Premium';
    case 'MONTHLY':
    case 'PRO_MONTHLY':
      return 'Monthly Premium';
    default:
      return 'Unknown';
  }
};

/**
 * Gets the remaining days message for display
 * @param subscription The subscription info
 * @returns A formatted message about remaining days
 */
export const getRemainingDaysMessage = (subscription?: SubscriptionInfo): string => {
  if (!subscription) return '';
  
  // Handle both property naming conventions (isInFreeTrial and inFreeTrial)
  const isInFreeTrial = subscription.isInFreeTrial === true || subscription.inFreeTrial === true;
  
  if (isInFreeTrial) {
    return `${subscription.remainingDays} days left in free trial`;
  }
  
  if (subscription.remainingDays > 0) {
    return `${subscription.remainingDays} days remaining`;
  }
  
  return 'Expired';
};
