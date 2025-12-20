import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';
import ModalRoot from '@components/Modal/modal_root';

import { fetchIngredients } from '../../services/ingredientsSlice';

import styles from './app.module.css';

export const App = () => {
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.ingredients);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.app}>
        <AppHeader />
        <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
          Соберите бургер
        </h1>
        <main className={`${styles.main} pl-5 pr-5`}>
          <BurgerIngredients />
          <BurgerConstructor />
        </main>
        <ModalRoot />
      </div>
    </DndProvider>
  );
};
