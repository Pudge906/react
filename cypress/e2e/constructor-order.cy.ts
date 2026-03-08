/// <reference types="cypress" />

describe('Регистрация и оформление заказа', () => {
  beforeEach(() => {
    const timestamp = Date.now();
    Cypress.env('testEmail', `user_${timestamp}@test.com`);
    Cypress.env('testName', `User_${timestamp}`);
  });

  it('должен зарегистрироваться и оформить заказ', () => {
    // ===== 1. РЕГИСТРАЦИЯ =====
    cy.visit('/#/register');
    
    // Ждем, пока страница полностью загрузится
    cy.wait(2000);
    
    cy.intercept('POST', '**/api/auth/register').as('registerRequest');

    // Разбиваем на отдельные шаги с проверками
    cy.get('input[name="name"]').should('be.visible').type(Cypress.env('testName'), { delay: 100 });
    cy.get('input[name="email"]').should('be.visible').type(Cypress.env('testEmail'), { delay: 100 });
    cy.get('input[name="password"]').should('be.visible').type('password123', { delay: 100 });
    
    // Добавляем небольшую задержку перед кликом
    cy.wait(500);
    
    cy.get('button[type="submit"]').contains('Зарегистрироваться').should('be.visible').click();

    cy.wait('@registerRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      
      const accessToken = interception.response?.body.accessToken;
      const refreshToken = interception.response?.body.refreshToken;
      
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', accessToken);
        win.localStorage.setItem('refreshToken', refreshToken);
      });
      
      cy.log('✅ Регистрация успешна, токен сохранен');
    });

    // ===== 2. ПЕРЕХОДИМ НА ГЛАВНУЮ =====
    cy.visit('/');
    cy.get('.ingredient-cards__column_346f4', { timeout: 10000 }).should('be.visible');
    cy.log('✅ На главной странице, ингредиенты загружены');

    // ===== 3. ПОДГОТОВКА К ЗАКАЗУ =====
    cy.intercept('POST', '**/api/orders', {
      statusCode: 200,
      body: {
        success: true,
        order: { number: 12345 }
      }
    }).as('createOrder');

    // ===== 4. ВЫБИРАЕМ ИНГРЕДИЕНТЫ =====
    // Ждем загрузки ингредиентов
    cy.get('.ingredient-cards__column_346f4', { timeout: 10000 }).should('have.length.at.least', 2);
    
    cy.get('.ingredient-cards__column_346f4').first().as('bun');
    cy.get('.ingredient-cards__column_346f4').eq(1).as('main');
    cy.get('.burger-constructor__burger_constructor_6e39f').first().as('constructor');
    cy.get('[data-testid="order-button"]').as('orderButton');

    // ===== 5. ПЕРЕТАСКИВАЕМ ИНГРЕДИЕНТЫ =====
    cy.log('🔄 Перетаскиваем начинку...');
    
    cy.get('@main').then($main => {
      const dataTransfer = new DataTransfer();
      
      cy.wrap($main).trigger('dragstart', {
        dataTransfer,
        force: true,
        bubbles: true
      });
      
      cy.get('@constructor').trigger('drop', {
        dataTransfer,
        force: true,
        bubbles: true
      });
      
      cy.wrap($main).trigger('dragend', { force: true });
    });
    
    cy.wait(1000);

    cy.log('🔄 Перетаскиваем булку...');
    
    cy.get('@bun').then($bun => {
      const dataTransfer = new DataTransfer();
      
      cy.wrap($bun).trigger('dragstart', {
        dataTransfer,
        force: true,
        bubbles: true
      });
      
      cy.get('@constructor').trigger('drop', {
        dataTransfer,
        force: true,
        bubbles: true
      });
      
      cy.wrap($bun).trigger('dragend', { force: true });
    });
    
    cy.wait(1000);

    // ===== 6. ПРОВЕРЯЕМ КНОПКУ =====
    cy.get('@orderButton').should('not.be.disabled');
    cy.log('✅ Кнопка заказа активна');

    // ===== 7. ОФОРМЛЯЕМ ЗАКАЗ =====
    cy.get('@orderButton').click();
    cy.wait('@createOrder');

    // ===== 8. ПРОВЕРЯЕМ МОДАЛКУ =====
    cy.get('[class*="modal"]', { timeout: 8000 }).should('be.visible').as('orderModal');
    cy.get('@orderModal').contains('12345').should('be.visible');
    cy.log('✅ Номер заказа 12345 отображается');

    // ===== 9. ЗАКРЫВАЕМ МОДАЛКУ =====
    cy.get('@orderModal').find('button').click({ force: true });
    cy.get('[class*="modal"]').should('not.exist');
    cy.log('✅ Модальное окно закрыто');
  });
});