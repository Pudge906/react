import { ConstructorElement } from '@krgaa/react-developer-burger-ui-components';

import styles from './burger-slice.module.css';

export function BurgerSlice(props) {
  return (
    <div>
      <ul className={`${styles.main}`}>
        {props.ingredients.map((ingredient) => {
          if (ingredient.type !== 'bun') {
            return (
              <li key={ingredient._id}>
                <ConstructorElement
                  text={ingredient.name}
                  price={ingredient.price}
                  thumbnail={ingredient.image}
                />
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
}