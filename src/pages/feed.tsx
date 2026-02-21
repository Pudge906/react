// src/pages/feed.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { OrderCard } from './order-card';

import type { RootState } from '@services/store';

import styles from './feed.module.css';

export default function Feed() {
  const dispatch = useDispatch();
  const { orders, total, totalToday } = useSelector(
    (state: RootState) => state.orderFeed
  );

  useEffect(() => {
    dispatch({
      type: 'WS_CONNECT',
      payload: 'wss://norma.education-services.ru/orders/all',
    });
  }, [dispatch]);

  const doneOrders = orders.filter((o) => o.status === 'done').slice(0, 5);
  const inProgressOrders = orders.filter((o) => o.status === 'pending').slice(0, 5);

  return (
    <div className={styles.container}>
      <h1 className="text text_type_main-large mb-5">Лента заказов</h1>

      <div className={styles.content}>
        {/* Левая колонка: список заказов */}
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <Link
              to={`/feed/${order.number}`}
              key={order._id}
              className={styles.orderLink}
            >
              <OrderCard order={order} />
            </Link>
          ))}
        </div>

        {/* Правая колонка: статистика */}
        {/* Правая колонка: статистика */}
        <div className={styles.statsPanel}>
          <div className={styles.statGroup}>
            <div className={styles.statListsContainer}>
              <div>
                <h3 className="text text_type_main-medium mb-2">Готовы:</h3>
                <ul className={styles.statList}>
                  {doneOrders.map((order) => (
                    <li key={order._id} className={styles.statItem}>
                      <span className="text text_type_digits-default">
                        {order.number}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text text_type_main-medium mb-2">В работе:</h3>
                <ul className={styles.statList}>
                  {inProgressOrders.map((order) => (
                    <li key={order._id} className={styles.statItem}>
                      <span className="text text_type_digits-default">
                        #{order.number}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.info}>
            <p className="text text_type_main-medium">Выполнено за все время:</p>
            <p className={`text text_type_digits-large ${styles.statNumber}`}>{total}</p>
          </div>

          <div className={styles.info}>
            <p className="text text_type_main-medium">Выполнено за сегодня:</p>
            <p className={`text text_type_digits-large ${styles.statNumber}`}>
              {totalToday}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}