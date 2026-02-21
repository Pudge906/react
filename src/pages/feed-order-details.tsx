import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { wsConnecting } from '@services/order_feed_slice';

import { request } from '../utils/api';
import { OrderDetailsContent } from './order-details-content';

import type { RootState } from '@services/store';

import styles from './order-details.module.css';

type LocationState = {
  background?: Location;
};

type Props = {
  asPage?: boolean;
  asModal?: boolean;
};

export default function FeedOrderDetails({ asPage = false, asModal = false }: Props) {
  const location = useLocation<LocationState>();
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();
  const { orders } = useSelector((state: RootState) => state.orderFeed);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!asModal) {
      dispatch(wsConnecting('wss://norma.education-services.ru/orders/all'));
    }
  }, [dispatch, asModal]);

  useEffect(() => {
    const found = orders.find((o) => o.number === Number(number));
    if (found) {
      setOrder(found);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await request(`/orders/${number}`);
        setOrder(res.order);
      } catch (err: any) {
        setError(err.message || 'Не удалось загрузить заказ');
      } finally {
        setLoading(false);
      }
    };

    if (!asModal && !location.state?.background) {
      fetchOrder();
    }
  }, [number, orders, asModal, location.state?.background]);

  if (asModal) {
    return null;
  }

  if (loading) {
    return <div className={styles.container}>Загрузка...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className="text text_type_main-default text_color_error">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <p className="text text_type_main-default">Заказ не найден</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <OrderDetailsContent order={order} />
    </div>
  );
}