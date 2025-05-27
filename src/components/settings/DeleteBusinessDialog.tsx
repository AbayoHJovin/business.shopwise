import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteBusinessDialogProps {
  businessName: string;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (password: string, confirmationText: string) => void;
}

const DeleteBusinessDialog: React.FC<DeleteBusinessDialogProps> = ({
  businessName,
  isOpen,
  isLoading,
  error,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<'warning' | 'confirmation' | 'password'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = () => {
    if (step === 'warning') {
      setStep('confirmation');
    } else if (step === 'confirmation') {
      if (confirmationText === `DELETE ${businessName}`) {
        setStep('password');
      }
    } else if (step === 'password') {
      onConfirm(password, confirmationText);
    }
  };

  const handleClose = () => {
    setStep('warning');
    setConfirmationText('');
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'warning' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Business</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your business? This action cannot be undone.
                All data associated with this business will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button variant="destructive" onClick={handleNext}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Please type <span className="font-mono text-destructive">DELETE {businessName}</span> to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="confirmationText">Confirmation Text</Label>
              <Input
                id="confirmationText"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`DELETE ${businessName}`}
                className="mt-2"
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleNext}
                disabled={confirmationText !== `DELETE ${businessName}`}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'password' && (
          <>
            <DialogHeader>
              <DialogTitle>Verify Password</DialogTitle>
              <DialogDescription>
                Please enter your password to confirm the deletion of {businessName}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleNext}
                disabled={!password || isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Business'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBusinessDialog;
