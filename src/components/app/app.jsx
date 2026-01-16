import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import ModalRoot from '@components/Modal/modal_root';
import { OnlyAuth, OnlyUnAuth } from '@components/ProtectedRoute/ProtectedRoute';
import Forgot_password from '@pages/forgot_password.jsx';
import Ingredient_page from '@pages/ingredient_page.jsx';
import Login from '@pages/login.jsx';
import Not_found from '@pages/not_found.jsx';
import Profile from '@pages/profile.jsx';
import Register from '@pages/register.jsx';
import Reset_password from '@pages/reset_password.jsx';
import { checkAuth } from '@services/auth_slice.js';
import { fetchIngredients } from '@services/ingredients_slice.js';

import styles from './app.module.css';

function AppWithRouting() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { loading, error } = useSelector((state) => state.ingredients);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  if (error) {
    return (
      <div className={styles.app}>
        <AppHeader />
        <div className="text text_type_main-medium mt-10 pl-5 text_color_error">
          Ошибка загрузки данных: {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.app}>
        <AppHeader />
        <div className="text text_type_main-medium mt-10 pl-5">
          Загрузка ингредиентов...
        </div>
      </div>
    );
  }

  const mainRoutes = (
    <Routes location={location.state?.background || location}>
      <Route
        path="/"
        element={
          <>
            <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
              Соберите бургер
            </h1>
            <main className={`${styles.main} pl-5 pr-5`}>
              <BurgerIngredients />
              <BurgerConstructor />
            </main>
          </>
        }
      />

      <Route
        path="/login"
        element={
          <OnlyUnAuth>
            <Login />
          </OnlyUnAuth>
        }
      />
      <Route
        path="/register"
        element={
          <OnlyUnAuth>
            <Register />
          </OnlyUnAuth>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <OnlyUnAuth>
            <Forgot_password />
          </OnlyUnAuth>
        }
      />
      <Route
        path="/reset-password"
        element={
          <OnlyUnAuth>
            <Reset_password />
          </OnlyUnAuth>
        }
      />

      <Route
        path="/profile/*"
        element={
          <OnlyAuth>
            <Routes>
              <Route index element={<Profile />} />
              <Route path="orders" element={<div>История заказов (в разработке)</div>} />
            </Routes>
          </OnlyAuth>
        }
      />

      <Route path="/ingredients/:id" element={<Ingredient_page asPage={true} />} />

      <Route path="*" element={<Not_found />} />
    </Routes>
  );

  const modalRoutes = (
    <Routes>
      {location.state?.background && (
        <Route path="/ingredients/:id" element={<Ingredient_page asModal={true} />} />
      )}
    </Routes>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.app}>
        <AppHeader />
        {mainRoutes}
        {modalRoutes}

        <ModalRoot />
      </div>
    </DndProvider>
  );
}

export const App = () => {
  return (
    <Routes>
      <Route path="*" element={<AppWithRouting />} />
    </Routes>
  );
};
