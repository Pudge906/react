import { Preloader, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useRef, useState } from 'react';

import { IngredientList } from '@components/burger-ingredients/burger-card/burger-card.jsx';

import styles from './burger-ingredients.module.css';

export const BurgerIngredients = ({ ingredients }) => {
  console.log(ingredients);

  const loaf = useRef(null);
  const sauce = useRef(null);
  const master = useRef(null);
  const scroll = useRef(null);

  const [activeTab, setActiveTab] = useState('bun');

  const scrollToSection = (sectionRef, tabValue) => {
    setActiveTab(tabValue);
    if (sectionRef.current && scroll.current) {
      const sectionTop = sectionRef.current.offsetTop;
      const containerTop = scroll.current.offsetTop;

      scroll.current.scrollTo({
        top: sectionTop - containerTop,
        behavior: 'smooth',
      });
    }
  };

  if (ingredients.length === 0) {
    return <Preloader />;
  }

  return (
    <div className={`pl-1 pr-1 pb-1 pt-1 ${styles.unit}`}>
      <section className={styles.burger_ingredients}>
        <nav>
          <ul className={styles.menu}>
            <Tab
              value="bun"
              active={activeTab === 'bun'}
              onClick={() => scrollToSection(loaf, 'bun')}
            >
              Булки
            </Tab>

            <Tab
              active={activeTab === 'sauce'}
              value="sauce"
              onClick={() => scrollToSection(sauce, 'sauce')}
            >
              Соусы
            </Tab>
            <Tab
              active={activeTab === 'main'}
              value="main"
              onClick={() => scrollToSection(master, 'main')}
            >
              Начинки
            </Tab>
          </ul>
        </nav>
      </section>
      <IngredientList
        ingredients={ingredients}
        loaf={loaf}
        sauce={sauce}
        master={master}
        scroll={scroll}
      />
    </div>
  );
};
