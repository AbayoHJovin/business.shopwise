import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, Calendar } from 'lucide-react';
import { SubscriptionInfo } from '@/store/slices/authSlice';
import { getPlanDisplayName, getRemainingDaysMessage } from '@/utils/subscriptionUtils';
import { format, parseISO } from 'date-fns';

interface SubscriptionStatusProps {
  subscription?: SubscriptionInfo;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  showIcon = true,
  variant = 'default'
}) => {
  if (!subscription) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        {showIcon && <Crown className="h-3 w-3 mr-1" />}
        Free
      </Badge>
    );
  }

  // Determine badge color based on subscription plan
  const getBadgeClasses = () => {
    // Handle both property naming conventions
    const isAllowedPremium = subscription.isAllowedPremium === true || subscription.allowedPremium === true;
    
    if (!isAllowedPremium) {
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    }

    switch (subscription.plan) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'BASIC':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'WEEKLY':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'MONTHLY':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Format expiration date if available
  const getExpirationInfo = () => {
    if (!subscription.expirationDate) return null;
    
    try {
      const expiryDate = parseISO(subscription.expirationDate);
      return format(expiryDate, 'MMM d, yyyy');
    } catch (error) {
      return subscription.expirationDate;
    }
  };

  const planName = getPlanDisplayName(subscription.plan);
  const expirationInfo = getExpirationInfo();
  // Handle both property naming conventions
  const isFreeTrial = subscription.isInFreeTrial === true || subscription.inFreeTrial === true;
  const remainingDaysInfo = getRemainingDaysMessage(subscription);

  // Compact variant just shows the badge
  if (variant === 'compact') {
    return (
      <Badge variant="outline" className={getBadgeClasses()}>
        {showIcon && <Crown className="h-3 w-3 mr-1" />}
        {planName}
        {isFreeTrial && <Clock className="h-3 w-3 ml-1" />}
      </Badge>
    );
  }

  // Default variant shows more details
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={getBadgeClasses()}>
        {showIcon && <Crown className="h-3 w-3 mr-1" />}
        {planName}
      </Badge>
      
      {isFreeTrial && (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Clock className="h-3 w-3 mr-1" />
          Free Trial
        </Badge>
      )}
      
      {remainingDaysInfo && (
        <span className="text-xs text-muted-foreground flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {remainingDaysInfo}
        </span>
      )}
    </div>
  );
};

export default SubscriptionStatus;
