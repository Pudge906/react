import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { loginUser } from '@services/auth_slice.js';

import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuth } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isAuth) {
      navigate('/', { replace: true });
    }
  }, [isAuth, navigate]);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Неверный email или пароль');
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isIcon={false}
            />
          </div>
          <div className="mb-6">
            <PasswordInput
              name="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
