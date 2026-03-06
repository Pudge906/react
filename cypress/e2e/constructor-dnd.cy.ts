describe('Constructor Drag and Drop', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/ingredients', { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('should drag ingredient to constructor', () => {
    // Перетаскиваем ингредиент
    cy.get('[data-testid="ingredient-card"][data-type="main"]')
      .first()
      .trigger('dragstart');
    cy.get('[data-testid="constructor-ingredients"]').trigger('drop');

    // Проверяем результат
    cy.get('[data-testid="constructor-ingredients"]').should('not.be.empty');
    cy.get('[data-testid="order-button"]').should('be.visible');
  });
});