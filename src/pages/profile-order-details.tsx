import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { getToken } from '@services/auth_utils.ts';
import { wsConnecting } from '@services/profile_orders_slice';

import { request } from '../utils/api';
import { OrderDetailsContent } from './order-details-content';

import type { RootState } from '@services/store';
import type { Order } from '../types/order';

import styles from './order-details.module.css';

// ==================== ТИПЫ ====================
interface LocationState {
  background?: Location;
}

interface Props {
  asPage?: boolean;
  asModal?: boolean;
}

interface OrderResponse {
  order: Order;
  success: boolean;
}

// ==================== КОМПОНЕНТ ====================
export default function ProfileOrderDetails({ 
  asPage = false, 
  asModal = false 
}: Props): React.ReactElement | null {
  const location = useLocation();
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.profileOrders);

  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locationState = location.state as LocationState | null;

  // Подключение к WebSocket только если это не модальное окно
  useEffect((): void => {
    if (!asModal) {
      const { accessToken } = getToken();
      if (accessToken) {
        dispatch(
          wsConnecting(`wss://norma.education-services.ru/orders?token=${accessToken}`)
        );
      }
    }
  }, [dispatch, asModal]);

  // Поиск заказа в сторе или загрузка с сервера
  useEffect((): void => {
    const found = orders.find((o): boolean => o.number === Number(number));
    
    if (found) {
      setOrder(found);
      setLoading(false);
      return;
    }

    const fetchOrder = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await request(`/orders/${number}`) as OrderResponse;
        setOrder(res.order);
      } catch (err: unknown) {
        // Безопасная обработка ошибки
        if (err instanceof Error) {
          setError(err.message || 'Не удалось загрузить заказ');
        } else if (typeof err === 'string') {
          setError(err);
        } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          setError(err.message);
        } else {
          setError('Не удалось загрузить заказ');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!asModal && !locationState?.background) {
      fetchOrder();
    }
  }, [number, orders, asModal, locationState?.background]);

  // Если это модальное окно, не рендерим страницу
  if (asModal) {
    return null;
  }

  // Состояние загрузки
  if (loading) {
    return (
      <div className={styles.container}>
        <p className="text text_type_main-default">Загрузка...</p>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className={styles.container}>
        <p className="text text_type_main-default text_color_error">{error}</p>
      </div>
    );
  }

  // Заказ не найден
  if (!order) {
    return (
      <div className={styles.container}>
        <p className="text text_type_main-default">Заказ не найден</p>
      </div>
    );
  }

  // Успешный рендер
  return (
    <div className={styles.container}>
      <OrderDetailsContent order={order} />
    </div>
  );
}