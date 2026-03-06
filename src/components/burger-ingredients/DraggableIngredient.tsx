import { useDrag } from 'react-dnd';

import { createIngredientWithId } from '@utils/ingredient-helpers.ts';

type Ingredient = {
  type: 'bun' | 'sauce' | 'main';
  [key: string]: unknown;
};

type DraggableItem = {
  type: string;
  [key: string]: unknown;
};

type DragCollectedProps = {
  isDragging: boolean;
};

const DraggableIngredient: React.FC<{
  ingredient: Ingredient;
  children: React.ReactNode;
}> = ({ ingredient, children }) => {
  const [{ isDragging }, drag] = useDrag<DraggableItem, void, DragCollectedProps>({
    type: ingredient.type === 'bun' ? 'bun' : 'ingredient',
    item: () => {
      const ingredientWithId = createIngredientWithId(ingredient);
      return ingredientWithId;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default DraggableIngredient;
