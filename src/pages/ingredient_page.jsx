import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import IngredientDetails from '@components/Modal/ingredient-details';
import { setCurrentIngredient } from '@services/ingredient_detailsSlice.js';

import styles from './ingredient_page.module.css';

export default function IngredientPage({ asPage = false, asModal = false }) {
  const location = useLocation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    items: ingredients,
    loading,
    error,
  } = useSelector((state) => state.ingredients);
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
      return <div className={styles.center + ' ' + styles.error}>Ошибка: {error}</div>;
    if (!ingredient)
      return (
        <div className={styles.center + ' ' + styles.error}>Ингредиент не найден</div>
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
    return <div className={styles.center + ' ' + styles.error}>Ошибка: {error}</div>;
  if (!ingredient)
    return (
      <div className={styles.center + ' ' + styles.error}>Ингредиент не найден</div>
    );

  return (
    <div className={styles.container}>
      <IngredientDetails />
    </div>
  );
}
