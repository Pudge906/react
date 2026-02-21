import { wsClose, wsError, wsMessage, wsOpen } from './order_feed_slice';
import { wsMessage as wsProfileMessage } from './profile_orders_slice';

import type { Middleware } from '@reduxjs/toolkit';

import type { OrdersWsResponse } from '../types/order';

type WsAction = {
  readonly type: string;
  readonly payload?: string;
};

export const WS_CONNECT = 'WS_CONNECT';
export const WS_DISCONNECT = 'WS_DISCONNECT';

export const wsMiddleware = (wsUrl: string, isProfile = false): Middleware => {
  return (store) => {
    let socket: WebSocket | null = null;

    return (next) => (action: WsAction) => {
      const { dispatch } = store;
      const { type, payload } = action;

      if (type === WS_CONNECT) {
        socket = new WebSocket(payload!);
      }

      if (socket) {
        socket.onopen = () => {
          if (isProfile) {
            dispatch({ type: 'WS_PROFILE_OPEN' });
          } else {
            dispatch(wsOpen());
          }
        };

        socket.onmessage = (event) => {
          const { data } = event;
          let parsedData: OrdersWsResponse;
          try {
            parsedData = JSON.parse(data);
          } catch {
            dispatch(wsError('Invalid JSON from server'));
            return;
          }

          if (!parsedData.success) {
            if (parsedData.message === 'Invalid or missing token') {
              dispatch(wsError('Токен недействителен. Пожалуйста, войдите снова.'));
              socket.close();
            } else {
              dispatch(wsError(parsedData.message || 'Ошибка сервера'));
            }
            return;
          }

          if (isProfile) {
            dispatch(wsProfileMessage(parsedData));
          } else {
            dispatch(wsMessage(parsedData));
          }
        };

        socket.onerror = (event) => {
          dispatch(wsError('WebSocket error'));
        };

        socket.onclose = (event) => {
          if (event.wasClean) {
            if (isProfile) {
              dispatch({ type: 'WS_PROFILE_CLOSE' });
            } else {
              dispatch(wsClose());
            }
          } else {
            dispatch(wsError('Connection lost'));
          }
        };
      }

      return next(action);
    };
  };
};