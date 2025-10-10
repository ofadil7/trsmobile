import { AppDispatch } from '@/store';
import api, { API_BASE_URL } from '@/store/services/api';
import { IFetchParams } from '@/store/shared/IFetchParams';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { logout } from '../authentification/authSlice';
import { setToastOpen } from '../toast/toastSlice';
import {
  ActivateWorkRouteRequest,
  AssignWorkRouteRequest,
  PagedWorkRouteResponse,
  WorkRouteBreaksResponse,
  WorkRouteRequest,
  WorkRouteResponse,
} from './routesDeTravail-schemas';
interface WorkRouteState {
  workRoute: WorkRouteResponse | null;
  allWorkRoutes: WorkRouteResponse[];
  breaks: WorkRouteBreaksResponse[];
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

const initialState: WorkRouteState = {
  workRoute: null,
  allWorkRoutes: [],
  breaks: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  message: null,
  error: null,
  loading: false,
};

// Thunks
export const getAllWorkRoutes = createAsyncThunk<
  PagedWorkRouteResponse,
  IFetchParams,
  { rejectValue: string }
>('workRoute/getAllWorkRoutes', async (params, { rejectWithValue }) => {
  try {
    const urlParams = new URLSearchParams();

    urlParams.append('pageNumber', String(params.pageNumber || 1));
    urlParams.append('pageSize', String(params.pageSize || 10));

    if (params.search) {
      urlParams.append('search', params.search);
    }
    if (params.showDisabled) {
      urlParams.append('showDisabled', 'true');
    }

    const { data } = await api.get<PagedWorkRouteResponse>(
      `${API_BASE_URL}/api/WorkRoute?${urlParams.toString()}`,
    );

    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch work routes');
  }
});

export const getWorkRouteById = createAsyncThunk<
  WorkRouteResponse,
  number,
  { rejectValue: string }
>('workRoute/getWorkRouteById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<WorkRouteResponse>(`${API_BASE_URL}/api/WorkRoute/${id}`);
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch work route');
  }
});

export const getAllWorkRouteBreaks = createAsyncThunk<
  WorkRouteBreaksResponse[],
  void,
  { rejectValue: string }
>('workRoute/getAllWorkRouteBreaks', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<WorkRouteBreaksResponse[]>(
      `${API_BASE_URL}/api/WorkRoute/WorkBreaks`,
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la récupération des pauses',
    );
  }
});

export const createWorkRoute = createAsyncThunk<
  WorkRouteResponse,
  WorkRouteRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/createWorkRoute', async (request, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<WorkRouteResponse>(`${API_BASE_URL}/api/WorkRoute`, request);
    dispatch(
      setToastOpen({
        isOpen: true,
        message: `Route de travail "${data.name}" ajouté avec succès`,
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    dispatch(
      setToastOpen({
        isOpen: true,
        error:
          axiosError.response?.data?.details ??
          `Erreur dans l'ajout du route de travail ${request.name}`,
      }),
    );
    return rejectWithValue(axiosError.response?.data?.message || 'Failed to create work route');
  }
});

export const updateWorkRoute = createAsyncThunk<
  WorkRouteResponse,
  { id: number; updatedWorkRoute: WorkRouteRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/updateWorkRoute', async ({ id, updatedWorkRoute }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<WorkRouteResponse>(
      `${API_BASE_URL}/api/WorkRoute/${id}`,
      updatedWorkRoute,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Route de travail modifiée avec succès.',
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    dispatch(
      setToastOpen({
        isOpen: true,
        error:
          axiosError.response?.data?.details ??
          `Erreur dans la modification de la route de travail ${updatedWorkRoute.name}`,
      }),
    );
    return rejectWithValue(axiosError.response?.data?.message || 'Failed to update work route');
  }
});

export const deleteWorkRoute = createAsyncThunk<
  void,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/deleteWorkRoute', async (id, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`${API_BASE_URL}/api/WorkRoute/${id}`);
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Route de travail supprimée avec succès.',
      }),
    );
    dispatch(getAllWorkRoutes({}));
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la suppression de la Route de travail.',
    );
  }
});

export const activateWorkRoute = createAsyncThunk<
  WorkRouteResponse,
  { id: number; request: ActivateWorkRouteRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/activateWorkRoute', async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.patch<WorkRouteResponse>(
      `${API_BASE_URL}/api/WorkRoute/${id}/activate`,
      request,
    );

    dispatch(
      setToastOpen({
        isOpen: true,
        message: `Route de travail ${data.name} ${
          request.enabled ? 'activé' : 'désactivé'
        } avec succès.`,
      }),
    );

    dispatch(getAllWorkRoutes({}));

    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    dispatch(
      setToastOpen({
        isOpen: true,
        error:
          axiosError.response?.data?.message || "Échec de l'activation/désactivation du service.",
      }),
    );
    return rejectWithValue(
      axiosError.response?.data?.message || 'Erreur lors du changement de statut du service.',
    );
  }
});

export const assignWorkRoute = createAsyncThunk<
  { id: number },
  { id: number; request: AssignWorkRouteRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/assignWorkRoute', async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<{ id: number }>(
      `${API_BASE_URL}/api/WorkRoute/${id}/assign`,
      request,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Route de travail assignée avec succès.',
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Échec de l'assignation de la route de travail.",
    );
  }
});

export const changeWorkRoute = createAsyncThunk<
  { id: number },
  { id: number; request: AssignWorkRouteRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/changeWorkRoute', async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.put<{ id: number }>(
      `${API_BASE_URL}/api/WorkRoute/${id}/assign`,
      request,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Route de travail changée avec succès.',
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec du changement de la route de travail.',
    );
  }
});

export const leaveWorkRoute = createAsyncThunk<
  { id: number },
  { id: number; request: AssignWorkRouteRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/leaveWorkRoute', async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<{ id: number }>(
      `${API_BASE_URL}/api/WorkRoute/${id}/leave`,
      request,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Désassignation de la route de travail réussie.',
      }),
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la désassignation de la route de travail.',
    );
  }
});

export const endWorkRoute = createAsyncThunk<
  { id: number },
  { id: number; request: AssignWorkRouteRequest },
  { dispatch: AppDispatch; rejectValue: string }
>('workRoute/endWorkRoute', async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<{ id: number }>(
      `${API_BASE_URL}/api/WorkRoute/${id}/end`,
      request,
    );
    dispatch(
      setToastOpen({
        isOpen: true,
        message: 'Route de travail terminée avec succès.',
      }),
    );
    dispatch(logout(false));
    return data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Échec de la fin de la route de travail.',
    );
  }
});

// Slice
const workRouteSlice = createSlice({
  name: 'workRoute',
  initialState,
  reducers: {
    clearWorkRouteError: (state) => {
      state.error = null;
    },
    resetWorkRouteState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // get All Breaks
      .addCase(getAllWorkRouteBreaks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllWorkRouteBreaks.fulfilled, (state, action) => {
        state.loading = false;
        state.breaks = action.payload;
      })
      .addCase(getAllWorkRouteBreaks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Échec de la récupération des pauses de travail';
      })

      // Get All
      .addCase(getAllWorkRoutes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllWorkRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.allWorkRoutes = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(getAllWorkRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load work routes';
      })

      // Get By Id
      .addCase(getWorkRouteById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWorkRouteById.fulfilled, (state, action) => {
        state.loading = false;
        state.workRoute = action.payload;
      })
      .addCase(getWorkRouteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load work route';
      })

      // Create
      .addCase(createWorkRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.workRoute = action.payload;
        state.message = 'Route de travail créée avec succès';
      })
      .addCase(createWorkRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create work route';
      })

      // Update
      .addCase(updateWorkRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.workRoute = action.payload;
        state.message = 'Route de travail modifiée avec succès';
      })
      .addCase(updateWorkRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update work route';
      })

      // Activate
      .addCase(activateWorkRoute.pending, (state) => {
        state.loading = true;
      })
      .addCase(activateWorkRoute.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(activateWorkRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to activate/deactivate work route';
      });
  },
});

export const { clearWorkRouteError, resetWorkRouteState } = workRouteSlice.actions;

export default workRouteSlice.reducer;
