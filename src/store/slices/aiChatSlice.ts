import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';
import { RootState } from '@/store';

// Types
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  status: 'sending' | 'sent' | 'error';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

interface AiChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AiChatState = {
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const sendMessage = createAsyncThunk<
  any,
  { message: string; conversationId?: string },
  { state: RootState }
>('aiChat/sendMessage', async ({ message, conversationId }, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.AI.CHAT, {
      method: 'POST',
      ...DEFAULT_REQUEST_OPTIONS,
      body: JSON.stringify({ 
        message, 
        conversationId 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Failed to send message');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'An error occurred');
  }
});

export const fetchConversations = createAsyncThunk<
  Conversation[],
  void,
  { state: RootState }
>('aiChat/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.AI.GET_CONVERSATIONS, {
      method: 'GET',
      ...DEFAULT_REQUEST_OPTIONS,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Failed to fetch conversations');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'An error occurred');
  }
});

export const fetchConversation = createAsyncThunk<
  Conversation,
  string,
  { state: RootState }
>('aiChat/fetchConversation', async (conversationId, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.AI.GET_CONVERSATION(conversationId), {
      method: 'GET',
      ...DEFAULT_REQUEST_OPTIONS,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Failed to fetch conversation');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'An error occurred');
  }
});

// Slice
const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<{ content: string }>) => {
      if (!state.currentConversation) {
        // Create a new conversation if none exists
        const newConversation: Conversation = {
          id: `temp-${Date.now()}`,
          title: action.payload.content.substring(0, 30) + (action.payload.content.length > 30 ? '...' : ''),
          messages: [],
          updatedAt: new Date().toISOString(),
        };
        state.currentConversation = newConversation;
        state.conversations.unshift(newConversation);
      }

      // Add user message to current conversation
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: action.payload.content,
        isUser: true,
        timestamp: new Date().toISOString(),
        status: 'sending',
      };

      state.currentConversation.messages.push(userMessage);
      state.currentConversation.updatedAt = new Date().toISOString();
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (!state.currentConversation) return;
        
        // Update conversation ID if this was a new conversation
        if (state.currentConversation.id.startsWith('temp-')) {
          state.currentConversation.id = action.payload.conversationId;
          
          // Update in conversations array too
          const index = state.conversations.findIndex(c => c.id === state.currentConversation?.id);
          if (index !== -1) {
            state.conversations[index].id = action.payload.conversationId;
          }
        }
        
        // Update status of the last user message
        const lastUserMessageIndex = state.currentConversation.messages.findIndex(
          m => m.isUser && m.status === 'sending'
        );
        
        if (lastUserMessageIndex !== -1) {
          state.currentConversation.messages[lastUserMessageIndex].status = 'sent';
          state.currentConversation.messages[lastUserMessageIndex].id = action.payload.messageId;
        }
        
        // Add AI response
        const aiMessage: Message = {
          id: action.payload.responseId,
          content: action.payload.content,
          isUser: false,
          timestamp: action.payload.timestamp,
          status: 'sent',
        };
        
        state.currentConversation.messages.push(aiMessage);
        state.currentConversation.updatedAt = new Date().toISOString();
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to send message';
        
        if (state.currentConversation) {
          // Update status of the last user message
          const lastUserMessageIndex = state.currentConversation.messages.findIndex(
            m => m.isUser && m.status === 'sending'
          );
          
          if (lastUserMessageIndex !== -1) {
            state.currentConversation.messages[lastUserMessageIndex].status = 'error';
          }
        }
      })
      
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch conversations';
      })
      
      // Fetch conversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload;
        
        // Update in conversations array if it exists
        const index = state.conversations.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.conversations[index] = action.payload;
        } else {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch conversation';
      });
  },
});

export const { addUserMessage, clearCurrentConversation, clearError } = aiChatSlice.actions;
export default aiChatSlice.reducer;
