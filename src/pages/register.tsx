import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '@services/auth_slice.ts';

import type { UnknownAction } from '@reduxjs/toolkit';

import styles from './register.module.css';

// ==================== ТИПЫ ====================
interface FormData {
  name: string;
  email: string;
  password: string;
}

interface RegisterError {
  message: string;
}

// ==================== КОМПОНЕНТ ====================
export default function Register(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Обработчик отправки формы регистрации
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.name.trim()) {
      setError('Введите имя');
      return;
    }

    if (!formData.email.trim()) {
      setError('Введите email');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    try {
      await dispatch(registerUser(formData) as unknown as UnknownAction).unwrap();
      navigate('/');
    } catch (err: unknown) {
      // Безопасная обработка ошибки
      if (err instanceof Error) {
        setError(err.message || 'Ошибка регистрации');
      } else if (typeof err === 'string') {
        setError(err);
      } else if (err && typeof err === 'object' && 'message' in err && typeof (err as RegisterError).message === 'string') {
        setError((err as RegisterError).message);
      } else {
        setError('Ошибка регистрации');
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
        <h2 className={`text text_type_main-large ${styles.title}`}>Регистрация</h2>

        {/* Отображение ошибки */}
        {error && (
          <div className={`text text_type_main-default ${styles.errorMessage}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <Input
              type="text"
              placeholder="Имя"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon="EditIcon"
              error={!!error && !formData.name.trim()}
              errorText="Поле обязательно для заполнения"
            />
            
            <EmailInput
              placeholder="E-mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isIcon={false}
            />
            
            <PasswordInput
              placeholder="Пароль"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button
              htmlType="submit"
              size="medium"
              type="primary"
            >
              Зарегистрироваться
            </Button>
          </div>
        </form>

        <div className={styles.links}>
          <p className="text text_type_main-default">
            Уже зарегистрированы?{' '}
            <Link to="/login" className="text text_type_main-default">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}