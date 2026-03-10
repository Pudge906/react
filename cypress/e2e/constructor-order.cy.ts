/// <reference types="cypress" />

describe('Регистрация и оформление заказа', () => {
  beforeEach(() => {
    const timestamp = Date.now();
    Cypress.env('testEmail', `user_${timestamp}@test.com`);
    Cypress.env('testName', `User_${timestamp}`);
    
    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('drag') || err.message.includes('drop') || err.message.includes('hover')) {
        cy.log('⚠️ Поймана ошибка DnD:', err.message);
        return false;
      }
      return true;
    });
  });

  it('должен зарегистрироваться и оформить заказ', () => {
    // ===== 1. РЕГИСТРАЦИЯ =====
    cy.visit('/#/register');
    cy.wait(5000);
    
    cy.intercept('POST', '**/api/auth/register').as('registerRequest');

    cy.get('input[name="name"]', { timeout: 15000 }).should('be.visible').type(Cypress.env('testName'), { delay: 100 });
    cy.get('input[name="email"]', { timeout: 15000 }).should('be.visible').type(Cypress.env('testEmail'), { delay: 100 });
    cy.get('input[name="password"]', { timeout: 15000 }).should('be.visible').type('password123', { delay: 100 });
    cy.wait(1000);
    
    cy.get('button[type="submit"]', { timeout: 15000 }).contains('Зарегистрироваться').should('be.visible').click();

    cy.wait('@registerRequest', { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      
      const accessToken = interception.response?.body.accessToken;
      
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', accessToken);
      });
      
      cy.log('✅ Регистрация успешна, токен сохранен');
    });

    // ===== 2. ПЕРЕХОДИМ НА ГЛАВНУЮ =====
    cy.visit('/');
    cy.wait(5000);
    
    // НЕ перехватываем getUser, даем ему идти как есть
    // Просто ждем загрузки ингредиентов
    cy.intercept('GET', '**/api/ingredients').as('getIngredients');
    cy.wait('@getIngredients', { timeout: 30000 });
    
    cy.get('[class*="ingredient-cards__column"]', { timeout: 30000 }).should('be.visible');
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
    cy.get('[class*="ingredient-cards__column"]', { timeout: 30000 }).eq(4).as('sauce');
    cy.get('[class*="ingredient-cards__column"]', { timeout: 30000 }).first().as('bun');
    cy.get('[data-testid="drop-target"]', { timeout: 30000 }).first().as('dropTarget');
    cy.get('[data-testid="order-button"]', { timeout: 30000 }).as('orderButton');

    // ===== 5. ПЕРЕТАСКИВАЕМ СОУС =====
    cy.log('🔄 Перетаскиваем соус...');
    
    cy.get('@sauce').trigger('dragstart', { force: true, bubbles: true });
    cy.get('@dropTarget').trigger('drop', { force: true, bubbles: true });
    cy.get('@sauce').trigger('dragend', { force: true, bubbles: true });
    
    cy.wait(3000);

    // Проверяем, что кнопка все еще disabled (нет булки)
    cy.get('@orderButton', { timeout: 30000 }).should('be.disabled');
    cy.log('✅ Соус добавлен, кнопка disabled');

    // ===== 6. ПЕРЕТАСКИВАЕМ БУЛКУ =====
    cy.log('🔄 Перетаскиваем булку...');
    
    cy.get('@bun').trigger('dragstart', { force: true, bubbles: true });
    cy.get('@dropTarget').trigger('drop', { force: true, bubbles: true });
    cy.get('@bun').trigger('dragend', { force: true, bubbles: true });
    
    cy.wait(3000);

    // ===== 7. ПРОВЕРЯЕМ КНОПКУ =====
    cy.get('@orderButton', { timeout: 30000 }).should('not.be.disabled');
    cy.log('✅ Булка добавлена, кнопка активна');

    // ===== 8. ОФОРМЛЯЕМ ЗАКАЗ =====
    cy.get('@orderButton').click();
    cy.wait('@createOrder', { timeout: 30000 });

    // ===== 9. ПРОВЕРЯЕМ МОДАЛКУ =====
    cy.get('[class*="modal"]', { timeout: 30000 }).should('be.visible').as('orderModal');
    cy.get('@orderModal').contains('12345', { timeout: 15000 }).should('be.visible');
    cy.log('✅ Номер заказа 12345 отображается');

    // ===== 10. ЗАКРЫВАЕМ МОДАЛКУ =====
    cy.get('@orderModal').find('button').click({ force: true });
    cy.get('[class*="modal"]', { timeout: 30000 }).should('not.exist');
    cy.log('✅ Модальное окно закрыто');
  });
});