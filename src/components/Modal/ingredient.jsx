import styles from './ingredient.module.css';

export default function IngredientDetails({ ingredient }) {
  return (
    <div className={`${styles.container} text_start`}>
      <h2 className={`text text_type_main-large ${styles.title}`}>Детали ингредиента</h2>
      <img src={ingredient.image} alt={ingredient.name} className={styles.image} />
      <div className={`text text_type_main-large ${styles.name}`}>{ingredient.name}</div>
      <div className={styles.nutrition}>
        <div className={styles.nutritionItem}>
          <span className={`text_start ${styles.name}`}>
            Калории, ккал
          </span>
          <span className={`text_start ${styles.label}`}>
            {ingredient.calories}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text_start ${styles.label}`}>
            Белки, грамм
          </span>
          <span className={`text_start ${styles.label}`}>
            {ingredient.proteins}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text_start ${styles.label}`}>
            Жиры, грамм
          </span>
          <span className={`text_start ${styles.label}`}>
            {ingredient.fat}
          </span>
        </div>
        <div className={styles.nutritionItem}>
          <span className={`text_start ${styles.label}`}>
            Углеводы, грамм
          </span>
          <span className={`text_start ${styles.label}`}>
            {ingredient.carbohydrates}
          </span>
        </div>
      </div>
    </div>
  );
}