import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ThreadListResponse, ThreadItem, ThreadMessageItem } from "@/services/dashboard/analytics";
import {
    getFilteredThreadsApi,
    getThreadMessagesApi,
    updateThreadSidebarApi,
    assignThreadToAgentApi,
    replyToThreadApi,
    updateThreadStatusApi,
    type FilterThreadsParams,
} from "@/services/inbox";

export interface InboxState {
    threadsData: ThreadListResponse | null;
    selectedThread: ThreadItem | null;
    messages: ThreadMessageItem[];
    loadingThreads: boolean;
    loadingMessages: boolean;
    sendingReply: boolean;
    savingSidebar: boolean;
    statusTab: string;
    replyText: string;
    editingVisitor: boolean;
    visitorName: string;
    visitorEmail: string;
    visitorPhone: string;
    newTagInput: string;
    selectedTagPreset: string;
    newNoteInput: string;
    error: string;
}

const initialState: InboxState = {
    threadsData: null,
    selectedThread: null,
    messages: [],
    loadingThreads: false,
    loadingMessages: false,
    sendingReply: false,
    savingSidebar: false,
    statusTab: "all",
    replyText: "",
    editingVisitor: false,
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    newTagInput: "",
    selectedTagPreset: "",
    newNoteInput: "",
    error: "",
};

// Async Thunks
export const fetchInboxThreads = createAsyncThunk(
    "inbox/fetchInboxThreads",
    async (params: FilterThreadsParams, { rejectWithValue }) => {
        try {
            const data = await getFilteredThreadsApi(params);
            return data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to fetch conversations list.");
        }
    }
);

export const fetchInboxMessages = createAsyncThunk(
    "inbox/fetchInboxMessages",
    async (threadId: string, { rejectWithValue }) => {
        try {
            const detail = await getThreadMessagesApi(threadId);
            return detail;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to load thread messages.");
        }
    }
);

export const sendThreadReply = createAsyncThunk(
    "inbox/sendThreadReply",
    async (
        { threadId, content, senderName }: { threadId: string; content: string; senderName?: string },
        { dispatch, rejectWithValue }
    ) => {
        try {
            await replyToThreadApi(threadId, content, senderName);
            await dispatch(fetchInboxMessages(threadId));
            return true;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to send message reply.");
        }
    }
);

export const assignAgentToThread = createAsyncThunk(
    "inbox/assignAgentToThread",
    async (
        { threadId, agentId, agentName, agentEmail, filterParams }: { threadId: string; agentId: string; agentName: string; agentEmail: string; filterParams: FilterThreadsParams },
        { dispatch, rejectWithValue }
    ) => {
        try {
            await assignThreadToAgentApi(threadId, agentId, agentName, agentEmail);
            void dispatch(fetchInboxThreads(filterParams));
            void dispatch(fetchInboxMessages(threadId));
            return true;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to assign agent to thread.");
        }
    }
);

export const toggleThreadStatus = createAsyncThunk(
    "inbox/toggleThreadStatus",
    async (
        { threadId, currentStatus, filterParams }: { threadId: string; currentStatus: string; filterParams: FilterThreadsParams },
        { dispatch, rejectWithValue }
    ) => {
        const nextStatus = currentStatus === "open" ? "ended" : "active";
        try {
            await updateThreadStatusApi(threadId, nextStatus);
            void dispatch(fetchInboxThreads(filterParams));
            void dispatch(fetchInboxMessages(threadId));
            return true;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to update thread status.");
        }
    }
);

export const saveVisitorProfile = createAsyncThunk(
    "inbox/saveVisitorProfile",
    async (
        { threadId, name, email, phone, filterParams }: { threadId: string; name: string; email: string; phone: string; filterParams: FilterThreadsParams },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const res = await updateThreadSidebarApi(threadId, {
                visitor: { name, email, phone },
            });
            void dispatch(fetchInboxThreads(filterParams));
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to update visitor details.");
        }
    }
);

export const updatePriority = createAsyncThunk(
    "inbox/updatePriority",
    async (
        { threadId, priority, filterParams }: { threadId: string; priority: string; filterParams: FilterThreadsParams },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const res = await updateThreadSidebarApi(threadId, { priority });
            void dispatch(fetchInboxThreads(filterParams));
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to update priority.");
        }
    }
);

export const addTagToThread = createAsyncThunk(
    "inbox/addTagToThread",
    async ({ threadId, tag }: { threadId: string; tag: string }, { rejectWithValue }) => {
        try {
            const res = await updateThreadSidebarApi(threadId, {
                tagAction: { action: "add", tag },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to add tag.");
        }
    }
);

export const removeTagFromThread = createAsyncThunk(
    "inbox/removeTagFromThread",
    async ({ threadId, tag }: { threadId: string; tag: string }, { rejectWithValue }) => {
        try {
            const res = await updateThreadSidebarApi(threadId, {
                tagAction: { action: "remove", tag },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to remove tag.");
        }
    }
);

export const addInternalNoteToThread = createAsyncThunk(
    "inbox/addInternalNoteToThread",
    async ({ threadId, content, author }: { threadId: string; content: string; author?: string }, { rejectWithValue }) => {
        try {
            const res = await updateThreadSidebarApi(threadId, {
                noteAction: { action: "add", content, author: author || "Support Agent" },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to add internal note.");
        }
    }
);

export const deleteInternalNoteFromThread = createAsyncThunk(
    "inbox/deleteInternalNoteFromThread",
    async ({ threadId, noteId }: { threadId: string; noteId: string }, { rejectWithValue }) => {
        try {
            const res = await updateThreadSidebarApi(threadId, {
                noteAction: { action: "delete", noteId },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Failed to delete internal note.");
        }
    }
);

export const inboxSlice = createSlice({
    name: "inbox",
    initialState,
    reducers: {
        setStatusTab: (state, action: PayloadAction<string>) => {
            state.statusTab = action.payload;
        },
        setReplyText: (state, action: PayloadAction<string>) => {
            state.replyText = action.payload;
        },
        appendReplyChunk: (state, action: PayloadAction<string>) => {
            state.replyText += action.payload;
        },
        setEditingVisitor: (state, action: PayloadAction<boolean>) => {
            state.editingVisitor = action.payload;
        },
        setVisitorName: (state, action: PayloadAction<string>) => {
            state.visitorName = action.payload;
        },
        setVisitorEmail: (state, action: PayloadAction<string>) => {
            state.visitorEmail = action.payload;
        },
        setVisitorPhone: (state, action: PayloadAction<string>) => {
            state.visitorPhone = action.payload;
        },
        setNewTagInput: (state, action: PayloadAction<string>) => {
            state.newTagInput = action.payload;
        },
        setSelectedTagPreset: (state, action: PayloadAction<string>) => {
            state.selectedTagPreset = action.payload;
        },
        setNewNoteInput: (state, action: PayloadAction<string>) => {
            state.newNoteInput = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        setSelectedThread: (state, action: PayloadAction<ThreadItem | null>) => {
            state.selectedThread = action.payload;
            if (action.payload) {
                state.visitorName = action.payload.user_name || "";
                state.visitorEmail = action.payload.user_email || "";
                state.visitorPhone = action.payload.user_phone || "";
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Threads
            .addCase(fetchInboxThreads.pending, (state) => {
                state.loadingThreads = true;
                state.error = "";
            })
            .addCase(fetchInboxThreads.fulfilled, (state, action) => {
                state.loadingThreads = false;
                state.threadsData = action.payload;
                const threads = action.payload?.threads || [];
                const selectedStillVisible = state.selectedThread
                    ? threads.some((thread) => thread.id === state.selectedThread?.id)
                    : false;
                if (!selectedStillVisible) {
                    state.selectedThread = threads[0] || null;
                    state.messages = [];
                    state.visitorName = threads[0]?.user_name || "";
                    state.visitorEmail = threads[0]?.user_email || "";
                    state.visitorPhone = threads[0]?.user_phone || "";
                }
            })
            .addCase(fetchInboxThreads.rejected, (state, action) => {
                state.loadingThreads = false;
                state.error = action.payload as string;
            })

            // Fetch Messages
            .addCase(fetchInboxMessages.pending, (state) => {
                state.loadingMessages = true;
            })
            .addCase(fetchInboxMessages.fulfilled, (state, action) => {
                state.loadingMessages = false;
                state.messages = action.payload.messages;
                if (action.payload.thread) {
                    state.selectedThread = action.payload.thread;
                    state.visitorName = action.payload.thread.user_name || "";
                    state.visitorEmail = action.payload.thread.user_email || "";
                    state.visitorPhone = action.payload.thread.user_phone || "";
                }
            })
            .addCase(fetchInboxMessages.rejected, (state, action) => {
                state.loadingMessages = false;
                state.error = action.payload as string;
            })

            // Send Reply
            .addCase(sendThreadReply.pending, (state) => {
                state.sendingReply = true;
            })
            .addCase(sendThreadReply.fulfilled, (state) => {
                state.sendingReply = false;
                state.replyText = "";
            })
            .addCase(sendThreadReply.rejected, (state, action) => {
                state.sendingReply = false;
                state.error = action.payload as string;
            })

            // Save Visitor Profile
            .addCase(saveVisitorProfile.pending, (state) => {
                state.savingSidebar = true;
            })
            .addCase(saveVisitorProfile.fulfilled, (state, action) => {
                state.savingSidebar = false;
                state.editingVisitor = false;
                if (action.payload && state.selectedThread) {
                    state.selectedThread = { ...state.selectedThread, ...action.payload };
                }
            })
            .addCase(saveVisitorProfile.rejected, (state, action) => {
                state.savingSidebar = false;
                state.error = action.payload as string;
            })

            // Priority
            .addCase(updatePriority.fulfilled, (state, action) => {
                if (action.payload && state.selectedThread) {
                    state.selectedThread = { ...state.selectedThread, priority: action.payload.priority };
                }
            })

            // Tags
            .addCase(addTagToThread.pending, (state) => {
                state.savingSidebar = true;
            })
            .addCase(addTagToThread.fulfilled, (state, action) => {
                state.savingSidebar = false;
                state.newTagInput = "";
                state.selectedTagPreset = "";
                if (action.payload && state.selectedThread) {
                    state.selectedThread = { ...state.selectedThread, tags: action.payload.tags };
                }
            })
            .addCase(addTagToThread.rejected, (state, action) => {
                state.savingSidebar = false;
                state.error = action.payload as string;
            })
            .addCase(removeTagFromThread.fulfilled, (state, action) => {
                if (action.payload && state.selectedThread) {
                    state.selectedThread = { ...state.selectedThread, tags: action.payload.tags };
                }
            })

            // Notes
            .addCase(addInternalNoteToThread.pending, (state) => {
                state.savingSidebar = true;
            })
            .addCase(addInternalNoteToThread.fulfilled, (state, action) => {
                state.savingSidebar = false;
                state.newNoteInput = "";
                if (action.payload && state.selectedThread) {
                    state.selectedThread = { ...state.selectedThread, notes: action.payload.notes };
                }
            })
            .addCase(addInternalNoteToThread.rejected, (state, action) => {
                state.savingSidebar = false;
                state.error = action.payload as string;
            })
            .addCase(deleteInternalNoteFromThread.fulfilled, (state, action) => {
                if (action.payload && state.selectedThread) {
                    state.selectedThread = { ...state.selectedThread, notes: action.payload.notes };
                }
            });
    },
});

export const {
    setStatusTab,
    setReplyText,
    appendReplyChunk,
    setEditingVisitor,
    setVisitorName,
    setVisitorEmail,
    setVisitorPhone,
    setNewTagInput,
    setSelectedTagPreset,
    setNewNoteInput,
    setError,
    setSelectedThread,
} = inboxSlice.actions;

export default inboxSlice.reducer;
