import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '@services/auth_slice.js';

import styles from './register.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await dispatch(registerUser({ email, password, name })).unwrap();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={`text text_type_main-large ${styles.title}`}>Регистрация</h2>

        {error && <div className="text text_type_main-default">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <Input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon="EditIcon"
            />
            <EmailInput
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isIcon={false}
            />
            <PasswordInput
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button
              htmlType="submit"
              size="medium"
              type="primary"
              className={styles.loginButton}
            >
              Зарегистрироваться
            </Button>
          </div>
        </form>

        <div className={styles.links}>
          <p className="text text_type_main-default">
            Вы уже зарегистрированы?{' '}
            <Link to="/login" className="text text_type_main-default">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
