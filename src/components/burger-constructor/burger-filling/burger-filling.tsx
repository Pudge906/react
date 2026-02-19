import {
  ConstructorElement,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';

import { moveIngredient, removeIngredient } from '@services/constructor_slice.ts';

import type { RootState } from '@services/store';
import type { Identifier } from 'dnd-core';

import styles from './burger-filling.module.css';

// ==================== ТИПЫ ====================
interface Ingredient {
  uniqueId: string;
  name: string;
  price: number;
  image: string;
}

interface DraggableItem {
  index: number;
  id: string;
}

// Тип для результата drop операции (не используется, но нужен для типизации)
type DropResult = Record<string, never>; // Пустой объект, но не any

interface DragCollectedProps {
  isDragging: boolean;
}

interface DropCollectedProps {
  handlerId: Identifier | null;
  isOver: boolean;
  canDrop: boolean;
}

// ==================== КОМПОНЕНТ ДЛЯ ПЕРЕТАСКИВАЕМОГО ЭЛЕМЕНТА ====================
const DraggableConstructorElement: React.FC<{
  ingredient: Ingredient;
  index: number;
}> = ({ ingredient, index }): React.ReactElement => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLLIElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Настройка drag
  const [{ isDragging }, drag] = useDrag<
    DraggableItem,
    DropResult,
    DragCollectedProps
  >({
    type: 'constructor-ingredient',
    item: (): DraggableItem => {
      return { index, id: ingredient.uniqueId };
    },
    collect: (monitor): DragCollectedProps => ({
      isDragging: monitor.isDragging(),
    }),
    // Пустой end метод (не используется)
    end: (): void => {
      // Ничего не делаем
    },
  });

  // Настройка drop
  const [{ handlerId, isOver }, drop] = useDrop<
    DraggableItem,
    DropResult,
    DropCollectedProps
  >({
    accept: 'constructor-ingredient',
    collect: (monitor): DropCollectedProps => ({
      handlerId: monitor.getHandlerId(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (draggedItem: DraggableItem, monitor): void => {
      if (!ref.current) {
        return;
      }

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      // Не перетаскиваем элемент на свое место
      if (dragIndex === hoverIndex) {
        return;
      }

      // Определяем позицию для вставки
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Перетаскивание вниз
      const isDraggingDown = dragIndex < hoverIndex;
      if (isDraggingDown && hoverClientY < hoverMiddleY) {
        return;
      }

      // Перетаскивание вверх
      const isDraggingUp = dragIndex > hoverIndex;
      if (isDraggingUp && hoverClientY > hoverMiddleY) {
        return;
      }

      // Перемещаем элемент
      dispatch(
        moveIngredient({
          fromIndex: dragIndex,
          toIndex: hoverIndex,
        })
      );

      // Обновляем индекс перетаскиваемого элемента
      draggedItem.index = hoverIndex;
    },
    drop: (): DropResult => {
      setIsHovered(false);
      return {}; // Возвращаем пустой объект как результат
    },
  });

  // Объединяем drag и drop рефы
  drag(drop(ref));

  /**
   * Удаление ингредиента
   */
  const handleRemove = (): void => {
    dispatch(removeIngredient(ingredient.uniqueId));
  };

  // Стили для перетаскиваемого элемента
  const opacity: number = isDragging ? 0.5 : 1;
  const backgroundColor: string = isOver ? '#2F2F37' : 'transparent';
  const transform: string = isDragging ? 'rotate(5deg)' : 'none';

  return (
    <li
      ref={ref}
      className={styles.ingredientItem}
      style={{
        opacity,
        backgroundColor,
        transform,
        transition: 'all 0.2s ease',
      }}
      data-handler-id={handlerId}
      onMouseEnter={(): void => setIsHovered(true)}
      onMouseLeave={(): void => setIsHovered(false)}
    >
      <div className={styles.dragWrapper}>
        <DragIcon type="primary" />
      </div>
      <ConstructorElement
        text={ingredient.name}
        price={ingredient.price}
        thumbnail={ingredient.image}
        handleClose={handleRemove}
      />
      {isHovered && !isDragging && <div className={styles.hoverIndicator} />}
    </li>
  );
};

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================
export function BurgerFilling(): React.ReactElement {
  const ingredients =
    useSelector((state: RootState) => state.constructor?.ingredients) || [];

  return (
    <div className={styles.container}>
      <ul
        className={`${styles.main} ${ingredients.length === 0 ? styles.noScroll : ''}`}
      >
        {ingredients.length === 0 ? (
          <li className={styles.emptyPlaceholder}>Перетащите сюда начинки и соусы</li>
        ) : (
          ingredients.map((ingredient: Ingredient, index: number): React.ReactElement => (
            <DraggableConstructorElement
              key={ingredient.uniqueId}
              ingredient={ingredient}
              index={index}
            />
          ))
        )}
      </ul>
    </div>
  );
}