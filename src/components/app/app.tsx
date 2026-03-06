import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AppHeader } from '@components/app-header/app-header.tsx';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor.tsx';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients.tsx';
import ModalRoot from '@components/Modal/modal_root.tsx';
import { OnlyAuth, OnlyUnAuth } from '@components/ProtectedRoute/ProtectedRoute.tsx';
import FeedOrderDetails from '@pages/feed-order-details.tsx';
import Feed from '@pages/feed.tsx';
import Forgot_password from '@pages/forgot_password.tsx';
import Ingredient_page from '@pages/ingredient_page.tsx';
import Login from '@pages/login.tsx';
import Not_found from '@pages/not_found.tsx';
import ProfileOrderDetails from '@pages/profile-order-details.tsx';
import ProfileOrders from '@pages/profile-orders.tsx';
import Profile from '@pages/profile.tsx';
import Register from '@pages/register.tsx';
import Reset_password from '@pages/reset_password.tsx';
import { checkAuth } from '@services/auth_slice.ts';
import { useAppDispatch, useAppSelector } from '@services/hooks';
import { fetchIngredients } from '@services/ingredients_slice.ts';

import type { RootState } from '@services/store';

import styles from './app.module.css';

type LocationState = {
  background?: Location;
};

type IngredientState = {
  loading: boolean;
  error: string | null;
};

const AppWithRouting: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation<LocationState>();

  const { loading, error } = useAppSelector<RootState, IngredientState>(
    (state) => state.ingredients
  );

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

      <Route path="/feed" element={<Feed />} />
      <Route path="/feed/:number" element={<FeedOrderDetails />} />

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
              <Route path="orders" element={<ProfileOrders />} />
              <Route path="orders/:number" element={<ProfileOrderDetails />} />
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
        <>
          <Route path="/ingredients/:id" element={<Ingredient_page asModal={true} />} />
          <Route path="/feed/:number" element={<FeedOrderDetails />} />
          <Route path="/profile/orders/:number" element={<ProfileOrderDetails />} />
        </>
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
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="*" element={<AppWithRouting />} />
    </Routes>
  );
};
