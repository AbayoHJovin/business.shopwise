import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addUserMessage, sendMessage } from '@/store/slices/aiChatSlice';

interface ChatInputProps {
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = memo(({ disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useAppDispatch();
  const { isLoading, currentConversation } = useAppSelector(state => state.aiChat);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isLoading) return;
    
    // Add user message to the UI immediately
    dispatch(addUserMessage({ content: message.trim() }));
    
    // Clear input
    setMessage('');
    
    // Send message to API
    dispatch(sendMessage({ 
      message: message.trim(),
      conversationId: currentConversation?.id?.startsWith('temp-') ? undefined : currentConversation?.id
    }));
  }, [message, disabled, isLoading, dispatch, currentConversation]);
  
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
          className="min-h-[40px] max-h-[150px] resize-none"
          disabled={disabled || isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || disabled || isLoading}
          className="shrink-0"
        >
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
