import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const PremiumFeatureModal: React.FC<PremiumFeatureModalProps> = ({
  isOpen,
  onClose,
  featureName
}) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    onClose();
    // Navigate to the subscription plans section of the landing page
    navigate('/#plans');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
            <Crown className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center text-xl">Premium Feature</DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-medium">{featureName}</span> is a premium feature available to subscribers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium flex items-center mb-2">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Premium Benefits
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>AI-powered business insights and analytics</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Advanced expense tracking and reporting</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Business listing in shop directory</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Priority support and more features</span>
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Upgrade to a premium plan to unlock all features and take your business to the next level.
          </p>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button 
            onClick={handleSubscribe}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
          >
            <Crown className="mr-2 h-4 w-4" />
            Start Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeatureModal;
