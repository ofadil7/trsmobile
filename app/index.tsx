import { AppDispatch } from '@/store';
import { getToken } from '@/store/services/tokenService';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../store/hooks';
import Home from './components/Home';
import Loading from './components/ui/loading';
import Login from './login';

export default function Index() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const hydrateAuth = async () => {
      const authStr = await getToken('auth');
      if (authStr) {
        const parsed = JSON.parse(authStr);
        dispatch({ type: 'auth/login/fulfilled', payload: parsed });
      }
    };
    hydrateAuth();
  }, [dispatch]);

  if (loading) return <Loading />;
  return isAuthenticated ? <Home hideTopBar={() => {}} /> : <Login />;
}
