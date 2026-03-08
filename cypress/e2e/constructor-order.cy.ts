/// <reference types="cypress" />

describe('Конструктор: оформление заказа', () => {
  beforeEach(() => {
    // 1. Подставляем фейковый токен авторизации (обязательно, так как API требует авторизации)
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'Bearer fake-token');
    });

    // 2. Мокаем запрос на создание заказа, так как реальный API может не работать в тестах
    cy.intercept('POST', '**/api/orders', {
      statusCode: 200,
      body: {
        success: true,
        order: { number: 12345 }
      }
    }).as('createOrder');

    // 3. Посещаем страницу и ждем загрузки
    cy.visit('https://pudge906.github.io/react/');
    cy.get('[class^=BurgerIngredients_ingredients]', { timeout: 10000 }).should('be.visible');
    cy.wait(2000);
    Cypress.on('uncaught:exception', () => false);
  });

  it('должен оформлять заказ с добавленными ингредиентами', () => {
    // Находим элементы для DnD
    cy.get('[class^=BurgerIngredients_ingredient]').first().as('ingredient1');
    cy.get('[class^=BurgerIngredients_ingredient]').eq(1).as('ingredient2');
    cy.get('[class^=BurgerConstructor_burgerConstructor]').first().as('constructor');
    cy.get('button:contains("Оформить заказ")').as('orderButton');

    // 1. Добавляем ингредиенты в конструктор
    // Первый ингредиент
    cy.get('@ingredient1').trigger('dragstart', { force: true, bubbles: true });
    cy.get('@constructor').trigger('drop', { force: true, bubbles: true });
    cy.get('@ingredient1').trigger('dragend', { force: true });
    cy.wait(500);
    // Второй ингредиент
    cy.get('@ingredient2').trigger('dragstart', { force: true, bubbles: true });
    cy.get('@constructor').trigger('drop', { force: true, bubbles: true });
    cy.get('@ingredient2').trigger('dragend', { force: true });

    cy.wait(1000);

    // 2. Оформляем заказ
    cy.get('@orderButton').click();

    // 3. Проверяем модальное окно с заказом и номер
    cy.wait('@createOrder');
    cy.get('[class^=Modal_modal]', { timeout: 8000 }).should('be.visible').as('orderModal');
    cy.get('@orderModal').contains('12345').should('be.visible');

    // 4. Закрываем модальное окно
    cy.get('@orderModal').find('button[class*=modalClose]').click({ force: true });
    cy.get('[class^=Modal_modal]').should('not.exist');

    // 5. Проверяем, что конструктор очистился (опционально)
    cy.wait(1000);
    cy.get('@constructor').find('li').should('have.length', 0);
  });
});