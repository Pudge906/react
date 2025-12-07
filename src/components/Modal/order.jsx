import styles from './order.module.css';

export default function OrderDetails() {
  return (
    <div className={styles.container}>
      <div className={`text text_type_digits-medium ${styles.orderNumber}`}>034536</div>
      <div className={`text text_type_main-small ${styles.orderId}`}>
        идентификатор заказа
      </div>
      <div className={styles.icon}>
        <img src="/sucess.svg" alt="Заказ принят" width="120" height="120" />
      </div>
      <div className={`text text_type_main-default ${styles.status}`}>
        Ваш заказ начали готовить
      </div>
      <div className={`text text_type_main-default ${styles.waiting}`}>
        Дождитесь готовности на орбитальной станции
      </div>
    </div>
  );
}
