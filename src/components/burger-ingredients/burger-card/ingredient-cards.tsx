import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { openIngredientModal } from '@services/ingredient_detailsSlice.ts';

import DraggableIngredient from '../DraggableIngredient.tsx';

import type { RootState } from '@services/store';

import style from './ingredient-cards.module.css';

type Ingredient = {
  _id: string;
  name: string;
  price: number;
  image: string;
  type: 'bun' | 'sauce' | 'main';
};

type ConstructorState = {
  bun?: Ingredient | null;
  ingredients: Ingredient[];
};

type IngredientCardsProps = {
  bunItems: Ingredient[];
  sauceItems: Ingredient[];
  mainItems: Ingredient[];
  bunRef: React.RefObject<HTMLDivElement>;
  sauceRef: React.RefObject<HTMLDivElement>;
  mainRef: React.RefObject<HTMLDivElement>;
  scrollContainerRef: React.RefObject<HTMLUListElement>;
};

export function IngredientCards(props: IngredientCardsProps): React.ReactElement {
  const {
    bunItems,
    sauceItems,
    mainItems,
    bunRef,
    sauceRef,
    mainRef,
    scrollContainerRef,
  } = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const constructorState = useSelector<RootState, ConstructorState>(
    (state) => state.constructor
  );

  const bun = constructorState.bun || null;
  const ingredients = constructorState.ingredients || [];

  const getIngredientCount = (ingredient: Ingredient): number => {
    if (!ingredient) return 0;

    if (ingredient.type === 'bun') {
      return bun && bun._id === ingredient._id ? 2 : 0;
    }

    if (!Array.isArray(ingredients)) return 0;

    return ingredients.filter((item) => item?._id === ingredient._id).length;
  };

  const handleIngredientClick = (ingredient: Ingredient) => {
    dispatch(openIngredientModal(ingredient));

    sessionStorage.setItem('ingredientModalData', JSON.stringify(ingredient));
    navigate(`/ingredients/${ingredient._id}`, { state: { background: location } });
  };

  const safeBunItems = Array.isArray(bunItems) ? bunItems : [];
  const safeSauceItems = Array.isArray(sauceItems) ? sauceItems : [];
  const safeMainItems = Array.isArray(mainItems) ? mainItems : [];

  return (
    <div>
      <ul ref={scrollContainerRef} className={`${style.main} custom-scroll`}>
        <div ref={bunRef}>
          <div className="text text_type_main-large">Булки</div>
          <div className={style.verticalBlock}>
            {safeBunItems.map((bun) => (
              <DraggableIngredient key={bun._id} ingredient={bun}>
                <li className={style.column} onClick={() => handleIngredientClick(bun)}>
                  {getIngredientCount(bun) > 0 && (
                    <div className={style.counter}>{getIngredientCount(bun)}</div>
                  )}
                  <img src={bun.image} alt={bun.name} />
                  <div className={style.price_cristal}>
                    <div className="text text_type_digits-default">{bun.price}</div>
                    <div>
                      <CurrencyIcon type="primary" />
                    </div>
                  </div>
                  <div className={`text text_type_main-default ${style.name}`}>
                    {bun.name}
                  </div>
                </li>
              </DraggableIngredient>
            ))}
          </div>
        </div>

        <div ref={sauceRef}>
          <div className="text text_type_main-large">Соусы</div>
          <div className={style.verticalBlock}>
            {safeSauceItems.map((sauce) => (
              <DraggableIngredient key={sauce._id} ingredient={sauce}>
                <li
                  className={style.column}
                  onClick={() => handleIngredientClick(sauce)}
                >
                  {getIngredientCount(sauce) > 0 && (
                    <div className={style.counter}>{getIngredientCount(sauce)}</div>
                  )}
                  <img src={sauce.image} alt={sauce.name} />
                  <div className={style.price_cristal}>
                    <div className="text text_type_digits-default">{sauce.price}</div>
                    <div>
                      <CurrencyIcon type="primary" />
                    </div>
                  </div>
                  <div className={`text text_type_main-default ${style.name}`}>
                    {sauce.name}
                  </div>
                </li>
              </DraggableIngredient>
            ))}
          </div>
        </div>

        <div ref={mainRef}>
          <div className="text text_type_main-large">Начинки</div>
          <div className={style.verticalBlock}>
            {safeMainItems.map((main) => (
              <DraggableIngredient key={main._id} ingredient={main}>
                <li className={style.column} onClick={() => handleIngredientClick(main)}>
                  {getIngredientCount(main) > 0 && (
                    <div className={style.counter}>{getIngredientCount(main)}</div>
                  )}
                  <img src={main.image} alt={main.name} />
                  <div className={style.price_cristal}>
                    <div className="text text_type_digits-default">{main.price}</div>
                    <div>
                      <CurrencyIcon type="primary" />
                    </div>
                  </div>
                  <div className={`text text_type_main-default ${style.name}`}>
                    {main.name}
                  </div>
                </li>
              </DraggableIngredient>
            ))}
          </div>
        </div>
      </ul>
    </div>
  );
}
