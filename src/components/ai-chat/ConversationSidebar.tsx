import React, { memo, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCurrentConversation, fetchConversation, fetchConversationsSidebar, deleteConversation, ConversationListItem } from '@/store/slices/aiChatSlice';
import { cn } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';

interface ConversationSidebarProps {
  className?: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = memo(({ className }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { conversations, selectedConversationId, isLoadingSidebar, isLoadingConversation } = useAppSelector(state => state.aiChat);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  
  // Handle opening the delete confirmation dialog
  const handleDeleteClick = useCallback((e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Prevent conversation selection when clicking delete
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  }, []);
  
  // Handle confirming conversation deletion
  const handleConfirmDelete = useCallback(async () => {
    if (!conversationToDelete) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteConversation(conversationToDelete)).unwrap();
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete conversation",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  }, [conversationToDelete, dispatch, toast]);
  
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
              <div key={conversation.id} className="relative group">
                <Button
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
                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={(e) => handleDeleteClick(e, conversation.id)}
                  disabled={isLoadingConversation || isLoadingSidebar}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
});

export default ConversationSidebar;
