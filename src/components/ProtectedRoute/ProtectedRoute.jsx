import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children, onlyUnAuth = false }) => {
  const location = useLocation();
  const { isAuth } = useSelector((state) => state.auth);

  if (onlyUnAuth && isAuth) {
    return <Navigate to="/" replace />;
  }

  if (!onlyUnAuth && !isAuth) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return children;
};

export const OnlyAuth = ({ children }) => (
  <ProtectedRoute onlyUnAuth={false}>{children}</ProtectedRoute>
);

export const OnlyUnAuth = ({ children }) => (
  <ProtectedRoute onlyUnAuth={true}>{children}</ProtectedRoute>
);
