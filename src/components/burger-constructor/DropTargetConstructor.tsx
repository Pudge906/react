import { useRef } from 'react';
import { useDrop } from 'react-dnd';

import { addIngredient, setBun } from '@services/constructor_slice.ts';
import { useAppDispatch } from '@services/hooks';

type DropItem = {
  _id: string;
  type: string;
  [key: string]: unknown;
};

const DropTargetConstructor: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const lastDropRef = useRef<{ _id: string; time: number } | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    DropItem,
    { name: string },
    { isOver: boolean; canDrop: boolean; itemType: string | null }
  >({
    accept: ['bun', 'ingredient'],
    drop: (item) => {
      const now = Date.now();
      if (
        lastDropRef.current &&
        lastDropRef.current._id === item._id &&
        now - lastDropRef.current.time < 1000
      ) {
        return { name: 'BurgerConstructor' };
      }

      lastDropRef.current = {
        _id: item._id,
        time: now,
      };

      if (!item) {
        return { name: 'BurgerConstructor' };
      }

      if (item.type === 'bun') {
        dispatch(setBun(item));
      } else {
        dispatch(addIngredient(item));
      }
      return { name: 'BurgerConstructor' };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      itemType: monitor.getItemType(),
    }),
  });

  const backgroundColor = isOver ? '#1C1C21' : 'transparent';
  const border = isOver ? '2px dashed #4C4CFF' : 'none';
  const padding = canDrop ? '2px' : '0';

  return (
    <div
      ref={drop}
      style={{
        backgroundColor,
        border,
        minHeight: '200px',
        borderRadius: '10px',
        transition: 'all 0.3s',
        padding,
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
      data-testid="drop-target"
    >
      {isOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(50, 76, 205, 0.02)',
            borderRadius: '10px',
            zIndex: 1,
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

export default DropTargetConstructor;