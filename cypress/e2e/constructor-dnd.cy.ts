describe('Constructor Drag and Drop', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="ingredient-card"]', { timeout: 10000 }).should('exist');
  });

  it('should drag ingredient to constructor', () => {
    // Используем force: true для обхода проблем с видимостью
    cy.get('[data-testid="ingredient-card"][data-type="main"]')
      .first()
      .trigger('dragstart', { force: true, bubbles: true });
      
    cy.get('[data-testid="constructor-ingredients"]')
      .trigger('drop', { force: true, bubbles: true });
  });
});