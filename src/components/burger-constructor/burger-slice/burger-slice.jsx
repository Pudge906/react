import {
  ConstructorElement,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';

import styles from './burger-slice.module.css';

export function BurgerSlice({ ingredients }) {
  return (
    <ul className={styles.main}>
      {ingredients
        .filter((ing) => ing.type !== 'bun')
        .map((ingredient) => (
          <li key={ingredient._id} className={styles.ingredientItem}>
            <div className={styles.drag}>
              <DragIcon type="primary" />
            </div>
            <ConstructorElement
              text={ingredient.name}
              price={ingredient.price}
              thumbnail={ingredient.image}
            />
          </li>
        ))}
    </ul>
  );
}
