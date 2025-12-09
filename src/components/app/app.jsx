import { useEffect, useState } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';

import styles from './app.module.css';

const BASE_URL = 'https://norma.education-services.ru/api';

export const App = () => {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/ingredients`)
      .then((res) => {
        // Проверяем ответ
        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          setIngredients(json.data);
        } else {
          throw new Error('Неверная структура данных от сервера');
        }
      })
      .catch((err) => {
        console.error('Ошибка при загрузке ингредиентов:', err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  // загрузка ингридентов
  if (isLoading) {
    return (
      <div className={styles.app}>
        <AppHeader />
        <div className="text text_type_main-medium mt-20">Загрузка ингредиентов...</div>
      </div>
    );
  }

  // ошибки
  if (error) {
    return (
      <div className={styles.app}>
        <AppHeader />
        <div className="text text_type_main-medium mt-20">Произошла ошибка: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text text_type_main-default mt-5"
        >
          Обновить страницу
        </button>
      </div>
    );
  }
  return (
    <div className={styles.app}>
      <AppHeader />
      <h1 className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}>
        Соберите бургер
      </h1>
      <main className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients ingredients={ingredients} />
        <BurgerConstructor ingredients={ingredients} />
      </main>
    </div>
  );
};
