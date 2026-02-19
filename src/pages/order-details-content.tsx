import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useSelector } from 'react-redux';

import type { RootState } from '@services/store';

import styles from './order-details.module.css';

// Вспомогательная функция для форматирования даты как "Вчера, 13:50 i-GMT+3"
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  let dayStr: string;

  if (diffDays === 0) dayStr = 'Сегодня';
  else if (diffDays === 1) dayStr = 'Вчера';
  else if (diffDays === 2) dayStr = 'Позавчера';
  else dayStr = `${diffDays} дня назад`;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const tz = 'i-GMT+3'; // как в скриншоте

  return `${dayStr}, ${hours}:${minutes} ${tz}`;
};

export const OrderDetailsContent: React.FC<Props> = ({ order }) => {
  const { items } = useSelector((state: RootState) => state.ingredients);

  const ingredientsMap = new Map(items.map((i) => [i._id, i]));
  const ingredientsInOrder = order.ingredients
    .map((id) => ingredientsMap.get(id))
    .filter(Boolean) as NonNullable<(typeof items)[0]>[];

  const uniqueIngredients = Array.from(
    new Map(ingredientsInOrder.map((i) => [i._id, i])).values()
  );

  const totalPrice = uniqueIngredients.reduce((sum, ing) => sum + ing.price, 0);

  const formattedDate = formatRelativeDate(new Date(order.createdAt));

  return (
    <div className={styles.container}>
      <p className={`text text_type_digits-default ${styles.number}`}>#{order.number}</p>

      <h2 className={`text text_type_main-medium ${styles.name}`}>{order.name}</h2>

      <p className={`${styles.status}`}>
        {order.status === 'done'
          ? 'Выполнен'
          : order.status === 'pending'
            ? 'Готовится'
            : 'Отменён'}
      </p>

      <h3 className={`${styles.ingredientsTitle}`}>Состав:</h3>

      <div className={styles.ingredientsListWrapper}>
        <ul className={styles.ingredientsList}>
          {uniqueIngredients.map((ing) => {
            const count = order.ingredients.filter((id) => id === ing._id).length;
            return (
              <li key={ing._id} className={styles.ingredientItem}>
                <div className={styles.ingredientImage}>
                  <img src={ing.image} alt={ing.name} />
                </div>
                <span className={styles.ingredientName}>{ing.name}</span>
                <div className={styles.ingredientPrice}>
                  <span>
                    {count} × {ing.price}
                  </span>
                  <CurrencyIcon type="primary" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.footer}>
        <p className={`${styles.footerDate}`}>{formattedDate}</p>
        <div className={styles.totalPrice}>
          <span className="text text_type_digits-default mr-2">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
      </div>
    </div>
  );
};
