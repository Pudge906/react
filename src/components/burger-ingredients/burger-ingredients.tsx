import { Preloader, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { IngredientCards } from '@components/burger-ingredients/burger-card/ingredient-cards';

import styles from './burger-ingredients.module.css';

type Ingredient = {
  _id: string;
  name: string;
  price: number;
  image: string;
  type: 'bun' | 'sauce' | 'main';
};

type IngredientsState = {
  items: Ingredient[];
  bun: Ingredient[];
  sauce: Ingredient[];
  main: Ingredient[];
  loading: boolean;
  error: string | null;
};

export const BurgerIngredients: React.FC = () => {
  const {
    items: allIngredients,
    bun,
    sauce,
    main,
    loading,
    error,
  } = useSelector((state: { ingredients: IngredientsState }) => state.ingredients);

  const bunRef = useRef<HTMLDivElement>(null);
  const sauceRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  const [activeTab, setActiveTab] = useState<'bun' | 'sauce' | 'main'>('bun');

  useEffect((): (() => void) => {
    const container = scrollContainerRef.current;
    if (!container) {
      // Вместо пустой функции возвращаем undefined или функцию без тела
      return () => {
        /* cleanup не требуется, т.к. container не существует */
      };
    }

    const handleScroll = (): void => {
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;

      const sections = [
        { id: 'bun' as const, ref: bunRef },
        { id: 'sauce' as const, ref: sauceRef },
        { id: 'main' as const, ref: mainRef },
      ];

      let closestSection: 'bun' | 'sauce' | 'main' | null = null;
      let minDistance = Infinity;

      sections.forEach((section): void => {
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

    return (): void => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  const scrollToSection = (
    sectionRef: React.RefObject<HTMLDivElement>,
    tabValue: 'bun' | 'sauce' | 'main'
  ): void => {
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

  const handleBunClick = (): void => {
    scrollToSection(bunRef, 'bun');
  };

  const handleSauceClick = (): void => {
    scrollToSection(sauceRef, 'sauce');
  };

  const handleMainClick = (): void => {
    scrollToSection(mainRef, 'main');
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
            <Tab value="bun" active={activeTab === 'bun'} onClick={handleBunClick}>
              Булки
            </Tab>
            <Tab active={activeTab === 'sauce'} value="sauce" onClick={handleSauceClick}>
              Соусы
            </Tab>
            <Tab active={activeTab === 'main'} value="main" onClick={handleMainClick}>
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
