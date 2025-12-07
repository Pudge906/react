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
                <section>
                  <img src="/icon.png" alt="Нумерация" className={styles.icon} />
                  <ConstructorElement
                    text={ingredient.name}
                    price={ingredient.price}
                    thumbnail={ingredient.image}
                  />
                </section>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
}
