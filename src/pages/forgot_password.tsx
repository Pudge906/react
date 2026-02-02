import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { request } from '@utils/api.ts';

import styles from './forgot_password.module.css';

// Убрали неиспользуемый тип или добавили префикс _
type _RequestState = {
  fromForgot?: boolean;
};

export default function ForgotPassword(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');

  // Добавлен тип возвращаемого значения
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    try {
      await request('/password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setRequestSent(true);
    } catch (err: unknown) {
      // Заменен any на unknown
      if (err instanceof Error) {
        setError(err.message || 'Ошибка сервера');
      } else {
        setError('Ошибка сервера');
      }
    }
  };

  if (requestSent) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h2 className={`text text_type_main-large ${styles.title}`}>
            Проверьте почту
          </h2>

          <p className="text text_type_main-default">
            Мы отправили инструкцию на адрес:
          </p>
          <p className="text text_type_main-default">{email}</p>

          <Link
            to="/reset-password"
            state={{ fromForgot: true }}
            className={`text text_type_main-default ${styles.backLink}`}
          >
            ← Перейти к вводу кода
          </Link>
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

        {error && <div className="text text_type_main-default">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <EmailInput
              name="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isIcon={false}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button
              htmlType="submit"
              size="medium"
              type="primary"
              className={styles.loginButton}
            >
              Восстановить
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
