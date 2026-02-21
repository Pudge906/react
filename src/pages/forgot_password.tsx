import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { request } from '@utils/api.ts';

import styles from './forgot_password.module.css';

type RequestState = {
  fromForgot?: boolean;
};

export default function ForgotPassword(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await request('/password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setRequestSent(true);
    } catch (err: any) {
      setError(err.message || 'Ошибка сервера');
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