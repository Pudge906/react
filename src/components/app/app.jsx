import { useEffect, useState } from 'react';

import { AppHeader } from '@components/app-header/app-header';
import { BurgerConstructor } from '@components/burger-constructor/burger-constructor';
import { BurgerIngredients } from '@components/burger-ingredients/burger-ingredients';

const BASE_URL = 'https://norma.education-services.ru/api';

import styles from './app.module.css';

export const App = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/ingredients`)
      .then((res) => res.json())
      .then((json) => {
        setIngredients(json.data);
      });
  }, []);

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
