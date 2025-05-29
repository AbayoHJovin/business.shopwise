import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  ArrowLeft, 
  Check, 
  X, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { SubscriptionType } from '@/components/landing/SubscriptionPlansSection';
import { checkFreeTrialEligibility } from '@/services/subscriptionService';
import { updateSubscription } from '@/store/slices/authSlice';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PaymentDetails {
  type: SubscriptionType;
  price: string;
  name: string;
}

const paymentDetails: Record<SubscriptionType, PaymentDetails> = {
  basic: {
    type: 'basic',
    price: 'Free',
    name: 'Basic Plan'
  },
  weekly: {
    type: 'weekly',
    price: '2,500 RWF',
    name: 'Weekly Premium'
  },
  monthly: {
    type: 'monthly',
    price: '9,000 RWF',
    name: 'Monthly Premium'
  }
};

const ManualPaymentPage: React.FC = () => {
  const { planType } = useParams<{ planType: SubscriptionType }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAppSelector(state => state.auth);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isStartingFreeTrial, setIsStartingFreeTrial] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    comment: '',
    image: null as File | null
  });
  
  useEffect(() => {
    // Check if plan type is valid
    if (planType && !['weekly', 'monthly'].includes(planType)) {
      toast({
        title: "Invalid Plan",
        description: "The selected subscription plan is invalid.",
        variant: "destructive"
      });
      navigate('/');
    }
    
    // Pre-fill amount based on plan type
    if (planType && planType === 'weekly') {
      setFormData(prev => ({ ...prev, amount: '2500' }));
    } else if (planType && planType === 'monthly') {
      setFormData(prev => ({ ...prev, amount: '9000' }));
    }
    
    // Pre-fill name if user is logged in
    if (user && user.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [planType, user, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image: null }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Validate form data
      if (!formData.amount.trim()) {
        throw new Error('Payment amount is required');
      }
      
      if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        throw new Error('Please enter a valid payment amount');
      }
      
      if (!formData.name.trim()) {
        throw new Error('Your name is required');
      }
      
      if (!formData.image) {
        throw new Error('Please upload a screenshot of your payment');
      }
      
      // TODO: Implement actual API call to submit payment
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted successfully and is pending approval.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      setFormError(error.message || 'Failed to submit payment. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to submit payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get current plan details
  const currentPlan = planType ? paymentDetails[planType] : paymentDetails.monthly;
  
  // Check if the user is eligible for a free trial
  const isEligibleForFreeTrial = checkFreeTrialEligibility(user?.subscription);
  
  // Handle starting a free trial
  const handleStartFreeTrial = async () => {
    try {
      setIsStartingFreeTrial(true);
      
      // Dispatch the action to start a free trial
      await dispatch(updateSubscription()).unwrap();
      
      // Show success toast
      toast({
        title: "Free Trial Started",
        description: "Your free trial has been activated successfully!",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start free trial",
        variant: "destructive"
      });
    } finally {
      setIsStartingFreeTrial(false);
    }
  };
  
  return (
    <MainLayout title="Manual Payment">
      <div className="page-container p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0 flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="p-0 h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manual Payment</h1>
              <p className="text-muted-foreground">
                Complete your payment for {currentPlan.name}
              </p>
            </div>
          </div>
        </div>
        
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Please provide your payment information for the {currentPlan.name} subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (RWF)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      The amount should match your selected plan: {currentPlan.price}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter the name used for payment"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the name registered with your mobile money account or SIM card
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Payment Screenshot</Label>
                    <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isSubmitting}
                        required
                      />
                      <label htmlFor="image" className="cursor-pointer block">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img 
                              src={imagePreview} 
                              alt="Payment screenshot" 
                              className="max-h-48 mx-auto object-contain rounded-md"
                            />
                            <p className="text-sm text-primary font-medium">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                            <p className="text-sm font-medium">Click to upload a screenshot of your payment</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment (Optional)</Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      placeholder="Any additional information about your payment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Payment...
                      </>
                    ) : (
                      'Submit Payment'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Payment Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to complete your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Subscription Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{currentPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{currentPlan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {planType === 'weekly' ? '1 Week' : '1 Month'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Free Trial Button */}
                  {isEligibleForFreeTrial && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                        Try Before You Buy
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Not ready to commit? Start with a free trial to explore all premium features.
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 hover:text-white"
                        onClick={handleStartFreeTrial}
                        disabled={isStartingFreeTrial || authLoading}
                      >
                        {isStartingFreeTrial ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting Free Trial...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Start Free Trial
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base font-medium">
                      How to make a payment
                    </AccordionTrigger>
                    <AccordionContent className="text-sm space-y-3">
                      <p>Follow these steps to make your payment:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Open your mobile money app or dial the USSD code</li>
                        <li>Select "Send Money" or "Pay" option</li>
                        <li>Enter the phone number: <span className="font-medium">078 123 4567</span></li>
                        <li>Enter the amount: <span className="font-medium">{currentPlan.price}</span></li>
                        <li>Confirm the payment</li>
                        <li>Take a screenshot of the confirmation</li>
                        <li>Upload the screenshot in the form</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base font-medium">
                      Payment approval process
                    </AccordionTrigger>
                    <AccordionContent className="text-sm space-y-3">
                      <p>After submitting your payment:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Pending Review</span>
                            <p className="text-muted-foreground">Your payment will be reviewed by our team</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Approval</span>
                            <p className="text-muted-foreground">Once verified, your subscription will be activated</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Rejection</span>
                            <p className="text-muted-foreground">If there's an issue, we'll contact you for resolution</p>
                          </div>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-base font-medium">
                      Need help?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm space-y-3">
                      <p>If you're having trouble with your payment, please contact our support team:</p>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Email:</span> support@shopwise.com
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> +250 78 123 4567
                        </p>
                        <p>
                          <span className="font-medium">Hours:</span> Monday to Friday, 9AM - 5PM
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManualPaymentPage;
