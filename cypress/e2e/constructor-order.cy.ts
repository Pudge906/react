/// <reference types="cypress" />

describe('Регистрация и оформление заказа', () => {
  beforeEach(() => {
    const timestamp = Date.now();
    Cypress.env('testEmail', `user_${timestamp}@test.com`);
    Cypress.env('testName', `User_${timestamp}`);
    
    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('drag') || err.message.includes('drop')) {
        cy.log('⚠️ Поймана ошибка DnD:', err.message);
        return false;
      }
      return true;
    });
  });

  it('должен зарегистрироваться и оформить заказ', () => {
    // ===== 1. РЕГИСТРАЦИЯ =====
    cy.visit('/#/register');
    cy.wait(2000);
    
    cy.intercept('POST', '**/api/auth/register').as('registerRequest');

    cy.get('input[name="name"]').should('be.visible').type(Cypress.env('testName'), { delay: 100 });
    cy.get('input[name="email"]').should('be.visible').type(Cypress.env('testEmail'), { delay: 100 });
    cy.get('input[name="password"]').should('be.visible').type('password123', { delay: 100 });
    cy.wait(500);
    
    cy.get('button[type="submit"]').contains('Зарегистрироваться').should('be.visible').click();

    cy.wait('@registerRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      
      const accessToken = interception.response?.body.accessToken;
      
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', accessToken);
      });
      
      cy.log('✅ Регистрация успешна, токен сохранен');
    });

    // ===== 2. ПЕРЕХОДИМ НА ГЛАВНУЮ =====
    cy.visit('/');
    
    cy.intercept('GET', '**/api/auth/user', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          email: Cypress.env('testEmail'),
          name: Cypress.env('testName')
        }
      }
    }).as('getUser');

    cy.wait('@getUser');
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
    cy.get('.ingredient-cards__column_346f4').eq(4).as('sauce'); // Соус (индекс 4)
    cy.get('.ingredient-cards__column_346f4').first().as('bun'); // Булка (индекс 0)
    cy.get('[data-testid="drop-target"]').first().as('dropTarget');
    cy.get('[data-testid="order-button"]').as('orderButton');

    // ===== 5. ПЕРЕТАСКИВАЕМ СОУС =====
    cy.log('🔄 Перетаскиваем соус...');
    
    const dataTransferSauce = new DataTransfer();
    
    cy.get('@sauce')
      .trigger('dragstart', {
        dataTransfer: dataTransferSauce,
        force: true,
        bubbles: true
      })
      .trigger('drag', {
        force: true,
        bubbles: true
      });
    
    cy.wait(500);
    
    cy.get('@dropTarget')
      .trigger('dragenter', {
        dataTransfer: dataTransferSauce,
        force: true,
        bubbles: true
      })
      .trigger('dragover', {
        dataTransfer: dataTransferSauce,
        force: true,
        bubbles: true
      })
      .trigger('drop', {
        dataTransfer: dataTransferSauce,
        force: true,
        bubbles: true
      });
    
    cy.get('@sauce').trigger('dragend', { force: true, bubbles: true });
    
    cy.wait(1000);

    // Проверяем, что кнопка все еще disabled (нет булки)
    cy.get('@orderButton').should('be.disabled');
    cy.log('✅ Соус добавлен, кнопка disabled (ждем булку)');

    // ===== 6. ПЕРЕТАСКИВАЕМ БУЛКУ =====
    cy.log('🔄 Перетаскиваем булку...');
    
    const dataTransferBun = new DataTransfer();
    
    cy.get('@bun')
      .trigger('dragstart', {
        dataTransfer: dataTransferBun,
        force: true,
        bubbles: true
      })
      .trigger('drag', {
        force: true,
        bubbles: true
      });
    
    cy.wait(500);
    
    cy.get('@dropTarget')
      .trigger('dragenter', {
        dataTransfer: dataTransferBun,
        force: true,
        bubbles: true
      })
      .trigger('dragover', {
        dataTransfer: dataTransferBun,
        force: true,
        bubbles: true
      })
      .trigger('drop', {
        dataTransfer: dataTransferBun,
        force: true,
        bubbles: true
      });
    
    cy.get('@bun').trigger('dragend', { force: true, bubbles: true });
    
    cy.wait(1000);

    // ===== 7. ПРОВЕРЯЕМ КНОПКУ =====
    cy.get('@orderButton').should('not.be.disabled');
    cy.log('✅ Булка добавлена, кнопка активна');

    // ===== 8. ОФОРМЛЯЕМ ЗАКАЗ =====
    cy.get('@orderButton').click();
    cy.wait('@createOrder', { timeout: 10000 });

    // ===== 9. ПРОВЕРЯЕМ МОДАЛКУ =====
    cy.get('[class*="modal"]', { timeout: 8000 }).should('be.visible').as('orderModal');
    cy.get('@orderModal').contains('12345').should('be.visible');
    cy.log('✅ Номер заказа 12345 отображается');

    // ===== 10. ЗАКРЫВАЕМ МОДАЛКУ =====
    cy.get('@orderModal').find('button').click({ force: true });
    cy.get('[class*="modal"]').should('not.exist');
    cy.log('✅ Модальное окно закрыто');
  });
});