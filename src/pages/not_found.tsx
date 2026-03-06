import { Link } from 'react-router-dom';

import styles from './not_found.module.css';

export default function NotFound(): React.ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.message}>Страница не найдена </p>
        <p className={styles.hint}>
          Возможно, вы ошиблись в адресе или страница была удалена.
        </p>
        <Link to="/" className={styles.button}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
