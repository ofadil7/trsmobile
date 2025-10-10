import { AppDispatch, RootState } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import api, { API_BASE_URL } from '@/store/services/api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import qs from 'qs';

import { AxiosError } from 'axios';
import { getPorterById } from '../porters/portersSlice';
import {
  GetAllTicketsRequest,
  PortersIDsRequest,
  StatusChangeRequest,
  TicketPagedApi,
  TicketRequest,
  TicketResponseApi,
} from './tickets-schemas';

interface TicketState {
  singleTicket: TicketResponseApi;
  pagedTickets: TicketPagedApi;
  loading: boolean;
  drawerloading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  singleTicket: {
    data: null,
    errors: [],
    traceId: '',
  },
  pagedTickets: {
    data: {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    errors: [],
    traceId: '',
  },
  loading: false,
  drawerloading: false,
  error: null,
};

const handleApiError = (error: unknown, defaultMessage: string) => {
  const axiosError = error as AxiosError<{ message?: string; errors?: string[] }>;
  return {
    message: axiosError.response?.data?.message || defaultMessage,
    errors: axiosError.response?.data?.errors || [],
    traceId: axiosError.response?.headers?.['x-trace-id'] || '',
  };
};

// Thunks with toast notifications
export const createTicket = createAsyncThunk<
  TicketResponseApi,
  TicketRequest,
  { dispatch: AppDispatch; rejectValue: TicketResponseApi }
>('tickets/create', async (request, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.post<TicketResponseApi>(`${API_BASE_URL}/api/ticket`, request);

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket created successfully',
      }),
    );

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to create ticket');

    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to create ticket',
      }),
    );

    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const getTicketById = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; rejectValue: TicketResponseApi }
>('tickets/getById', async (id, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.get<TicketResponseApi>(`${API_BASE_URL}/api/ticket/${id}`);
    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to fetch ticket');

    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to fetch ticket',
      }),
    );

    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const getAllTickets = createAsyncThunk<
  TicketPagedApi,
  GetAllTicketsRequest,
  { dispatch: AppDispatch; rejectValue: TicketPagedApi }
>('tickets/getAll', async (request, { dispatch, rejectWithValue }) => {
  // Remove null, undefined, empty strings, and empty arrays
  const cleanParams = Object.fromEntries(
    Object.entries(request).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0) &&
        value !== '',
    ),
  );

  try {
    const response = await api.get<TicketPagedApi>(`${API_BASE_URL}/api/ticket`, {
      params: cleanParams,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true }),
    });
    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to fetch tickets');

    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to fetch tickets',
      }),
    );

    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const updateTicket = createAsyncThunk<
  TicketResponseApi,
  { id: number; request: TicketRequest },
  { dispatch: AppDispatch; rejectValue: TicketResponseApi }
>('tickets/update', async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.put<TicketResponseApi>(`${API_BASE_URL}/api/ticket/${id}`, request);
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket updated successfully',
      }),
    );

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to update ticket');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to update ticket',
      }),
    );

    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

// Status change operations
// ---- Status change thunks for Demandeur/Administrateur ----
export const setTicketToNew = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; rejectValue: TicketResponseApi }
>('tickets/setToNew', async (id, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(`${API_BASE_URL}/api/ticket/${id}/new`, {});

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket set to new status successfully',
      }),
    );

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(
      error,
      'Failed to set ticket to new status',
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to set ticket to new status',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const sendTicket = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; rejectValue: TicketResponseApi }
>('tickets/send', async (id, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/send`,
      {},
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket sent successfully',
      }),
    );

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to send ticket');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to send ticket',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const cancelTicket = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; rejectValue: TicketResponseApi }
>('tickets/cancel', async (id, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/cancel`,
      {},
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket cancelled successfully',
      }),
    );

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to cancel ticket');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to cancel ticket',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const assignManual = createAsyncThunk<
  TicketResponseApi,
  { id: number; request: PortersIDsRequest },
  { dispatch: AppDispatch; rejectValue: TicketResponseApi }
>('tickets/assignManual', async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/assign-manual`,
      request,
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket assigned manually successfully',
      }),
    );

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to assign ticket manually');

    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to assign ticket manually',
      }),
    );

    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

// ---- Status change thunks for Brancardier ----
export const acceptTicket = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; state: RootState; rejectValue: TicketResponseApi }
>('tickets/accept', async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/accept`,
      {},
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket accepted successfully',
      }),
    );

    const state = getState();
    const authId = state.auth?.auth!.id;
    if (authId) {
      dispatch(getPorterById(authId));
      dispatch(getTicketById(id));
    }

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to accept ticket');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to accept ticket',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const refuseTicket = createAsyncThunk<
  TicketResponseApi,
  { id: number; request: StatusChangeRequest },
  { dispatch: AppDispatch; state: RootState; rejectValue: TicketResponseApi }
>('tickets/refuse', async ({ id, request }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/refuse`,
      request,
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket refused successfully',
      }),
    );

    const state = getState();
    const authId = state.auth?.auth!.id;
    if (authId) {
      dispatch(getPorterById(authId));
      dispatch(getTicketById(id));
    }

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to refuse ticket');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to refuse ticket',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const moveToOrigin = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; state: RootState; rejectValue: TicketResponseApi }
>('tickets/moveToOrigin', async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/moveToOrigin`,
      {},
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket moved to origin successfully',
      }),
    );

    const state = getState();
    const authId = state.auth?.auth!.id;
    if (authId) {
      dispatch(getPorterById(authId));
      dispatch(getTicketById(id));
    }

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to move ticket to origin');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to move ticket to origin',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const retrieveItem = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; state: RootState; rejectValue: TicketResponseApi }
>('tickets/retrieveItem', async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/retrieve`,
      {},
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Item retrieved successfully',
      }),
    );

    const state = getState();
    const authId = state.auth?.auth!.id;
    if (authId) {
      dispatch(getPorterById(authId));
      dispatch(getTicketById(id));
    }

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to retrieve item');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to retrieve item',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const moveToDestination = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; state: RootState; rejectValue: TicketResponseApi }
>('tickets/moveToDestination', async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/moveToDestination`,
      {},
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket moved to destination successfully',
      }),
    );

    const state = getState();
    const authId = state.auth?.auth!.id;
    if (authId) {
      dispatch(getPorterById(authId));
      dispatch(getTicketById(id));
    }

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(
      error,
      'Failed to move ticket to destination',
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to move ticket to destination',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const abandonTicket = createAsyncThunk<
  TicketResponseApi,
  { id: number; request: StatusChangeRequest },
  { dispatch: AppDispatch; state: RootState; rejectValue: TicketResponseApi }
>('tickets/abandon', async ({ id, request }, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/abandon`,
      request,
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket abandoned successfully',
      }),
    );

    const state = getState();
    const authId = state.auth?.auth!.id;
    if (authId) {
      dispatch(getPorterById(authId));
      dispatch(getTicketById(id));
    }

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to abandon ticket');
    dispatch(
      setToastOpen({
        isOpen: true,
        error: message || 'Failed to abandon ticket',
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

export const completeTicket = createAsyncThunk<
  TicketResponseApi,
  number,
  { dispatch: AppDispatch; state: RootState; rejectValue: TicketResponseApi }
>('tickets/complete', async (id, { dispatch, getState, rejectWithValue }) => {
  try {
    const response = await api.patch<TicketResponseApi>(
      `${API_BASE_URL}/api/ticket/${id}/done`,
      {},
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Ticket completed successfully',
      }),
    );

    const state = getState();
    const authId = state.auth?.auth!.id;
    if (authId) {
      dispatch(getPorterById(authId));
      dispatch(getTicketById(id));
    }

    return response.data;
  } catch (error) {
    const { message, errors, traceId } = handleApiError(error, 'Failed to assign ticket manually');

    dispatch(
      setToastOpen({
        isOpen: true,
        error: message,
      }),
    );
    return rejectWithValue({ data: null, errors: [message, ...errors], traceId: traceId ?? '' });
  }
});

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    clearTicketError: (state) => {
      state.error = null;
    },
    resetTicketState: () => initialState,
    setSingleTicket: (state, action: PayloadAction<TicketResponseApi>) => {
      state.singleTicket = action.payload;
    },
    clearSingleTicket: (state) => {
      state.singleTicket = initialState.singleTicket;
    },
    updateTicketInList: (state, action: PayloadAction<TicketResponseApi['data']>) => {
      if (!action.payload) return;
      if (state.singleTicket.data?.id === action.payload.id) {
        state.singleTicket.data = action.payload;
      }
      const index = state.pagedTickets.data!.items.findIndex((t) => t.id === action.payload!.id);
      if (index !== -1) {
        state.pagedTickets.data!.items[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Generic loading/error handling
    const handlePending = (state: TicketState) => {
      state.loading = true;
      state.error = null;
    };

    const handleDrawerPending = (state: TicketState) => {
      state.drawerloading = true;
      state.error = null;
    };

    const handleRejected = (
      state: TicketState,
      action: PayloadAction<TicketResponseApi | TicketPagedApi | undefined>,
    ) => {
      state.loading = false;
      state.drawerloading = false;
      state.error = action.payload?.errors?.[0] || 'An error occurred';
    };

    builder.addCase(assignManual.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(assignManual.fulfilled, (state, action) => {
      state.loading = false;
      state.singleTicket = action.payload;

      // update paged list
      if (state.pagedTickets.data && action.payload.data) {
        const index = state.pagedTickets.data.items.findIndex(
          (t) => t.id === action.payload.data?.id,
        );
        if (index !== -1) {
          state.pagedTickets.data.items[index] = action.payload.data;
        }
      }
    });
    builder.addCase(assignManual.rejected, handleRejected);
    builder.addCase(createTicket.fulfilled, (state, action) => {
      state.loading = false;
      state.singleTicket = action.payload;
    });
    builder.addCase(createTicket.rejected, handleRejected);

    // Get All Tickets
    builder.addCase(getAllTickets.pending, handlePending);
    builder.addCase(getAllTickets.fulfilled, (state, action) => {
      state.loading = false;
      state.pagedTickets = action.payload;
    });
    builder.addCase(getAllTickets.rejected, handleRejected);

    // Get Ticket By ID
    builder.addCase(getTicketById.pending, handleDrawerPending);
    builder.addCase(getTicketById.fulfilled, (state, action) => {
      state.drawerloading = false;
      state.singleTicket = action.payload;
    });
    builder.addCase(getTicketById.rejected, handleRejected);

    // Update Ticket
    builder.addCase(updateTicket.pending, handlePending);
    builder.addCase(updateTicket.fulfilled, (state, action) => {
      state.loading = false;
      state.singleTicket = action.payload;

      // Update the ticket in the paged list if it exists
      if (state.pagedTickets.data && action.payload.data) {
        const index = state.pagedTickets.data.items.findIndex(
          (t) => t.id === action.payload.data?.id,
        );
        if (index !== -1) {
          state.pagedTickets.data.items[index] = action.payload.data;
        }
      }
    });
    builder.addCase(updateTicket.rejected, handleRejected);

    // --- Status change operations ---
    const handleStatusFulfilled = (
      state: TicketState,
      action: PayloadAction<TicketResponseApi>,
    ) => {
      state.loading = false;
      state.drawerloading = false;
      state.singleTicket = action.payload;

      // Update the ticket in the paged list if it exists
      if (state.pagedTickets.data && action.payload.data) {
        const index = state.pagedTickets.data.items.findIndex(
          (t) => t.id === action.payload.data?.id,
        );
        if (index !== -1) {
          state.pagedTickets.data.items[index] = action.payload.data;
        }
      }
    };

    // Demandeur/Administrateur
    builder.addCase(setTicketToNew.pending, handlePending);
    builder.addCase(setTicketToNew.fulfilled, handleStatusFulfilled);
    builder.addCase(setTicketToNew.rejected, handleRejected);

    builder.addCase(sendTicket.pending, handlePending);
    builder.addCase(sendTicket.fulfilled, handleStatusFulfilled);
    builder.addCase(sendTicket.rejected, handleRejected);

    builder.addCase(cancelTicket.pending, handlePending);
    builder.addCase(cancelTicket.fulfilled, handleStatusFulfilled);
    builder.addCase(cancelTicket.rejected, handleRejected);

    // Brancardier
    // ✅ Accept
    builder.addCase(acceptTicket.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(acceptTicket.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(acceptTicket.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to accept ticket';
    });

    // ✅ Refuse
    builder.addCase(refuseTicket.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(refuseTicket.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(refuseTicket.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to refuse ticket';
    });

    // ✅ MoveToOrigin
    builder.addCase(moveToOrigin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(moveToOrigin.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(moveToOrigin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to move ticket to origin';
    });

    // ✅ RetrieveItem
    builder.addCase(retrieveItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(retrieveItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(retrieveItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to retrieve item';
    });

    // ✅ MoveToDestination
    builder.addCase(moveToDestination.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(moveToDestination.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(moveToDestination.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to move ticket to destination';
    });

    // ✅ Abandon
    builder.addCase(abandonTicket.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(abandonTicket.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(abandonTicket.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to abandon ticket';
    });

    // ✅ Complete
    builder.addCase(completeTicket.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(completeTicket.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(completeTicket.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to complete ticket';
    });
  },
});

export const {
  clearTicketError,
  resetTicketState,
  setSingleTicket,
  clearSingleTicket,
  updateTicketInList,
} = ticketSlice.actions;

export default ticketSlice.reducer;
