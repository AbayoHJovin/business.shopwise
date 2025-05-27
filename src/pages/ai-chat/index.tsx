import React, { useEffect, useRef, Suspense, lazy } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCurrentConversation, clearError, fetchConversations } from '@/store/slices/aiChatSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

// Lazy load components for better performance
const ChatMessage = lazy(() => import('@/components/ai-chat/ChatMessage'));
const ChatInput = lazy(() => import('@/components/ai-chat/ChatInput'));
const ConversationSidebar = lazy(() => import('@/components/ai-chat/ConversationSidebar'));

const AiChat = () => {
  const dispatch = useAppDispatch();
  const { currentConversation, isLoading, error } = useAppSelector(state => state.aiChat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  
  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages]);
  
  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  
  // Close sidebar on mobile when window resizes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  const handleNewChat = () => {
    dispatch(clearCurrentConversation());
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
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
            disabled={isLoading}
          >
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
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-medium">
                  {currentConversation?.title || "New Conversation"}
                </h2>
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
              {!currentConversation || currentConversation.messages.length === 0 ? (
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
                    <div ref={messagesEndRef} />
                  </Suspense>
                </>
              )}
            </div>
            
            {/* Chat Input */}
            <Suspense fallback={<div className="p-4 border-t"><Skeleton className="h-10 w-full" /></div>}>
              <ChatInput disabled={isLoading && !currentConversation} />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AiChat;
