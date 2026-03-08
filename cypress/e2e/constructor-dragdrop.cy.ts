/// <reference types="cypress" />

describe('Конструктор: добавление ингредиентов', () => {
  beforeEach(() => {
    cy.visit('https://pudge906.github.io/react/');
    cy.wait(2000);
    
    // Игнорируем ошибки приложения
    Cypress.on('uncaught:exception', () => false);
  });

  it('должен добавлять ингредиент в конструктор через DnD', () => {
    // Находим ингредиент (первую ссылку)
    cy.get('a[href^="/ingredients/"]').first().as('ingredient');
    
    // Находим зону конструктора
    cy.get('section.burger-constructor').first().as('constructor');

    // Симуляция DnD
    cy.get('@ingredient').trigger('dragstart', { force: true, bubbles: true });
    cy.get('@constructor').trigger('drop', { force: true, bubbles: true });
    cy.get('@ingredient').trigger('dragend', { force: true });

    cy.wait(1000);

    // Проверяем, что ингредиент появился в конструкторе
    // (ищем по тексту, который должен был появиться)
    cy.get('@constructor').within(() => {
      cy.get('li', { timeout: 5000 }).should('have.length.at.least', 1);
    });
  });
});