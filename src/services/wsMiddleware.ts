import { wsClose, wsError, wsMessage, wsOpen } from './order_feed_slice';
import { wsMessage as wsProfileMessage } from './profile_orders_slice';

import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import type { OrdersWsResponse } from '../types/order';

// ==================== ТИПЫ ====================
interface WsAction {
  readonly type: string;
  readonly payload?: string;
}

interface WsProfileOpenAction {
  type: 'WS_PROFILE_OPEN';
}

interface WsProfileCloseAction {
  type: 'WS_PROFILE_CLOSE';
}

type WsProfileAction = WsProfileOpenAction | WsProfileCloseAction;

// ==================== КОНСТАНТЫ ====================
export const WS_CONNECT = 'WS_CONNECT';
export const WS_DISCONNECT = 'WS_DISCONNECT';

const ERROR_MESSAGES = {
  INVALID_JSON: 'Invalid JSON from server',
  INVALID_TOKEN: 'Токен недействителен. Пожалуйста, войдите снова.',
  SERVER_ERROR: 'Ошибка сервера',
  CONNECTION_LOST: 'Connection lost',
  WEBSOCKET_ERROR: 'WebSocket error',
} as const;

// ==================== MIDDLEWARE ====================
export const wsMiddleware = (wsUrl: string, isProfile = false): Middleware => {
  return (store: MiddlewareAPI) => {
    let socket: WebSocket | null = null;

    return (next: (action: WsAction) => void) => (action: WsAction): WsAction => {
      const { dispatch } = store;
      const { type, payload } = action;

      // Подключение к WebSocket
      if (type === WS_CONNECT) {
        if (payload) {
          const wsUrlWithToken = `${wsUrl}${payload}`;
          socket = new WebSocket(wsUrlWithToken);
        } else {
          socket = new WebSocket(wsUrl);
        }
      }

      // Отключение от WebSocket
      if (type === WS_DISCONNECT && socket) {
        socket.close();
        socket = null;
      }

      // Настройка обработчиков событий WebSocket
      if (socket) {
        // Обработчик открытия соединения
        socket.onopen = (): void => {
          if (isProfile) {
            dispatch({ type: 'WS_PROFILE_OPEN' } as WsProfileOpenAction);
          } else {
            dispatch(wsOpen());
          }
        };

        // Обработчик получения сообщения
        socket.onmessage = (event: MessageEvent): void => {
          const { data } = event;
          let parsedData: OrdersWsResponse;
          
          try {
            parsedData = JSON.parse(data) as OrdersWsResponse;
          } catch {
            dispatch(wsError(ERROR_MESSAGES.INVALID_JSON));
            return;
          }

          if (!parsedData.success) {
            if (parsedData.message === 'Invalid or missing token') {
              dispatch(wsError(ERROR_MESSAGES.INVALID_TOKEN));
              socket?.close();
            } else {
              dispatch(wsError(parsedData.message || ERROR_MESSAGES.SERVER_ERROR));
            }
            return;
          }

          if (isProfile) {
            dispatch(wsProfileMessage(parsedData));
          } else {
            dispatch(wsMessage(parsedData));
          }
        };

        // Обработчик ошибки
        socket.onerror = (): void => {
          dispatch(wsError(ERROR_MESSAGES.WEBSOCKET_ERROR));
        };

        // Обработчик закрытия соединения
        socket.onclose = (event: CloseEvent): void => {
          if (event.wasClean) {
            if (isProfile) {
              dispatch({ type: 'WS_PROFILE_CLOSE' } as WsProfileCloseAction);
            } else {
              dispatch(wsClose());
            }
          } else {
            dispatch(wsError(ERROR_MESSAGES.CONNECTION_LOST));
          }
        };
      }

      return next(action);
    };
  };
};

// ==================== ТИПЫ ДЛЯ ЭКШЕНОВ ====================
// Экспортируем типы для использования в других файлах
export type WsConnectAction = {
  type: typeof WS_CONNECT;
  payload?: string;
};

export type WsDisconnectAction = {
  type: typeof WS_DISCONNECT;
};

export type WebSocketActions = WsConnectAction | WsDisconnectAction;