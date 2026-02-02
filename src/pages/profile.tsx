import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { getUserData, logoutUser, updateUserData } from '@services/auth_slice';

import type { RootState } from '@services/store';

import styles from './profile.module.css';

type User = {
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export default function Profile(): React.ReactElement {
  // Добавьте префикс _ для неиспользуемой переменной или удалите
  const _ = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, error } = useSelector<RootState, AuthState>(
    (state) => state.auth
  );

  const [form, setForm] = useState<FormValues>({
    name: '',
    email: '',
    password: '',
  });

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
      const newFormValues = { name: user.name, email: user.email, password: '' };
      setForm(newFormValues);
      setInitialValues(newFormValues);
      setHasChanges(false);
    }
  }, [user]);

  // Добавьте тип возвращаемого значения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    const newForm = { ...form, [name]: value };
    const isChanged =
      newForm.name !== initialValues.name ||
      newForm.email !== initialValues.email ||
      newForm.password !== initialValues.password;

    setHasChanges(isChanged);
  };

  // Добавьте тип возвращаемого значения
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const payload: Partial<FormValues> = {
      name: form.name,
      email: form.email,
    };
    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      await dispatch(updateUserData(payload)).unwrap();

      setInitialValues({ name: form.name, email: form.email, password: '' });
      setForm((prev) => ({ ...prev, password: '' }));
      setHasChanges(false);
    } catch (err: unknown) {
      console.error('Ошибка обновления:', err);
    }
  };

  // Добавьте тип возвращаемого значения
  const handleCancel = (): void => {
    setForm({ ...initialValues, password: '' });
    setHasChanges(false);
  };

  // Добавьте тип возвращаемого значения
  const handleLogout = async (): Promise<void> => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (err: unknown) {
      console.error('Ошибка выхода:', err);
    }
  };

  if (isLoading && !user) {
    return (
      <div className={styles.container}>
        <div className="text text_type_main-default">Загрузка профиля...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="text text_type_main-default">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItem_active : ''}`
          }
        >
          <span className="text text_type_main-default">Профиль</span>
        </NavLink>

        <NavLink
          to="/profile/orders"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItem_active : ''}`
          }
        >
          <span className="text text_type_main-default">История заказов</span>
        </NavLink>

        <button type="button" className={styles.navItem} onClick={handleLogout}>
          <span className="text text_type_main-default">Выход</span>
        </button>

        <div className={styles.hint}>
          <p className="text text_type_main-default">
            В этом разделе вы можете
            <br />
            изменить свои персональные данные
          </p>
        </div>
      </nav>

      <div>
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
      </div>
    </div>
  );
}
