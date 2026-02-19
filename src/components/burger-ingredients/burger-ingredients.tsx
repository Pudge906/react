import { Preloader, Tab } from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { IngredientCards } from '@components/burger-ingredients/burger-card/ingredient-cards';

import styles from './burger-ingredients.module.css';

// ==================== ТИПЫ ====================
interface Ingredient {
  _id: string;
  name: string;
  price: number;
  image: string;
  type: 'bun' | 'sauce' | 'main';
}

interface IngredientsState {
  items: Ingredient[];
  bun: Ingredient[];
  sauce: Ingredient[];
  main: Ingredient[];
  loading: boolean;
  error: string | null;
}

interface RootState {
  ingredients: IngredientsState;
}

type TabType = 'bun' | 'sauce' | 'main';

interface Section {
  id: TabType;
  ref: React.RefObject<HTMLDivElement>;
}

// ==================== КОМПОНЕНТ ====================
export const BurgerIngredients: React.FC = (): React.ReactElement => {
  const {
    items: allIngredients,
    bun,
    sauce,
    main,
    loading,
    error,
  } = useSelector((state: RootState): IngredientsState => state.ingredients);

  const bunRef = useRef<HTMLDivElement>(null);
  const sauceRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('bun');

  // Обновление активного таба при скролле
  useEffect((): (() => void) => {
    const container = scrollContainerRef.current;
    if (!container) return (): void => {};

    const handleScroll = (): void => {
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;

      const sections: Section[] = [
        { id: 'bun', ref: bunRef },
        { id: 'sauce', ref: sauceRef },
        { id: 'main', ref: mainRef },
      ];

      let closestSection: TabType | null = null;
      let minDistance = Infinity;

      sections.forEach((section: Section): void => {
        if (section.ref.current) {
          const sectionElement = section.ref.current;
          const sectionRect = sectionElement.getBoundingClientRect();

          const distance = Math.abs(sectionRect.top - containerTop);

          const isVisible =
            sectionRect.bottom > containerTop && 
            sectionRect.top < containerRect.bottom;

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

    // Первоначальный вызов для установки активного таба
    handleScroll();

    // Очистка обработчика
    return (): void => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  /**
   * Прокрутка к выбранной секции
   */
  const scrollToSection = (
    sectionRef: React.RefObject<HTMLDivElement>,
    tabValue: TabType
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

  // Состояние загрузки
  if (loading) {
    return <Preloader />;
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="text text_type_main-medium p-10 text_color_error">
        Ошибка: {error}
      </div>
    );
  }

  // Нет данных
  if (!allIngredients || allIngredients.length === 0) {
    return (
      <div className="text text_type_main-medium p-10">
        Ингредиенты не найдены
      </div>
    );
  }

  // Основной рендер
  return (
    <div className={`pl-1 pr-1 pb-1 pt-1 ${styles.verticalBlock}`}>
      <section className={styles.burger_ingredients}>
        <nav>
          <ul className={styles.menu}>
            <Tab
              value="bun"
              active={activeTab === 'bun'}
              onClick={(): void => scrollToSection(bunRef, 'bun')}
            >
              Булки
            </Tab>
            <Tab
              value="sauce"
              active={activeTab === 'sauce'}
              onClick={(): void => scrollToSection(sauceRef, 'sauce')}
            >
              Соусы
            </Tab>
            <Tab
              value="main"
              active={activeTab === 'main'}
              onClick={(): void => scrollToSection(mainRef, 'main')}
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