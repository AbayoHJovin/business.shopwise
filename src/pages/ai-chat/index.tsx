import React, { useEffect, useRef, Suspense, lazy, useCallback, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MessageSquare, Plus, Bot, Crown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCurrentConversation, clearError, fetchConversationsSidebar, deleteConversation } from '@/store/slices/aiChatSlice';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { fetchCurrentSelectedBusiness } from '@/store/slices/businessSlice';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PremiumFeatureModal from '@/components/premium/PremiumFeatureModal';

// Lazy load components for better performance
const ChatMessage = lazy(() => import('@/components/ai-chat/ChatMessage'));
const ChatInput = lazy(() => import('@/components/ai-chat/ChatInput'));
const ConversationSidebar = lazy(() => import('@/components/ai-chat/ConversationSidebar'));

const AiChat = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    currentConversation, 
    isLoadingConversation,
    isSendingMessage,
    error 
  } = useAppSelector(state => state.aiChat);
  const { currentBusiness } = useAppSelector(state => state.business);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Premium feature modal state
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages]);
  
  // Handle error dismissal
  const handleDismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  // Function to get the current conversation ID for sending messages
  const getCurrentConversationId = useCallback(() => {
    if (!currentConversation) return undefined;
    // Don't send temp IDs to the backend
    return currentConversation.conversationId.startsWith('temp-') ? undefined : currentConversation.conversationId;
  }, [currentConversation]);
  
  // Close sidebar on mobile when window resizes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Handle new chat button click
  const handleNewChat = useCallback(() => {
    dispatch(clearCurrentConversation());
  }, [dispatch]);
  
  // Check for selected business when component mounts
  useEffect(() => {
    // Try to fetch the current business if not already loaded
    if (!currentBusiness) {
      dispatch(fetchCurrentSelectedBusiness())
        .unwrap()
        .catch(() => {
          // Business fetch will fail if no business is selected
        });
    }
  }, [dispatch, currentBusiness]);

  // Handle errors - redirect to business selection if no business is selected
  useEffect(() => {
    if (error) {
      // Check if the error indicates no business is selected
      if (error && (error.includes('No business selected') || error.includes('select a business'))) {
        toast({
          title: "No business selected",
          description: "Please select a business to use AI Chat",
          variant: "destructive"
        });
        // Redirect to business selection page
        navigate('/business/select');
      }
    }
  }, [error, navigate, toast]);

  // Effect to refresh conversations when a new conversation is created
  useEffect(() => {
    if (currentConversation?.conversationId && 
        !currentConversation.conversationId.startsWith('temp-') && 
        currentConversation.messages.length > 0) {
      // If we have a valid conversation ID and it's not a temp ID, refresh the sidebar
      dispatch(fetchConversationsSidebar());
    }
  }, [currentConversation?.conversationId, dispatch]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle deleting the current conversation
  const handleDeleteCurrentConversation = useCallback(async () => {
    if (!currentConversation?.conversationId || currentConversation.conversationId.startsWith('temp-')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await dispatch(deleteConversation(currentConversation.conversationId)).unwrap();
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted."
      });
      
      // The conversation list will be refreshed by the thunk
      // and currentConversation will be cleared
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete conversation",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [currentConversation, dispatch, toast]);
  
  return (
    <MainLayout title="AI Assistant">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">AI Assistant</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNewChat}
            disabled={isLoadingConversation || isSendingMessage}
            className="relative group"
          >
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="h-2.5 w-2.5 text-white" />
            </div>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden shadow-sm">
          {/* Conversation Sidebar */}
          <Suspense fallback={<div className="w-80 border-r p-4"><Skeleton className="h-full w-full" /></div>}>
            <ConversationSidebar 
              className={cn(
                "w-80 transition-all duration-300 ease-in-out",
                isMobile && "absolute z-20 bg-background h-[calc(100vh-200px)]",
                !sidebarOpen && "hidden md:flex md:w-80"
              )} 
            />
          </Suspense>
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="font-medium">
                    {currentConversation?.title || "New Conversation"}
                  </h2>
                </div>
                
                {/* Delete button - only show if we have a valid conversation */}
                {currentConversation && !currentConversation.conversationId.startsWith('temp-') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isLoadingConversation || isSendingMessage || isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingConversation ? (
                <div className="flex flex-col space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted/60 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-24 bg-muted/60 animate-pulse rounded" />
                        <div className="h-16 bg-muted/60 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !currentConversation || currentConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Start a new conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-2">
                    Ask questions about your business data, get insights, or request help with specific tasks.
                  </p>
                </div>
              ) : (
                <>
                  <Suspense fallback={<div className="p-4"><Skeleton className="h-16 w-full" /></div>}>
                    {currentConversation.messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {isSendingMessage && (
                      <div className="flex w-full gap-3 p-4 bg-muted/30">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">AI Assistant</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }}></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }}></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </Suspense>
                </>
              )}
            </div>
            
            {/* Chat Input */}
            <Suspense fallback={<div className="p-4 border-t"><Skeleton className="h-10 w-full" /></div>}>
              <ChatInput 
                disabled={(isLoadingConversation || isSendingMessage) && !currentConversation} 
                conversationId={currentConversation?.conversationId}
                onPremiumRequired={() => setIsPremiumModalOpen(true)}
              />
            </Suspense>
          </div>
        </div>
      </div>
      
      {/* Premium Feature Modal */}
      <PremiumFeatureModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        featureName="AI Chat"
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteCurrentConversation}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
      />
    </MainLayout>
  );
};

export default AiChat;
