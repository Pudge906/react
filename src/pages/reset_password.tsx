import {
  Button,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { request } from '@utils/api.ts';

import styles from './reset_password.module.css';

type LocationState = {
  fromForgot?: boolean;
};

export default function ResetPassword(): React.ReactElement | null {
  const location = useLocation<LocationState>();
  const navigate = useNavigate();

  // ВСЕ хуки должны быть здесь, перед любыми условиями
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  // Убрали неиспользуемую переменную shouldRedirect
  // const [shouldRedirect, setShouldRedirect] = useState(false);

  // Проверяем состояние location в useEffect
  useEffect(() => {
    if (!location.state?.fromForgot) {
      navigate('/forgot-password', { replace: true });
      return;
    }
  }, [location.state?.fromForgot, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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
        body: JSON.stringify({
          password,
          token: trimmedToken,
        }),
      });

      setSuccess(true);
      localStorage.removeItem('resetEmail');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      // Заменен any на unknown
      if (err instanceof Error) {
        setError(err.message || 'Неверный код или пароль');
      } else {
        setError('Неверный код или пароль');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Если нет доступа к странице, можно показать загрузку или null
  if (!location.state?.fromForgot) {
    return null; // или <Loader /> или что-то подобное
  }

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

        {error && <div className="text text_type_main-default">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <PasswordInput
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name="password"
              placeholder="Введите новый пароль"
              disabled={isLoading}
            />
            <Input
              type="text"
              placeholder="Введите код из письма"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button
              type="primary"
              size="medium"
              htmlType="submit"
              disabled={isLoading}
              className={styles.loginButton}
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
