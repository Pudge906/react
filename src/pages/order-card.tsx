import {
  CurrencyIcon,
  FormattedDate,
} from '@krgaa/react-developer-burger-ui-components';

import { useAppSelector } from '@services/hooks';

import type { Order } from '../types/order';

import styles from './order-card.module.css';

type Props = {
  order: Order;
};

export const OrderCard: React.FC<Props> = ({ order }) => {

  const { items } = useAppSelector((state) => state.ingredients);

  const ingredientsMap = new Map(items.map((i) => [i._id, i]));
  const totalPrice = order.ingredients.reduce((sum, id) => {
    const ing = ingredientsMap.get(id);
    return sum + (ing ? ing.price : 0);
  }, 0);

  const displayedIngredients = order.ingredients.slice(0, 5);
  const hasMore = order.ingredients.length > 5;

  return (
    <div className={styles.card}>
      <div className={styles.orderId}>
        <span className={styles.orderNumber}>#{order.number}</span>
        <div className={styles.time}>
          <FormattedDate date={new Date(order.createdAt)} />
        </div>
      </div>

      <h3 className={styles.orderName}>{order.name}</h3>

      <div className={styles.ingredientsRow}>
        {displayedIngredients.map((id, index) => {
          const ing = ingredientsMap.get(id);
          const isLast = index === displayedIngredients.length - 1;

          if (hasMore && isLast) {
            return (
              <div
                key={`badge-${order._id}`}
                className={styles.remainingBadge}
                style={{
                  zIndex: 1,
                  marginLeft: index === 0 ? 0 : -18,
                }}
              >
                +{order.ingredients.length - 5}
              </div>
            );
          }

          return (
            <div
              key={`${id}-${index}`}
              className={styles.ingredientImage}
              style={{
                zIndex: displayedIngredients.length - index,
                marginLeft: index === 0 ? 0 : -18,
              }}
            >
              {ing && <img src={ing.image} alt={ing.name} />}
            </div>
          );
        })}
      </div>

      <div className={styles.price}>
        <span className={styles.priceValue}>{totalPrice}</span>
        <CurrencyIcon type="primary" />
      </div>
    </div>
  );
};