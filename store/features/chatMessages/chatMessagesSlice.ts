// slice/chatMessagesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessagesRequest, ChatMessagesResponse } from './chatMessages-schemas';
import api from '../../services/api';

interface TypingState { [userId: number]: boolean }

interface ChatMessagesState {
    allChatMessages: ChatMessagesResponse[];
    message: string | null;
    error: string | null;
    loading: boolean;
    openChatWithUserId: number | null;
    typingStatus: TypingState;
    unreadMessages: Record<number, number>;
}

const initialState: ChatMessagesState = {
    allChatMessages: [],
    message: null,
    error: null,
    loading: false,
    openChatWithUserId: null,
    typingStatus: {},
    unreadMessages: {},
};

// Async thunks
export const getAllChatMessages = createAsyncThunk<ChatMessagesResponse[]>(
    'chatMessages/getAllChatMessages',
    async () => {
        const { data } = await api.get<ChatMessagesResponse[]>('/api/chatMessages/messages');
        return data;
    }
);

export const sendChatMessage = createAsyncThunk<ChatMessagesResponse, ChatMessagesRequest>(
    'chatMessages/sendChatMessage',
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const { data } = await api.post<ChatMessagesResponse>('/api/chatMessages/send', payload);
        dispatch(getAllChatMessages());
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to send message');
        }
    }
);

const chatMessagesSlice = createSlice({
    name: 'chatMessages',
    initialState,
    reducers: {
        addChatMessage: (state, action: PayloadAction<ChatMessagesResponse>) => {
            state.allChatMessages.push(action.payload);
        },
        setOpenChatWithUser: (state, action: PayloadAction<number | null>) => {
            state.openChatWithUserId = action.payload;
            if (action.payload) state.unreadMessages[action.payload] = 0;
        },
        setTypingStatus: (state, action: PayloadAction<{ userId: number; isTyping: boolean }>) => {
            state.typingStatus[action.payload.userId] = action.payload.isTyping;
        },
        incrementUnreadMessage: (state, action: PayloadAction<number>) => {
            state.unreadMessages[action.payload] = (state.unreadMessages[action.payload] || 0) + 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllChatMessages.fulfilled, (state, action) => {
                state.allChatMessages = action.payload;
            })
            .addCase(sendChatMessage.fulfilled, (state) => {
                state.loading = false;
                state.message = null; 
            });
    },
});

export const { addChatMessage, setOpenChatWithUser, setTypingStatus, incrementUnreadMessage } = chatMessagesSlice.actions;
export default chatMessagesSlice.reducer;
