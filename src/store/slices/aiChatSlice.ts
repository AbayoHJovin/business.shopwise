import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api';
import { RootState } from '@/store';

// Types
export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  sequenceOrder?: number;
  modelUsed?: string;
}

export interface ConversationListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  conversationId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  status?: string;
}

interface AiChatState {
  conversations: ConversationListItem[];
  currentConversation: Conversation | null;
  isLoadingConversation: boolean;
  isLoadingSidebar: boolean;
  isSendingMessage: boolean;
  selectedConversationId: string | null;
  error: string | null;
}

// Initial state
const initialState: AiChatState = {
  conversations: [],
  currentConversation: null,
  isLoadingConversation: false,
  isLoadingSidebar: false,
  isSendingMessage: false,
  selectedConversationId: null,
  error: null,
};

// Async thunks
export const sendMessage = createAsyncThunk<
  any,
  { message: string; conversationId?: string },
  { state: RootState }
>('aiChat/sendMessage', async ({ message, conversationId }, { rejectWithValue, dispatch, getState }) => {
  // Get the current state
  const state = getState();
  const { currentConversation } = state.aiChat;
  
  // Only use the conversationId that was explicitly passed
  // This ensures new chats don't get attached to previously selected conversations
  try {
    const response = await fetch(API_ENDPOINTS.AI.CHAT, {
      method: 'POST',
      ...DEFAULT_REQUEST_OPTIONS,
      body: JSON.stringify({ 
        message, 
        // Only include conversationId if it was explicitly provided
        ...(conversationId ? { conversationId } : {})
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

export const fetchConversationsSidebar = createAsyncThunk<
  ConversationListItem[],
  void,
  { state: RootState }
>('aiChat/fetchConversationsSidebar', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.AI.GET_CONVERSATIONS_SIDEBAR, {
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
>('aiChat/fetchConversation', async (conversationId, { rejectWithValue, dispatch }) => {
  dispatch(setSelectedConversationId(conversationId));
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
    setSelectedConversationId: (state, action: PayloadAction<string | null>) => {
      state.selectedConversationId = action.payload;
    },
    addUserMessage: (state, action: PayloadAction<{ content: string }>) => {
      if (!state.currentConversation) {
        // Create a new conversation if none exists
        const newConversation: Conversation = {
          conversationId: `temp-${Date.now()}`,
          title: action.payload.content.substring(0, 30) + (action.payload.content.length > 30 ? '...' : ''),
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'ACTIVE'
        };
        state.currentConversation = newConversation;
      }

      // Add user message to current conversation
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: action.payload.content,
        type: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending',
        sequenceOrder: state.currentConversation.messages.filter(m => m.type === 'user').length + 1
      };

      state.currentConversation.messages.push(userMessage);
      state.currentConversation.updatedAt = new Date().toISOString();
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.selectedConversationId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        
        if (!state.currentConversation) return;
        
        // Update conversation ID if this was a new conversation
        if (state.currentConversation.conversationId.startsWith('temp-')) {
          state.currentConversation.conversationId = action.payload.conversationId;
          state.selectedConversationId = action.payload.conversationId;
          
          // Fetch the conversations sidebar to update the list
          // This will be handled by the component after seeing the updated ID
        }
        
        // Update status of the last user message
        const lastUserMessageIndex = state.currentConversation.messages.findIndex(
          m => m.type === 'user' && m.status === 'sending'
        );
        
        if (lastUserMessageIndex !== -1) {
          state.currentConversation.messages[lastUserMessageIndex].status = 'sent';
          state.currentConversation.messages[lastUserMessageIndex].id = action.payload.messageId;
        }
        
        // Add AI response
        const aiMessage: Message = {
          id: action.payload.responseId,
          content: action.payload.content,
          type: 'ai',
          timestamp: action.payload.timestamp,
          status: 'sent',
          modelUsed: action.payload.modelUsed,
          sequenceOrder: state.currentConversation.messages.filter(m => m.type === 'ai').length + 1
        };
        
        state.currentConversation.messages.push(aiMessage);
        state.currentConversation.updatedAt = new Date().toISOString();
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string || 'Failed to send message';
        
        if (state.currentConversation) {
          // Update status of the last user message
          const lastUserMessageIndex = state.currentConversation.messages.findIndex(
            m => m.type === 'user' && m.status === 'sending'
          );
          
          if (lastUserMessageIndex !== -1) {
            state.currentConversation.messages[lastUserMessageIndex].status = 'error';
          }
        }
      })
      
      // Fetch conversations sidebar
      .addCase(fetchConversationsSidebar.pending, (state) => {
        state.isLoadingSidebar = true;
        state.error = null;
      })
      .addCase(fetchConversationsSidebar.fulfilled, (state, action) => {
        state.isLoadingSidebar = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversationsSidebar.rejected, (state, action) => {
        state.isLoadingSidebar = false;
        state.error = action.payload as string || 'Failed to fetch conversations';
      })
      
      // Fetch conversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoadingConversation = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoadingConversation = false;
        
        // Map the backend response to our frontend model
        const conversation: Conversation = {
          conversationId: action.payload.conversationId,
          title: action.payload.title,
          messages: action.payload.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            type: msg.type,
            timestamp: msg.timestamp,
            sequenceOrder: msg.sequenceOrder,
            modelUsed: msg.modelUsed,
            status: 'sent'
          })),
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
          status: action.payload.status
        };
        
        state.currentConversation = conversation;
        state.selectedConversationId = action.payload.conversationId;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoadingConversation = false;
        state.error = action.payload as string || 'Failed to fetch conversation';
      });
  },
});

export const { addUserMessage, clearCurrentConversation, clearError, setSelectedConversationId } = aiChatSlice.actions;
export default aiChatSlice.reducer;
