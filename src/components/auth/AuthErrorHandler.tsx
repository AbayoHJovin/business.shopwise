mport React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCcw, LogIn } from 'lucide-react';
import { ErrorType, ApiError } from '@/utils/apiClient';

interface AuthErrorHandlerProps {
  error: ApiError | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Component for displaying user-friendly authentication error messages
 * Handles different types of errors with appropriate UI and actions
 */
const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ 
  error, 
  onRetry,
  className = ''
}) => {
  const navigate = useNavigate();

  // If no error, don't render anything
  if (!error) return null;

  // Handle different error types with appropriate UI and actions
  const renderErrorContent = () => {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return (
          <Alert variant="destructive" className={`mb-4 ${className}`}>
            <AlertTitle>Session Expired</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p>Your session has expired. Please sign in again to continue.</p>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
      
      case ErrorType.NETWORK:
        return (
          <Alert variant="destructive" className={`mb-4 ${className}`}>
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p>{error.message}</p>
              {onRetry && (
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRetry}
                    className="flex items-center gap-1"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Retry
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      
      case ErrorType.SERVER:
        return (
          <Alert variant="destructive" className={`mb-4 ${className}`}>
            <AlertTitle>Server Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p>{error.message}</p>
              {onRetry && (
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRetry}
                    className="flex items-center gap-1"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Retry
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      
      default:
        // For validation and other errors, just show the message
        return (
          <Alert variant="destructive" className={`mb-4 ${className}`}>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        );
    }
  };

  return renderErrorContent();
};

export default AuthErrorHandler;
