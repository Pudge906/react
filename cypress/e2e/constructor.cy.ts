/// <reference types="cypress" />

describe('Constructor Page', () => {
  beforeEach(() => {
    cy.visit('/');
    // Перехватываем запрос к API ингредиентов
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.wait('@getIngredients');
  });

  describe('Drag and Drop', () => {
    it('should drag and drop ingredient to constructor', () => {
      // Находим ингредиент и перетаскиваем в конструктор
      cy.get('[data-cy=ingredient-item]').first().as('ingredient');
      cy.get('[data-cy=constructor-drop-area]').as('dropArea');

      cy.get('@ingredient').trigger('dragstart');
      cy.get('@dropArea').trigger('drop');
      cy.get('@ingredient').trigger('dragend');

      // Проверяем, что ингредиент появился в конструкторе
      cy.get('[data-cy=constructor-item]').should('exist');
    });
  });

  describe('Ingredient Modal', () => {
    it('should open ingredient details modal', () => {
      // Кликаем на ингредиент
      cy.get('[data-cy=ingredient-item]').first().click();

      // Проверяем, что модальное окно открылось
      cy.get('[data-cy=ingredient-modal]').should('be.visible');
      cy.get('[data-cy=modal-overlay]').should('be.visible');
    });

    it('should display correct ingredient data in modal', () => {
      // Сохраняем данные ингредиента
      cy.get('[data-cy=ingredient-item]').first().within(() => {
        cy.get('[data-cy=ingredient-name]').invoke('text').as('expectedName');
        cy.get('[data-cy=ingredient-price]').invoke('text').as('expectedPrice');
      });

      // Открываем модальное окно
      cy.get('[data-cy=ingredient-item]').first().click();

      // Проверяем, что данные совпадают
      cy.get('@expectedName').then((expectedName) => {
        cy.get('[data-cy=modal-ingredient-name]').should('have.text', expectedName);
      });

      cy.get('@expectedPrice').then((expectedPrice) => {
        cy.get('[data-cy=modal-ingredient-price]').should('contain', expectedPrice);
      });
    });

    it('should close modal when clicking close button', () => {
      // Открываем модальное окно
      cy.get('[data-cy=ingredient-item]').first().click();
      cy.get('[data-cy=ingredient-modal]').should('be.visible');

      // Закрываем через кнопку
      cy.get('[data-cy=modal-close-button]').click();
      cy.get('[data-cy=ingredient-modal]').should('not.exist');
    });

    it('should close modal when clicking overlay', () => {
      // Открываем модальное окно
      cy.get('[data-cy=ingredient-item]').first().click();
      cy.get('[data-cy=ingredient-modal]').should('be.visible');

      // Закрываем через оверлей
      cy.get('[data-cy=modal-overlay]').click({ force: true });
      cy.get('[data-cy=ingredient-modal]').should('not.exist');
    });

    it('should close modal when pressing Escape', () => {
      // Открываем модальное окно
      cy.get('[data-cy=ingredient-item]').first().click();
      cy.get('[data-cy=ingredient-modal]').should('be.visible');

      // Нажимаем Escape
      cy.get('body').type('{esc}');
      cy.get('[data-cy=ingredient-modal]').should('not.exist');
    });
  });

  describe('Order Modal', () => {
    it('should open order modal after clicking order button', () => {
      // Добавляем булку
      cy.get('[data-cy=bun-ingredient]').first().trigger('dragstart');
      cy.get('[data-cy=constructor-drop-area]').trigger('drop');
      cy.get('[data-cy=bun-ingredient]').first().trigger('dragend');

      // Добавляем начинку
      cy.get('[data-cy=main-ingredient]').first().trigger('dragstart');
      cy.get('[data-cy=constructor-drop-area]').trigger('drop');
      cy.get('[data-cy=main-ingredient]').first().trigger('dragend');

      // Перехватываем запрос на создание заказа
      cy.intercept('POST', '**/api/orders', {
        statusCode: 200,
        body: {
          success: true,
          order: {
            number: 12345,
          },
        },
      }).as('createOrder');

      // Нажимаем кнопку оформления заказа
      cy.get('[data-cy=order-button]').click();

      // Проверяем, что модальное окно заказа открылось
      cy.wait('@createOrder');
      cy.get('[data-cy=order-modal]').should('be.visible');
      cy.get('[data-cy=order-number]').should('contain', '12345');
    });

    it('should close order modal after clicking close button', () => {
      // Добавляем булку и начинку
      cy.get('[data-cy=bun-ingredient]').first().trigger('dragstart');
      cy.get('[data-cy=constructor-drop-area]').trigger('drop');
      cy.get('[data-cy=main-ingredient]').first().trigger('dragstart');
      cy.get('[data-cy=constructor-drop-area]').trigger('drop');

      cy.intercept('POST', '**/api/orders', {
        statusCode: 200,
        body: {
          success: true,
          order: {
            number: 12345,
          },
        },
      }).as('createOrder');

      cy.get('[data-cy=order-button]').click();
      cy.wait('@createOrder');
      cy.get('[data-cy=order-modal]').should('be.visible');

      // Закрываем модальное окно
      cy.get('[data-cy=modal-close-button]').click();
      cy.get('[data-cy=order-modal]').should('not.exist');
    });
  });
});