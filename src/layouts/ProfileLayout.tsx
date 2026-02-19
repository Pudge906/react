import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

import { logoutUser } from '@services/auth_slice.ts';

import type { ReactNode } from 'react';
import type { UnknownAction } from '@reduxjs/toolkit';

import styles from '../pages/profile.module.css';

// ==================== ТИПЫ ====================
interface ProfileLayoutProps {
  children: ReactNode;
}

// ==================== КОМПОНЕНТ ====================
export function ProfileLayout({ children }: ProfileLayoutProps): React.ReactElement {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Обработчик выхода из системы
   */
  const handleLogout = async (): Promise<void> => {
    try {
      await dispatch(logoutUser() as unknown as UnknownAction).unwrap();
      navigate('/login');
    } catch (err: unknown) {
      // Безопасная обработка ошибки
      if (err instanceof Error) {
        console.error('Logout failed:', err.message);
      } else if (typeof err === 'string') {
        console.error('Logout failed:', err);
      } else {
        console.error('Logout failed: Unknown error');
      }
      
      // Даже при ошибке пытаемся перенаправить
      navigate('/login');
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <NavLink
          to="/profile"
          className={({ isActive }: { isActive: boolean }): string =>
            `${styles.navItem} ${isActive ? styles.navItem_active : ''}`
          }
          end
        >
          <span className="text text_type_main-default">Профиль</span>
        </NavLink>
        
        <NavLink
          to="/profile/orders"
          className={({ isActive }: { isActive: boolean }): string =>
            `${styles.navItem} ${isActive ? styles.navItem_active : ''}`
          }
        >
          <span className="text text_type_main-default">История заказов</span>
        </NavLink>
        
        <button 
          type="button" 
          className={styles.navItem} 
          onClick={handleLogout}
        >
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

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}