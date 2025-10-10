import api, { API_BASE_URL } from '@/store/services/api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  PagedPorterResponse,
  PagedTicketHistoryResponse,
  PagedWorkingShiftResponse,
  PorterDto,
  PorterTicketCountDto,
  PorterTicketHistoryDto,
  PorterWorkingShiftDto,
} from './porters-schemas';

interface PorterState {
  porters: PorterDto[];
  currentPorter: PorterDto | null;
  workingShifts: PorterWorkingShiftDto[];
  ticketHistory: PorterTicketHistoryDto[];
  ticketCount: PorterTicketCountDto | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  message: string | null;
  error: string | null;
  loading: boolean;
}

interface ErrorResponse {
  message?: string;
  details?: string;
  errors?: Record<string, string[]>;
}

const initialState: PorterState = {
  porters: [],
  currentPorter: null,
  workingShifts: [],
  ticketHistory: [],
  ticketCount: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  message: null,
  error: null,
  loading: false,
};

// Thunks
// Updated getPorters async thunk with sorting parameters
export const getPorters = createAsyncThunk<
  PagedPorterResponse,
  {
    search?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: number;
  },
  { rejectValue: string }
>(
  'porter/getPorters',
  async (
    { search, status, pageNumber = 1, pageSize = 20, sortField = 'firstName', sortOrder = 1 },
    { rejectWithValue },
  ) => {
    try {
      const urlParams = new URLSearchParams();

      urlParams.append('pageNumber', String(pageNumber));
      urlParams.append('pageSize', String(pageSize));
      urlParams.append('sortField', sortField);
      urlParams.append('sortOrder', String(sortOrder));

      if (search) urlParams.append('search', search);
      if (status) urlParams.append('statuses', status);

      const { data } = await api.get<PagedPorterResponse>(
        `${API_BASE_URL}/api/Porters?${urlParams.toString()}`,
      );

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch porters');
    }
  },
);

export const getPorterById = createAsyncThunk<PorterDto, number, { rejectValue: string }>(
  'porter/getPorterById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get<PorterDto>(`${API_BASE_URL}/api/Porters/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch porter');
    }
  },
);

export const getWorkingShifts = createAsyncThunk<
  PagedWorkingShiftResponse,
  { id: number; startDate?: string; endDate?: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>(
  'porter/getWorkingShifts',
  async ({ id, startDate, endDate, pageNumber = 1, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const urlParams = new URLSearchParams();

      urlParams.append('pageNumber', String(pageNumber));
      urlParams.append('pageSize', String(pageSize));

      if (startDate) urlParams.append('startDate', startDate);
      if (endDate) urlParams.append('endDate', endDate);

      const { data } = await api.get<PagedWorkingShiftResponse>(
        `${API_BASE_URL}/api/Porters/${id}/WorkingShift?${urlParams.toString()}`,
      );

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Failed to fetch working shifts',
      );
    }
  },
);

export const getTicketHistory = createAsyncThunk<
  PagedTicketHistoryResponse,
  { id: number; startDate?: string; endDate?: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>(
  'porter/getTicketHistory',
  async ({ id, startDate, endDate, pageNumber = 1, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const urlParams = new URLSearchParams();

      urlParams.append('pageNumber', String(pageNumber));
      urlParams.append('pageSize', String(pageSize));

      if (startDate) urlParams.append('startDate', startDate);
      if (endDate) urlParams.append('endDate', endDate);

      const { data } = await api.get<PagedTicketHistoryResponse>(
        `${API_BASE_URL}/api/Porters/${id}/TicketHistory?${urlParams.toString()}`,
      );

      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Failed to fetch ticket history',
      );
    }
  },
);

export const getTicketHistoryCount = createAsyncThunk<
  PorterTicketCountDto,
  { id: number; startDate?: string; endDate?: string },
  { rejectValue: string }
>('porter/getTicketHistoryCount', async ({ id, startDate, endDate }, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();

    if (startDate) urlParams.append('startDate', startDate);
    if (endDate) urlParams.append('endDate', endDate);

    const { data } = await api.get<{ data: PorterTicketCountDto }>(
      `${API_BASE_URL}/api/Porters/${id}/TicketHistoryCount?${urlParams.toString()}`,
    );

    return data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Failed to fetch ticket history count',
    );
  }
});

// Slice
const porterSlice = createSlice({
  name: 'porter',
  initialState,
  reducers: {
    clearPorterError: (state) => {
      state.error = null;
    },
    resetPorterState: () => initialState,
    updatePorterInList: (state, action: PayloadAction<PorterDto>) => {
      if (!action.payload) return;
      if (state.currentPorter!.id === action.payload.id) {
        state.currentPorter! = action.payload;
      }
      const index = state.porters!.findIndex((t) => t.id === action.payload!.id);
      if (index !== -1) {
        state.porters[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Porters
      .addCase(getPorters.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPorters.fulfilled, (state, action) => {
        state.loading = false;
        state.porters = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getPorters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load porters';
      })

      // Get Porter By Id
      .addCase(getPorterById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPorterById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPorter = action.payload;
      })
      .addCase(getPorterById.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to load porter';
      })

      // Get Working Shifts
      .addCase(getWorkingShifts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWorkingShifts.fulfilled, (state, action) => {
        const shifts = action.payload.items;
        state.workingShifts = shifts;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getWorkingShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load working shifts';
      })

      // Get Ticket History
      .addCase(getTicketHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.ticketHistory = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getTicketHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load ticket history';
      })

      // Get Ticket History Count
      .addCase(getTicketHistoryCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTicketHistoryCount.fulfilled, (state, action) => {
        state.loading = false;
        state.ticketCount = action.payload;
      })
      .addCase(getTicketHistoryCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load ticket history count';
      });
  },
});

export const { clearPorterError, resetPorterState, updatePorterInList } = porterSlice.actions;

export default porterSlice.reducer;
