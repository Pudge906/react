import styles from './ingredient-details.module.css';

export default function IngredientDetails({ ingredient }) {
  return (
    <div className={`${styles.container} text text_type_main-medium`}>
      <h2 className={`text text_type_main-large ${styles.title}`}>Детали ингредиента</h2>
      <img src={ingredient.image} alt={ingredient.name} className={styles.image} />
      <div className={`text text_type_main-large ${styles.name}`}>{ingredient.name}</div>
      <div className={styles.nutrition}>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.label}`}>
            Калории, ккал
          </span>
          <span className={`text text_type_main-medium ${styles.label}`}>
            {ingredient.calories}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.label}`}>Белки, г</span>
          <span className={`text text_type_main-medium ${styles.label}`}>
            {ingredient.proteins}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.label}`}>Жиры, г</span>
          <span className={`text text_type_main-medium ${styles.label}`}>
            {ingredient.fat}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text text_type_main-medium ${styles.label}`}>
            Углеводы, г
          </span>
          <span className={`text text_type_main-medium ${styles.label}`}>
            {ingredient.carbohydrates}
          </span>
        </div>
      </div>
    </div>
  );
}
