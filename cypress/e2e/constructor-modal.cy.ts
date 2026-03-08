/// <reference types="cypress" />

describe('Конструктор: модальное окно ингредиента', () => {
  beforeEach(() => {
    cy.visit('https://pudge906.github.io/react/');
    cy.wait(2000);
    Cypress.on('uncaught:exception', () => false);
  });

  it('должен открывать и закрывать модальное окно с данными ингредиента', () => {
    // Находим первый ингредиент и запоминаем его название
    cy.get('a[href^="/ingredients/"]').first().within(() => {
      cy.get('p.text.text_type_main-default.mb-2').invoke('text').as('ingredientName');
    });

    // Кликаем по ингредиенту
    cy.get('a[href^="/ingredients/"]').first().click();

    // Проверяем, что модальное окно открылось
    cy.get('div[class^=modal]', { timeout: 8000 }).should('be.visible').as('modal');

    // Проверяем, что название ингредиента совпадает
    cy.get('@ingredientName').then((name) => {
      cy.get('@modal').contains(name).should('be.visible');
    });

    // Закрываем модалку через кнопку
    cy.get('@modal').find('button.modal-close').click();
    
    // Проверяем, что модалка закрылась
    cy.get('div[class^=modal]').should('not.exist');
  });
});