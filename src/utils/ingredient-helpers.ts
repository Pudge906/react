export type IngredientWithUniqueId = {
  uniqueId: string;
} & Ingredient;

export const createIngredientWithId = (
  ingredient: Omit<Ingredient, 'uniqueId'>
): IngredientWithUniqueId => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return {
    ...ingredient,
    uniqueId: `${ingredient._id}-${timestamp}-${random}`,
  };
};
