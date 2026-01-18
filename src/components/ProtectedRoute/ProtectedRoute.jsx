import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children, onlyUnAuth = false }) => {
  const location = useLocation();

  const { isAuth, isLoading, isCheckAuthStarted } = useSelector((state) => state.auth);

  if (onlyUnAuth && isAuth) {
    console.log('[ProtectedRoute] OnlyUnAuth route, but user IS Auth -> Redirect to /');
    return <Navigate to="/" replace />;
  }

  if (!onlyUnAuth && !isAuth) {
    console.log(
      '[ProtectedRoute] OnlyAuth route, user NOT Auth. Check isLoading and isCheckAuthStarted...'
    );
    if (!isCheckAuthStarted) {
      console.log('[ProtectedRoute] CheckAuth not started yet, showing stub');
      return <div>Проверка авторизации...</div>;
    }
    if (isLoading) {
      console.log('[ProtectedRoute] Still loading, showing stub');
      return <div>Проверка авторизации...</div>;
    }
    console.log('[ProtectedRoute] Loading done, user NOT Auth -> Redirect to /login');
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  console.log('[ProtectedRoute] Route allowed -> Render Children');
  return children;
};

export const OnlyAuth = ({ children }) => (
  <ProtectedRoute onlyUnAuth={false}>{children}</ProtectedRoute>
);

export const OnlyUnAuth = ({ children }) => (
  <ProtectedRoute onlyUnAuth={true}>{children}</ProtectedRoute>
);
