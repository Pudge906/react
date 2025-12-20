import { useDrag } from 'react-dnd';

const DraggableIngredient = ({ ingredient, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ingredient.type === 'bun' ? 'bun' : 'ingredient',
    item: () => {
      console.log('=== DRAG START ===');
      console.log('Dragging:', ingredient.name);
      console.log('Type:', ingredient.type);
      return ingredient;
    },

    end: (item, monitor) => {
      console.log('=== DRAG END ===');
      const dropResult = monitor.getDropResult();
      console.log('Drop result:', dropResult);
      console.log('Was dropped?', monitor.didDrop());
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
