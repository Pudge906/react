import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { loginUser } from '@services/auth_slice.ts';

import type { RootState } from '@services/store';
import type { UnknownAction } from '@reduxjs/toolkit';

import styles from './login.module.css';

// ==================== ТИПЫ ====================
interface LocationState {
  from?: string;
}

interface FormData {
  email: string;
  password: string;
}

interface LoginError {
  message: string;
}

// ==================== КОМПОНЕНТ ====================
export default function Login(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({ 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState<string>('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuth } = useSelector<RootState, { isAuth: boolean }>(
    (state): { isAuth: boolean } => state.auth
  );

  // Редирект если уже авторизован
  useEffect((): void => {
    if (isAuth) {
      navigate('/', { replace: true });
    }
  }, [isAuth, navigate]);

  const locationState = location.state as LocationState | null;
  const from = locationState?.from || '/';

  /**
   * Обработчик отправки формы входа
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.email.trim()) {
      setError('Введите email');
      return;
    }

    if (!formData.password.trim()) {
      setError('Введите пароль');
      return;
    }

    try {
      await dispatch(loginUser(formData) as unknown as UnknownAction).unwrap();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // Безопасная обработка ошибки
      if (err instanceof Error) {
        setError(err.message || 'Неверный email или пароль');
      } else if (typeof err === 'string') {
        setError(err);
      } else if (err && typeof err === 'object' && 'message' in err && typeof (err as LoginError).message === 'string') {
        setError((err as LoginError).message);
      } else {
        setError('Неверный email или пароль');
      }
    }
  };

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev: FormData): FormData => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку при изменении поля
    if (error) {
      setError('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={`text text_type_main-large ${styles.title}`}>Вход</h2>

        {/* Отображение ошибки */}
        {error && (
          <div className={`text text_type_main-default ${styles.errorMessage}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <EmailInput
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              isIcon={false}
              error={!!error && !formData.email.trim()}
            />
            
            <PasswordInput
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              error={!!error && !formData.password.trim()}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button 
              htmlType="submit" 
              size="medium" 
              type="primary"
            >
              Войти
            </Button>
          </div>
        </form>

        <div className={styles.links}>
          <p className="text text_type_main-default">
            Вы — новый пользователь?{' '}
            <Link to="/register" className="text text_type_main-default">
              Зарегистрироваться
            </Link>
          </p>
          <p className="text text_type_main-default">
            Забыли пароль?{' '}
            <Link to="/forgot-password" className="text text_type_main-default">
              Восстановить пароль
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}