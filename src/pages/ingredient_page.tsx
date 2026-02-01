import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import IngredientDetails from '@components/Modal/ingredient-details.tsx';
import { setCurrentIngredient } from '@services/ingredient_detailsSlice.js';

import type { RootState } from '@services/store';

import styles from './ingredient_page.module.css';

type LocationState = {
  background?: Location;
};

type Ingredient = {
  _id: string;
  [key: string]: unknown;
};

type IngredientsState = {
  items: Ingredient[];
  loading: boolean;
  error: string | null;
};

type IngredientPageProps = {
  asPage?: boolean;
  asModal?: boolean;
};

export default function IngredientPage({
  asPage = false,
  asModal = false,
}: IngredientPageProps): React.ReactElement | null {
  const location = useLocation<LocationState>();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const {
    items: ingredients,
    loading,
    error,
  } = useSelector<RootState, IngredientsState>((state) => state.ingredients);
  const ingredient = ingredients?.find((ing) => ing._id === id) || null;

  useEffect(() => {
    dispatch(setCurrentIngredient(ingredient));
  }, [dispatch, ingredient]);

  if (asModal) {
    return null;
  }

  if (asPage) {
    if (loading) return <div className={styles.center}>Загрузка...</div>;
    if (error)
      return <div className={`${styles.center} ${styles.error}`}>Ошибка: {error}</div>;
    if (!ingredient)
      return (
        <div className={`${styles.center} ${styles.error}`}>Ингредиент не найден</div>
      );

    return (
      <div className={styles.container}>
        <IngredientDetails />
      </div>
    );
  }

  if (location.state?.background) {
    return null;
  }

  if (loading) return <div className={styles.center}>Загрузка...</div>;
  if (error)
    return <div className={`${styles.center} ${styles.error}`}>Ошибка: {error}</div>;
  if (!ingredient)
    return (
      <div className={`${styles.center} ${styles.error}`}>Ингредиент не найден</div>
    );

  return (
    <div className={styles.container}>
      <IngredientDetails />
    </div>
  );
}
