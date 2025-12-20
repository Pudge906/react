import {
  ConstructorElement,
  DragIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { moveIngredient, removeIngredient } from 'src/services/constructorSlice.js';

import styles from './burger-filling.module.css';

const DraggableConstructorElement = ({ ingredient, index }) => {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'constructor-ingredient',
    item: () => {
      console.log('Start dragging:', ingredient.name, 'from index:', index);
      return { index, id: ingredient.uniqueId };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        console.log('Drag cancelled - item returned');
      }
    },
  });

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: 'constructor-ingredient',
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      const isDraggingDown = dragIndex < hoverIndex;
      const isDraggingUp = !isDraggingDown;

      if (isDraggingDown && hoverClientY < hoverMiddleY) {
        return;
      }

      if (isDraggingUp && hoverClientY > hoverMiddleY) {
        return;
      }

      console.log(`Moving item from ${dragIndex} to ${hoverIndex}`);
      dispatch(
        moveIngredient({
          fromIndex: dragIndex,
          toIndex: hoverIndex,
        })
      );

      draggedItem.index = hoverIndex;
    },
    drop: () => {
      setIsHovered(false);
    },
  });

  drag(drop(ref));

  const handleRemove = () => {
    dispatch(removeIngredient(ingredient.uniqueId));
  };

  const opacity = isDragging ? 0.5 : 1;
  const backgroundColor = isOver ? '#2F2F37' : 'transparent';
  const transform = isDragging ? 'rotate(5deg)' : 'none';

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

export function BurgerFilling() {
  const ingredients = useSelector((state) => state.constructor?.ingredients) || [];

  return (
    <div className={styles.container}>
      <ul
        className={`${styles.main} ${ingredients.length === 0 ? styles.noScroll : ''}`}
      >
        {ingredients.length === 0 ? (
          <li className={styles.emptyPlaceholder}>Выберите начинку </li>
        ) : (
          ingredients.map((ingredient, index) => (
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
