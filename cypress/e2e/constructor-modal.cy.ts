/// <reference types="cypress" />

describe('Конструктор: модальное окно ингредиента', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('GET', '**/api/ingredients').as('getIngredients');
    cy.wait('@getIngredients');
    cy.get('.ingredient-cards__column_346f4', { timeout: 10000 }).should('be.visible');
    Cypress.on('uncaught:exception', () => false);
  });

  it('должен открывать и закрывать модальное окно с данными ингредиента', () => {
    // Запоминаем название первого ингредиента
    cy.get('.ingredient-cards__column_346f4').first().within(() => {
      cy.get('.ingredient-cards__name_18496').invoke('text').as('ingredientName');
    });

    // Кликаем по ингредиенту
    cy.get('.ingredient-cards__column_346f4').first().click();

    // Проверяем, что модальное окно открылось
    cy.get('[class*="modal"]', { timeout: 8000 }).should('be.visible').as('modal');

    // Проверяем только название в модалке
    cy.get('@ingredientName').then((name) => {
      cy.get('@modal').contains(name).should('be.visible');
    });

    // Закрываем модалку через кнопку закрытия
    cy.get('@modal').find('button').click({ force: true });
    cy.get('[class*="modal"]').should('not.exist');
  });
});