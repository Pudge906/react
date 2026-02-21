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

import styles from './login.module.css';

type LocationState = {
  from?: string;
};

type FormData = {
  email: string;
  password: string;
};

export default function Login(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation<LocationState>();

  const { isAuth } = useSelector<RootState, { isAuth: boolean }>((state) => state.auth);

  useEffect(() => {
    if (isAuth) {
      navigate('/', { replace: true });
    }
  }, [isAuth, navigate]);

  const from = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await dispatch(loginUser(formData)).unwrap();

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Неверный email или пароль');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <div>
        <h2 className={`text text_type_main-large ${styles.title}`}>Вход</h2>

        {error && <div className="text text_type_main-default">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <EmailInput
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              isIcon={false}
            />
          </div>
          <div className="mb-6">
            <PasswordInput
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className={styles.buttonContainer}>
            <Button htmlType="submit" size="medium" type="primary">
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