import {
  Button,
  ConstructorElement,
  CurrencyIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';

import { BurgerSlice } from '@components/burger-constructor/burger-slice/burger-slice.jsx';
import ModalOverlay from '@components/Modal/modal-overlay.jsx';

import styles from './burger-constructor.module.css';

export const BurgerConstructor = ({ ingredients }) => {
  console.log(ingredients);
  const image = 'https://code.s3.yandex.net/react/code/bun-02.png';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getModalOverlay = () => {
    setIsModalOpen(true);
  };

  return (
    <section className={styles.burger_constructor}>
      <div className={styles.section}>
        <div className={styles.bun}>
          <div className={styles.hol}></div>
          <ConstructorElement
            type="top"
            isLocked={true}
            text="Краторная булка N-200i (верх)"
            price={20}
            thumbnail={image}
          />
        </div>
        <div className={styles.scroll}>
          <BurgerSlice ingredients={ingredients} />
        </div>
        <div className={styles.bun}>
          <div className={styles.hol}></div>
          <ConstructorElement
            type="bottom"
            isLocked={true}
            text="Краторная булка N-200i (низ)"
            price={20}
            thumbnail={image}
          />
        </div>
      </div>
      <div className={styles.price}>
        <div className="text text_type_digits-medium ">
          610
          <CurrencyIcon type="primary" className={styles.icon} />
        </div>
        <Button
          htmlType="button"
          type="primary"
          size="large"
          onClick={() => getModalOverlay()}
        >
          оформить заказ
        </Button>
      </div>

      {isModalOpen && <ModalOverlay setIsModalOpen={setIsModalOpen} />}
    </section>
  );
};
