import { useSelector } from 'react-redux';

import styles from './order-details.module.css';

type OrderState = {
  orderNumber: number | null;
  loading: boolean;
  error: string | null;
};

export default function OrderDetails(): React.ReactElement {
  const { orderNumber, loading, error } = useSelector(
    (state: { order: OrderState }) => state.order
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="text text_type_main-medium">Оформляем заказ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="text text_type_main-medium text_color_error">
          Ошибка: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={`text text_type_digits-large ${styles.orderNumber}`}>
        {orderNumber ? orderNumber.toString().padStart(6, '0') : '----'}
      </h2>
      <div className={`text text_type_main-medium ${styles.orderId}`}>
        идентификатор заказа
      </div>
      <div className={styles.icon}>
        <img src="/graphics.svg" alt="Заказ принят" width="120" height="120" />
      </div>
      <div className={`text text_type_main-default ${styles.status}`}>
        Ваш заказ начали готовить
      </div>
      <div
        className={`text text_type_main-default text_color_inactive ${styles.waitMessage}`}
      >
        Дождитесь готовности на орбитальной станции
      </div>
    </div>
  );
}
