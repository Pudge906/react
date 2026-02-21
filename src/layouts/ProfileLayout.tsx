import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

import { logoutUser } from '@services/auth_slice.ts';

import type { ReactNode } from 'react';

import styles from '../pages/profile.module.css';

export function ProfileLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
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
            просмотреть свою историю заказов
          </p>
        </div>
      </nav>

      <div className={styles.content}>{children}</div>
    </div>
  );
}