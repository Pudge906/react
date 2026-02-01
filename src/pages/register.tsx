import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '@services/auth_slice';

import styles from './register.module.css';

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function Register(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Добавлен тип возвращаемого значения
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    try {
      await dispatch(registerUser(formData)).unwrap();
      navigate('/');
    } catch (err: unknown) {
      // Заменен any на unknown
      if (err instanceof Error) {
        setError(err.message || 'Ошибка регистрации');
      } else {
        setError('Ошибка регистрации');
      }
    }
  };

  // Добавлен тип возвращаемого значения
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon="EditIcon"
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
              className={styles.loginButton}
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
