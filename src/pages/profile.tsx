import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProfileLayout } from '@/layouts/ProfileLayout';
import { getUserData, logoutUser, updateUserData } from '@services/auth_slice.ts';
import { useAppDispatch, useAppSelector } from '@services/hooks';

import type { RootState } from '@services/store';

type User = { name: string; email: string };
type AuthState = { user: User | null; isLoading: boolean; error: string | null };
type FormValues = { name: string; email: string; password: string };

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector<RootState, AuthState>(
    (state) => state.auth
  );

  const [form, setForm] = useState<FormValues>({ name: '', email: '', password: '' });
  const [initialValues, setInitialValues] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const newForm = { name: user.name, email: user.email, password: '' };
      setForm(newForm);
      setInitialValues(newForm);
      setHasChanges(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    const isChanged =
      form.name !== initialValues.name ||
      form.email !== initialValues.email ||
      form.password !== initialValues.password;

    setHasChanges(isChanged);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<FormValues> = { name: form.name, email: form.email };
    if (form.password.trim()) payload.password = form.password;

    try {
      await dispatch(updateUserData(payload)).unwrap();
      setInitialValues({ name: form.name, email: form.email, password: '' });
      setForm((prev) => ({ ...prev, password: '' }));
      setHasChanges(false);
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const handleCancel = () => {
    setForm({ ...initialValues, password: '' });
    setHasChanges(false);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate('/login');
  };

  if (isLoading && !user) {
    return (
      <ProfileLayout>
        <p className="text text_type_main-default">Загрузка профиля...</p>
      </ProfileLayout>
    );
  }

  if (error) {
    return (
      <ProfileLayout>
        <p className="text text_type_main-default">Ошибка: {error}</p>
      </ProfileLayout>
    );
  }

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
            <Button htmlType="submit" size="medium" type="primary">
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
    </ProfileLayout>
  );
}
