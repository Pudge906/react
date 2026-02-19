import {
  Button,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { request } from '@utils/api.ts';

import styles from './reset_password.module.css';

// ==================== ТИПЫ ====================
interface LocationState {
  fromForgot?: boolean;
}

interface ApiError {
  message: string;
  status?: number;
}

// ==================== КОМПОНЕНТ ====================
export default function ResetPassword(): React.ReactElement | null {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Все хуки вызываются в начале компонента, без условий
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  // Проверяем состояние после всех хуков
  const locationState = location.state as LocationState | null;
  const shouldRedirect = !locationState?.fromForgot;

  useEffect((): void => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect((): void => {
    if (shouldRedirect) {
      navigate('/forgot-password', { replace: true });
    }
  }, [shouldRedirect, navigate]);

  // Если нужно перенаправить, не рендерим компонент
  if (shouldRedirect) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Валидация
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      setIsLoading(false);
      return;
    }

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setError('Введите код из письма');
      setIsLoading(false);
      return;
    }

    try {
      await request('/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          token: trimmedToken,
        }),
      });

      setSuccess(true);
      localStorage.removeItem('resetEmail');

      // Таймер для редиректа
      setTimeout((): void => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      // Безопасная обработка ошибки
      if (err instanceof Error) {
        setError(err.message || 'Неверный код или пароль');
      } else if (typeof err === 'string') {
        setError(err);
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('Неверный код или пароль');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Успешный результат
  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h2 className={`text text_type_main-large ${styles.title}`}>
            Пароль успешно изменён!
          </h2>
          <p className="text text_type_main-default">
            Ваш пароль был успешно обновлён. Теперь вы можете войти в систему с новым
            паролем.
          </p>
          <Link to="/login" className="text text_type_main-default">
            Войти в аккаунт
          </Link>
          <p className="text text_type_main-default">
            Автоматический переход через 3 секунды...
          </p>
        </div>
      </div>
    );
  }

  // Основной рендер
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={`text text_type_main-large ${styles.title}`}>
          Восстановление пароля
        </h2>

        {email && (
          <p className="text text_type_main-default">
            Инструкция отправлена на: <strong>{email}</strong>
          </p>
        )}

        {error && (
          <div className={`text text_type_main-default ${styles.error}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <PasswordInput
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => 
                setPassword(e.target.value)
              }
              value={password}
              name="password"
              placeholder="Введите новый пароль"
              disabled={isLoading}
            />
            <Input
              type="text"
              placeholder="Введите код из письма"
              value={token}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => 
                setToken(e.target.value)
              }
              disabled={isLoading}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button
              type="primary"
              size="medium"
              htmlType="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>

        <div className={styles.links}>
          <p className="text text_type_main-default">
            Вспомнили пароль?{' '}
            <Link to="/login" className="text text_type_main-default">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}