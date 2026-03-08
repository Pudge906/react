/// <reference types="cypress" />

describe('Конструктор: добавление ингредиентов', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('GET', '**/api/ingredients').as('getIngredients');
    cy.wait('@getIngredients');
    cy.get('.ingredient-cards__column_346f4', { timeout: 10000 }).should('be.visible');
    Cypress.on('uncaught:exception', () => false);
  });

  it('должен добавлять ингредиент в конструктор через DnD', () => {
    // Находим первый ингредиент в колонке
    cy.get('.ingredient-cards__column_346f4').first().as('ingredient');
    cy.get('.burger-constructor__burger_constructor_6e39f').first().as('constructor');

    // Симуляция DnD
    cy.get('@ingredient').trigger('dragstart', { 
      dataTransfer: new DataTransfer(), 
      force: true, 
      bubbles: true 
    });
    cy.get('@constructor').trigger('drop', { force: true, bubbles: true });
    cy.get('@ingredient').trigger('dragend', { force: true });

    // Проверяем, что ингредиент появился в конструкторе
    cy.get('@constructor').find('li', { timeout: 5000 }).should('have.length.at.least', 1);
  });
});