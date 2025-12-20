import { Preloader, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { IngredientCards } from '@components/burger-ingredients/burger-card/ingredient-cards.jsx';

import styles from './burger-ingredients.module.css';

export const BurgerIngredients = () => {
  const {
    items: allIngredients,
    bun,
    sauce,
    main,
    loading,
    error,
  } = useSelector((state) => state.ingredients);

  const bunRef = useRef(null);
  const sauceRef = useRef(null);
  const mainRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('bun');

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;

      const sections = [
        { id: 'bun', ref: bunRef, element: null },
        { id: 'sauce', ref: sauceRef, element: null },
        { id: 'main', ref: mainRef, element: null },
      ];

      let closestSection = null;
      let minDistance = Infinity;

      sections.forEach((section) => {
        if (section.ref.current) {
          const sectionElement = section.ref.current;
          const sectionRect = sectionElement.getBoundingClientRect();

          const distance = Math.abs(sectionRect.top - containerTop);

          const isVisible =
            sectionRect.bottom > containerTop && sectionRect.top < containerRect.bottom;

          if (isVisible && distance < minDistance) {
            minDistance = distance;
            closestSection = section.id;
          }
        }
      });

      if (closestSection && closestSection !== activeTab) {
        setActiveTab(closestSection);
      }
    };

    container.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  const scrollToSection = (sectionRef, tabValue) => {
    setActiveTab(tabValue);
    if (sectionRef.current && scrollContainerRef.current) {
      const sectionTop = sectionRef.current.offsetTop;
      const containerTop = scrollContainerRef.current.offsetTop;

      scrollContainerRef.current.scrollTo({
        top: sectionTop - containerTop,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className="text text_type_main-medium p-10 text_color_error">
        Ошибка: {error}
      </div>
    );
  }

  if (!allIngredients || allIngredients.length === 0) {
    return <div className="text text_type_main-medium p-10">Ингредиенты не найдены</div>;
  }

  return (
    <div className={`pl-1 pr-1 pb-1 pt-1 ${styles.verticalBlock}`}>
      <section className={styles.burger_ingredients}>
        <nav>
          <ul className={styles.menu}>
            <Tab
              value="bun"
              active={activeTab === 'bun'}
              onClick={() => scrollToSection(bunRef, 'bun')}
            >
              Булки
            </Tab>
            <Tab
              active={activeTab === 'sauce'}
              value="sauce"
              onClick={() => scrollToSection(sauceRef, 'sauce')}
            >
              Соусы
            </Tab>
            <Tab
              active={activeTab === 'main'}
              value="main"
              onClick={() => scrollToSection(mainRef, 'main')}
            >
              Начинки
            </Tab>
          </ul>
        </nav>
      </section>
      <IngredientCards
        bunItems={bun}
        sauceItems={sauce}
        mainItems={main}
        bunRef={bunRef}
        sauceRef={sauceRef}
        mainRef={mainRef}
        scrollContainerRef={scrollContainerRef}
      />
    </div>
  );
};
