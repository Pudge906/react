import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { ProfileLayout } from '@/layouts/ProfileLayout';
import { getUserData, logoutUser, updateUserData } from '@services/auth_slice.ts';

import type { RootState } from '@services/store';
import type { UnknownAction } from '@reduxjs/toolkit';

// ==================== ТИПЫ ====================
interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface FormValues {
  name: string;
  email: string;
  password: string;
}

// ==================== КОМПОНЕНТ ====================
export default function Profile(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector<RootState, AuthState>(
    (state): AuthState => state.auth
  );

  const [form, setForm] = useState<FormValues>({ name: '', email: '', password: '' });
  const [initialValues, setInitialValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
  });
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Загрузка данных пользователя при монтировании
  useEffect((): void => {
    dispatch(getUserData() as unknown as UnknownAction);
  }, [dispatch]);

  // Обновление формы при получении данных пользователя
  useEffect((): void => {
    if (user) {
      const newForm: FormValues = { 
        name: user.name, 
        email: user.email, 
        password: '' 
      };
      setForm(newForm);
      setInitialValues(newForm);
      setHasChanges(false);
    }
  }, [user]);

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev: FormValues): FormValues => ({ ...prev, [name]: value }));

    // Проверяем, были ли изменения
    const isChanged: boolean = 
      form.name !== initialValues.name ||
      form.email !== initialValues.email ||
      (form.password !== initialValues.password && form.password !== '');

    setHasChanges(isChanged);
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const payload: Partial<FormValues> = { 
      name: form.name, 
      email: form.email 
    };
    
    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      await dispatch(updateUserData(payload) as unknown as UnknownAction).unwrap();
      setInitialValues({ name: form.name, email: form.email, password: '' });
      setForm((prev: FormValues): FormValues => ({ ...prev, password: '' }));
      setHasChanges(false);
    } catch (err: unknown) {
      // Безопасная обработка ошибки
      if (err instanceof Error) {
        console.error('Ошибка обновления профиля:', err.message);
      } else if (typeof err === 'string') {
        console.error('Ошибка обновления профиля:', err);
      } else {
        console.error('Неизвестная ошибка при обновлении профиля');
      }
    }
  };

  // Обработчик отмены изменений
  const handleCancel = (): void => {
    setForm({ ...initialValues, password: '' });
    setHasChanges(false);
  };

  // Обработчик выхода из системы
  const handleLogout = async (): Promise<void> => {
    try {
      await dispatch(logoutUser() as unknown as UnknownAction).unwrap();
      navigate('/login');
    } catch (err: unknown) {
      // Даже если ошибка, пытаемся перенаправить
      navigate('/login');
    }
  };

  // Состояние загрузки
  if (isLoading && !user) {
    return (
      <ProfileLayout>
        <p className="text text_type_main-default">Загрузка профиля...</p>
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
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Имя"
            name="name"
            value={form.name}
            onChange={handleChange}
            icon="EditIcon"
          />
        </div>
        <div className="mb-6">
          <EmailInput
            placeholder="E-mail"
            name="email"
            value={form.email}
            onChange={handleChange}
            isIcon={true}
          />
        </div>
        <div className="mb-6">
          <PasswordInput
            placeholder="Пароль"
            name="password"
            value={form.password}
            onChange={handleChange}
            icon="EditIcon"
          />
        </div>

        {hasChanges && (
          <div>
            <Button 
              htmlType="submit" 
              size="medium" 
              type="primary"
            >
              Сохранить
            </Button>
            <Button
              htmlType="button"
              size="medium"
              type="secondary"
              onClick={handleCancel}
            >
              Отмена
            </Button>
          </div>
        )}
      </form>
      
      {/* Кнопка выхода всегда отображается */}
      <div className="mt-10">
        <Button
          htmlType="button"
          size="medium"
          type="secondary"
          onClick={handleLogout}
        >
          Выход
        </Button>
      </div>
    </ProfileLayout>
  );
}