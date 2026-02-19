// src/pages/profile/orders/ProfileOrders.tsx
import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { ProfileLayout } from '@/layouts/ProfileLayout';
import { getToken } from '@services/auth_utils.ts';

import type { RootState } from '@services/store';
import type { Order } from '../../types/order';
import type { Ingredient } from '../../types/ingredient';

import styles from './profile-orders.module.css';

// ==================== ТИПЫ ====================
interface WsConnectAction {
  type: 'WS_CONNECT';
  payload: string;
}

interface OrderCardProps {
  order: Order;
  ingredientsMap: Map<string, Ingredient>;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

/**
 * Форматирование даты для отображения
 * @param isoString - дата в ISO формате
 * @returns отформатированная строка даты
 */
const formatDateForDisplay = (isoString: string): string => {
  const now = new Date();
  const orderDate = new Date(isoString);

  // i-GMT+3 = UTC+3
  const utcTime = orderDate.getTime() + orderDate.getTimezoneOffset() * 60000;
  const gmtPlus3 = new Date(utcTime + 3 * 60 * 60 * 1000);

  const h = String(gmtPlus3.getHours()).padStart(2, '0');
  const m = String(gmtPlus3.getMinutes()).padStart(2, '0');
  const diffDays = Math.floor(
    (now.getTime() - gmtPlus3.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return `Сегодня, ${h}:${m} i-GMT+3`;
  if (diffDays === 1) return `Вчера, ${h}:${m} i-GMT+3`;
  return `${diffDays} дня назад, ${h}:${m} i-GMT+3`;
};

/**
 * Получение текста статуса заказа
 */
const getStatusText = (status: string): string => {
  switch (status) {
    case 'done':
      return 'Выполнен';
    case 'pending':
      return 'Готовится';
    case 'created':
      return 'Создан';
    default:
      return 'Отменен';
  }
};

// ==================== КОМПОНЕНТ КАРТОЧКИ ЗАКАЗА ====================
const OrderCardComponent = ({ order, ingredientsMap }: OrderCardProps): React.ReactElement => {
  // Рассчитываем сумму заказа
  const totalPrice = order.ingredients.reduce((sum: number, id: string): number => {
    const ing = ingredientsMap.get(id);
    return sum + (ing?.price || 0);
  }, 0);

  // Отображаемые ингредиенты (первые 5)
  const displayedIngredients = order.ingredients.slice(0, 5);
  const hasMore = order.ingredients.length > 5;
  const statusText = getStatusText(order.status);
  const statusClass = order.status === 'done' ? styles.statusDone : styles.statusPending;

  return (
    <NavLink
      key={order._id}
      to={`/profile/orders/${order.number}`}
      className={styles.orderCard}
    >
      <div className={styles.orderHeader}>
        <span className={styles.orderNumber}>#{order.number}</span>
        <div className={styles.time}>
          <span>{formatDateForDisplay(order.createdAt)}</span>
        </div>
      </div>

      <div className={styles.statusContainer}>
        <span className={`${styles.statusBadge} ${statusClass}`}>
          {statusText}
        </span>
      </div>

      <h3 className={styles.orderName}>{order.name}</h3>

      <div className={styles.ingredientsRow}>
        {displayedIngredients.map((id: string, index: number): React.ReactElement => {
          const ing = ingredientsMap.get(id);
          const isLast = index === displayedIngredients.length - 1;

          if (hasMore && isLast) {
            return (
              <div key={`remaining-${id}`} className={styles.remainingBadge}>
                <span>+{order.ingredients.length - 5}</span>
              </div>
            );
          }

          return (
            <div key={`ing-${id}`} className={styles.ingredientImage}>
              {ing && (
                <img
                  src={ing.image}
                  alt={ing.name}
                  className={styles.ingredientImg}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.priceContainer}>
        <span className={styles.priceValue}>{totalPrice}</span>
        <CurrencyIcon type="primary" />
      </div>
    </NavLink>
  );
};

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================
export default function ProfileOrders(): React.ReactElement {
  const dispatch = useDispatch();
  
  // Все хуки вызываются в начале компонента
  const profileOrdersState = useSelector((state: RootState) => state.profileOrders);
  const ingredientsState = useSelector((state: RootState) => state.ingredients);

  const { orders, isLoading, error } = profileOrdersState;
  const { items: ingredients } = ingredientsState;

  // Подключение к WebSocket
  useEffect((): (() => void) => {
    const { accessToken } = getToken();
    
    if (accessToken) {
      dispatch({
        type: 'WS_CONNECT',
        payload: `wss://norma.education-services.ru/orders?token=${accessToken}`,
      } as WsConnectAction);
    }

    // Отключение при размонтировании
    return (): void => {
      dispatch({ type: 'WS_DISCONNECT' });
    };
  }, [dispatch]);

  // Создаем Map для быстрого доступа к ингредиентам
  const ingredientsMap = new Map<string, Ingredient>(
    ingredients.map((item: Ingredient): [string, Ingredient] => [item._id, item])
  );

  // Состояние загрузки
  if (isLoading && !orders.length) {
    return (
      <ProfileLayout>
        <p className="text text_type_main-default">Загрузка...</p>
      </ProfileLayout>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <ProfileLayout>
        <p className="text text_type_main-default">Ошибка: {error}</p>
      </ProfileLayout>
    );
  }

  // Основной рендер
  return (
    <ProfileLayout>
      {orders.length === 0 ? (
        <p className="text text_type_main-default">У вас пока нет заказов</p>
      ) : (
        <div className={styles.ordersContainer}>
          <div className={styles.ordersList}>
            {orders.map((order): React.ReactElement => (
              <OrderCardComponent
                key={order._id}
                order={order}
                ingredientsMap={ingredientsMap}
              />
            ))}
          </div>
        </div>
      )}
    </ProfileLayout>
  );
}