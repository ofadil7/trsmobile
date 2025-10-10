import { AppDispatch } from '@/store';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import api, { API_BASE_URL } from '@/store/services/api';

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { IFetchParams } from '../../shared/IFetchParams';
import { MembersRequest, MembersResponse } from './members-schemas';

interface MembersState {
  members: MembersResponse | null;
  allMembers: MembersResponse[];
  uniqueColumnValues: Record<string, { value: string | number; label: string; count: number }[]>;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  message: string | null;
  error: string | null;
  loading: boolean;
  toastOpen: boolean;
}

interface ErrorResponse {
  message?: string;
}

const initialState: MembersState = {
  members: null,
  allMembers: [],
  uniqueColumnValues: {},
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  message: null,
  error: null,
  loading: false,
  toastOpen: false,
};

export const getUniqueColumnValues = createAsyncThunk<
  { columnName: string; values: { value: string | number; label: string; count: number }[] }[],
  string[],
  { rejectValue: string }
>('batiment/getUniqueColumnValues', async (columnNames, { rejectWithValue }) => {
  try {
    const { data } = await api.post<
      {
        columnName: string;
        values: { value: string | number; label: string; count: number }[];
      }[]
    >(`${API_BASE_URL}/api/members/unique-values`, { columnNames });
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message ||
        `Échec de la récupération des valeurs uniques pour la colonne ${columnNames}.`,
    );
  }
});

export const getAllMembers = createAsyncThunk<
  { items: MembersResponse[]; totalCount: number; pageNumber: number; pageSize: number },
  IFetchParams,
  { rejectValue: string }
>('members/getAllMembers', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();

    if (params.forSelect !== undefined) urlParams.append('forSelect', String(params.forSelect));
    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));

    if (params.search) {
      urlParams.append('search', params.search);
    }

    if (params.filters) {
      let filterIndex = 0;
      for (const [field, values] of Object.entries(params.filters)) {
        urlParams.append(`filters[${filterIndex}].field`, field);

        values.forEach((value, valueIndex) => {
          urlParams.append(`filters[${filterIndex}].values[${valueIndex}]`, String(value));
        });

        filterIndex++;
      }
    }

    if (params.sortField && params.sortOrder !== 0) {
      urlParams.append('SortField', params.sortField);
      urlParams.append('SortOrder', String(params.sortOrder === 2 ? 1 : 0));
    }

    const { data } = await api.get<{
      items: MembersResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`${API_BASE_URL}/api/members?${urlParams.toString()}`);

    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la récupération des members.',
    );
  }
});

export const getMembersById = createAsyncThunk<MembersResponse, number, { rejectValue: string }>(
  'members/getMembersById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<MembersResponse>(`${API_BASE_URL}/api/members/${id}`);
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Échec de la récupération de la member.',
      );
    }
  },
);

export const createMembers = createAsyncThunk<
  MembersResponse,
  MembersRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('members/createMembers', async (newMembers, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<MembersResponse>(`${API_BASE_URL}/api/members`, newMembers);
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Members créée avec succès.',
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la création de la member.',
    );
  }
});

export const editMembers = createAsyncThunk<
  MembersResponse,
  { id: number; updatedMembers: MembersRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('members/editMembers', async ({ id, updatedMembers }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<MembersResponse>(
      `${API_BASE_URL}/api/members/${id}`,
      updatedMembers,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Members modifiée avec succès.',
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la modification de la member.',
    );
  }
});

export const deleteMembers = createAsyncThunk<void, number, { rejectValue: string }>(
  'members/deleteMembers',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE_URL}/api/members/${id}`);
      dispatch(
        setToastOpen({
          isOpen: true,
          message: 'Members supprimée avec succès.',
        }),
      );
      dispatch(getAllMembers({}));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Échec de la suppression de la member.',
      );
    }
  },
);

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, member: PayloadAction<MembersResponse>) => {
      state.members = member.payload;
    },
    resetMembers: (state) => {
      state.members = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMembers.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Members créée avec succès.';
      })
      .addCase(createMembers.rejected, (state, member: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = member.payload || 'Échec de la création de la member.';
      })
      .addCase(getMembersById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMembersById.fulfilled, (state, member: PayloadAction<MembersResponse>) => {
        state.loading = false;
        state.members = member.payload;
      })
      .addCase(getMembersById.rejected, (state, member: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = member.payload || 'Échec de la récupération de la member.';
      })
      .addCase(getAllMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.allMembers = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllMembers.rejected, (state, member: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = member.payload || 'Échec de la récupération des members.';
      })
      .addCase(editMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(editMembers.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Members modifiée avec succès.';
      })
      .addCase(editMembers.rejected, (state, member: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = member.payload || 'Échec de la modification de la member.';
      })
      .addCase(deleteMembers.fulfilled, (state) => {
        state.message = 'Members supprimée avec succès.';
      })
      .addCase(deleteMembers.rejected, (state, member: PayloadAction<string | undefined>) => {
        state.error = member.payload || 'Échec de la suppression de la member.';
      })
      .addCase(getUniqueColumnValues.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((columnData) => {
          state.uniqueColumnValues[columnData.columnName] = columnData.values;
        });
      })
      .addCase(
        getUniqueColumnValues.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.error = action.payload || 'Échec de la récupération des valeurs uniques.';
        },
      );
  },
});

export const { setMembers, resetMembers } = membersSlice.actions;

export default membersSlice.reducer;
