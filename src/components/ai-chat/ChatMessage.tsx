import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User, AlertCircle } from 'lucide-react';
import { Message } from '@/store/slices/aiChatSlice';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = memo(({ message }) => {
  const { type, content, timestamp, status, modelUsed } = message;
  const isLoading = status === 'sending';
  const isError = status === 'error';
  
  return (
    <div 
      className={cn(
        "flex w-full gap-3 p-4",
        type === 'user' ? "bg-background" : "bg-muted/30",
        isError && "bg-destructive/10"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        {type === 'user' ? (
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src="/ai-avatar.png" alt="AI" />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      {/* Message content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {type === 'user' ? 'You' : 'AI Assistant'}
          </span>
          {modelUsed && type === 'ai' && (
            <span className="text-xs text-muted-foreground ml-2">{modelUsed}</span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
          {isError && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Failed to send
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {status === 'sending' && type === 'user' && (
              <div className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }}></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }}></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatMessage;
