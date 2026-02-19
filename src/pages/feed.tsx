import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { OrderCard } from './order-card';

import type { RootState } from '@services/store';
import type { Order } from '../types/order';

import styles from './feed.module.css';

// ==================== ТИПЫ ====================
interface WsConnectAction {
  type: 'WS_CONNECT';
  payload: string;
}

// ==================== КОМПОНЕНТ ====================
export default function Feed(): React.ReactElement {
  const dispatch = useDispatch();
  const { orders, total, totalToday } = useSelector(
    (state: RootState) => state.orderFeed
  );

  // Подключение к WebSocket при монтировании компонента
  useEffect((): void => {
    dispatch({
      type: 'WS_CONNECT',
      payload: 'wss://norma.education-services.ru/orders/all',
    } as WsConnectAction);

    // Отключение при размонтировании
    return (): void => {
      dispatch({ type: 'WS_DISCONNECT' });
    };
  }, [dispatch]);

  // Фильтрация заказов по статусу
  const doneOrders: Order[] = orders
    .filter((o: Order): boolean => o.status === 'done')
    .slice(0, 10); // Показываем больше заказов для лучшего UX

  const inProgressOrders: Order[] = orders
    .filter((o: Order): boolean => o.status === 'pending')
    .slice(0, 10);

  return (
    <div className={styles.container}>
      <h1 className="text text_type_main-large mb-5">Лента заказов</h1>

      <div className={styles.content}>
        {/* Левая колонка: список заказов */}
        <div className={styles.ordersColumn}>
          <div className={styles.ordersList}>
            {orders.map((order: Order): React.ReactElement => (
              <Link
                to={`/feed/${order.number}`}
                key={order._id}
                className={styles.orderLink}
              >
                <OrderCard order={order} />
              </Link>
            ))}
          </div>
        </div>

        {/* Правая колонка: статистика */}
        <div className={styles.statsColumn}>
          <div className={styles.statsPanel}>
            {/* Статусы заказов */}
            <div className={styles.statusLists}>
              <div className={styles.statusColumn}>
                <h3 className="text text_type_main-medium mb-6">Готовы:</h3>
                <div className={styles.numbersList}>
                  {doneOrders.map((order: Order): React.ReactElement => (
                    <span 
                      key={order._id} 
                      className={`text text_type_digits-default ${styles.doneNumber}`}
                    >
                      {order.number}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.statusColumn}>
                <h3 className="text text_type_main-medium mb-6">В работе:</h3>
                <div className={styles.numbersList}>
                  {inProgressOrders.map((order: Order): React.ReactElement => (
                    <span 
                      key={order._id} 
                      className="text text_type_digits-default"
                    >
                      {order.number}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Общая статистика */}
            <div className={styles.statsInfo}>
              <div className={styles.infoBlock}>
                <p className="text text_type_main-medium">Выполнено за все время:</p>
                <p className={`text text_type_digits-large ${styles.largeNumber}`}>
                  {total}
                </p>
              </div>

              <div className={styles.infoBlock}>
                <p className="text text_type_main-medium">Выполнено за сегодня:</p>
                <p className={`text text_type_digits-large ${styles.largeNumber}`}>
                  {totalToday}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}