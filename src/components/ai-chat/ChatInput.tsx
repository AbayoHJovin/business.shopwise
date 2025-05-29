import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Crown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addUserMessage, sendMessage } from '@/store/slices/aiChatSlice';
import { hasPremiumAccess } from '@/utils/subscriptionUtils';

interface ChatInputProps {
  disabled?: boolean;
  conversationId?: string;
  onPremiumRequired?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = memo(({ disabled, conversationId, onPremiumRequired }) => {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSendingMessage, currentConversation } = useAppSelector(state => state.aiChat);
  const { user } = useAppSelector(state => state.auth);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;

    // Only send conversationId if it's provided and not a temp ID
    // Important: Don't use conversationId if currentConversation is null (new chat)
    const payload = {
      message: message.trim(),
      ...(currentConversation && conversationId && !conversationId.startsWith('temp-') ? { conversationId } : {})
    };

    dispatch(sendMessage(payload));
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, dispatch, conversationId, currentConversation]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || disabled || isSendingMessage) return;
    
    // Check if user has premium access before sending message
    if (!hasPremiumAccess(user?.subscription)) {
      // If premium access is required, call the callback
      if (onPremiumRequired) {
        onPremiumRequired();
      }
      return;
    }
    
    // Add user message to the UI immediately
    dispatch(addUserMessage({ content: message.trim() }));
    
    // Clear input
    setMessage('');
    
    // Send message to API
    // Only include conversationId if we have a current conversation that's not a temp ID
    // This ensures new chats don't get attached to previously selected conversations
    const payload = currentConversation && currentConversation.conversationId && !currentConversation.conversationId.startsWith('temp-')
      ? { message: message.trim(), conversationId: currentConversation.conversationId }
      : { message: message.trim() };
    dispatch(sendMessage(payload));
  }, [message, disabled, dispatch, currentConversation]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-10 w-full resize-none bg-background px-3 py-2 focus-visible:outline-none"
          disabled={disabled || isSendingMessage}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || disabled || isSendingMessage}
          className="shrink-0 relative group"
        >
          {!currentConversation?.messages.length && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="h-2.5 w-2.5 text-white" />
            </div>
          )}
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </form>
  );
});

export default ChatInput;
