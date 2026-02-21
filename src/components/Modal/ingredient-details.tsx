import { useSelector } from 'react-redux';

import styles from './ingredient-details.module.css';

type Ingredient = {
  image: string;
  name: string;
  calories: number;
  proteins: number;
  fat: number;
  carbohydrates: number;
};

type IngredientDetailsState = {
  currentIngredient: Ingredient | null;
};

export default function IngredientDetails(): React.ReactElement | null {
  const currentIngredient = useSelector(
    (state: { ingredientDetails: IngredientDetailsState }) =>
      state.ingredientDetails?.currentIngredient
  );

  if (!currentIngredient) {
    return null;
  }

  return (
    <div className={`${styles.container} text text_type_main-medium`}>
      <h2 className={`text text_type_main-large ${styles.title}`}>Детали ингредиента</h2>
      <img
        src={currentIngredient.image}
        alt={currentIngredient.name}
        className={styles.image}
      />
      <div className={`text text_type_main-large ${styles.name}`}>
        {currentIngredient.name}
      </div>
      <div className={styles.nutrition}>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            Калории, ккал
          </span>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            {currentIngredient.calories}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            Белки, г
          </span>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            {currentIngredient.proteins}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            Жиры, г
          </span>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            {currentIngredient.fat}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            Углеводы, г
          </span>
          <span className={`text text_type_main-medium ${styles.nutritionLabel}`}>
            {currentIngredient.carbohydrates}
          </span>
        </div>
      </div>
    </div>
  );
}