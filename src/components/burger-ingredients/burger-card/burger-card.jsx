import { CurrencyIcon } from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';

import IngredientDetails from '@components/Modal/ingredient-details.jsx';
import Modal from '@components/Modal/Modal.jsx';

import style from './burger-card.module.css';

export function IngredientList(props) {
  const { ingredients, bunRef, sauceRef, mainRef, scrollContainerRef } = props;

  const buns = ingredients.filter((ingredient) => ingredient.type === 'bun');
  const sauces = ingredients.filter((ingredient) => ingredient.type === 'sauce');
  const mains = ingredients.filter((ingredient) => ingredient.type === 'main');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredient, setIngredient] = useState(null);

  const getModalOverlay = (ingredient) => {
    setIsModalOpen(true);
    setIngredient(ingredient);
  };

  return (
    <div>
      <ul ref={scrollContainerRef} className={`${style.main} custom-scroll `}>
        <div ref={bunRef}>
          <div className="text text_type_main-large">Булки</div>
          <div className={style.unit}>
            {buns.map((bun) => (
              <li
                key={bun._id}
                className={style.column}
                onClick={() => {
                  setIngredient(bun);
                  getModalOverlay(bun);
                }}
              >
                {<img src={bun.image} alt="bun" />}
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
            ))}
          </div>
        </div>

        <div ref={sauceRef}>
          <div className={`text text_type_main-large`}>Соусы</div>
          <div className={style.unit}>
            {sauces.map((sauce) => (
              <li
                key={sauce._id}
                className={`pl-1 pr-1 pb-1 pt-1 ${style.column}`}
                onClick={() => {
                  setIngredient(sauce);
                  getModalOverlay(sauce);
                }}
              >
                {<img src={sauce.image} alt="sauce" />}
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
            ))}
          </div>
        </div>

        <div ref={mainRef}>
          <div className="text text_type_main-large">Начинки</div>
          <div className={style.unit}>
            {mains.map((main) => (
              <li
                key={main._id}
                className={`pl-1 pr-1 pb-1 pt-1 ${style.column}`}
                onClick={() => {
                  setIngredient(main);
                  getModalOverlay(main);
                }}
              >
                {<img src={main.image} alt="main" />}
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
            ))}
          </div>
        </div>
      </ul>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <IngredientDetails ingredient={ingredient} />
        </Modal>
      )}
    </div>
  );
}
