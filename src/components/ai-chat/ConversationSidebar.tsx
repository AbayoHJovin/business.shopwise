import React, { memo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCurrentConversation, fetchConversation, fetchConversationsSidebar, ConversationListItem } from '@/store/slices/aiChatSlice';
import { cn } from '@/lib/utils';

interface ConversationSidebarProps {
  className?: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = memo(({ className }) => {
  const dispatch = useAppDispatch();
  const { conversations, selectedConversationId, isLoadingSidebar, isLoadingConversation } = useAppSelector(state => state.aiChat);
  
  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversationsSidebar());
  }, [dispatch]);

  const handleNewChat = useCallback(() => {
    dispatch(clearCurrentConversation());
  }, [dispatch]);
  
  const handleSelectConversation = useCallback((conversationId: string) => {
    if (selectedConversationId === conversationId) return;
    dispatch(fetchConversation(conversationId));
  }, [dispatch, selectedConversationId]);
  
  // Refresh conversations list when a new conversation is created
  useEffect(() => {
    // If we have a selected conversation ID that's not in our list, refresh the list
    if (selectedConversationId && !conversations.some(c => c.id === selectedConversationId)) {
      dispatch(fetchConversationsSidebar());
    }
  }, [selectedConversationId, conversations, dispatch]);
  
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  return (
    <div className={cn("flex flex-col h-full border-r", className)}>
      <div className="p-4 border-b">
        <Button 
          onClick={handleNewChat} 
          className="w-full" 
          disabled={isLoadingSidebar || isLoadingConversation}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoadingSidebar ? (
            // Loading skeleton
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-14 bg-muted/40 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-3",
                  selectedConversationId === conversation.id && "bg-secondary",
                  selectedConversationId === conversation.id && "border-l-4 border-primary"
                )}
                onClick={() => handleSelectConversation(conversation.id)}
                disabled={isLoadingConversation || (conversation.id && conversation.id.startsWith('temp-'))}
              >
                <div className="flex items-start gap-2 w-full overflow-hidden">
                  <MessageSquare className="h-4 w-4 shrink-0 mt-1" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">
                      {conversation.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default ConversationSidebar;
