import React, { useState } from 'react';
import { useReduxAuth } from '@/hooks/useReduxAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DEFAULT_REQUEST_OPTIONS } from '@/config/api';

/**
 * A simple component to test the signup functionality
 */
const SignupTest: React.FC = () => {
  const { register, isLoading, error } = useReduxAuth();
  const [result, setResult] = useState<string | null>(null);

  const handleTestSignup = async () => {
    // Test user data
    const testUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      phone: '1234567890'
    };

    try {
      const success = await register(testUser);
      if (success) {
        setResult('Signup successful! User registered.');
      } else {
        setResult('Signup failed. See error details.');
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Test Signup Functionality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Alert variant={result.includes('successful') ? 'default' : 'destructive'}>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleTestSignup} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Signup'}
        </Button>
        
        <div className="text-sm text-muted-foreground mt-4">
          <p>This will attempt to register a test user with the following details:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Name: Test User</li>
            <li>Email: testuser@example.com</li>
            <li>Password: Password123</li>
            <li>Phone: 1234567890</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupTest;
