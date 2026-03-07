/// <reference types="cypress" />

describe('Constructor Page', () => {
  beforeEach(() => {
    // Авторизация
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'Bearer fake-token');
      win.localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    cy.visit('/');
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.wait('@getIngredients');
    
    Cypress.on('uncaught:exception', () => false);
  });

  describe('Drag and Drop', () => {
    it('should debug drag and drop', () => {
      cy.get('[class*="constructor"]').first().as('constructor');
      
      // Запоминаем состояние ДО
      cy.get('@constructor').within(() => {
        cy.get('*').then($els => {
          cy.log(`🏗️ Элементов в конструкторе ДО: ${$els.length}`);
        });
      });

      // Пробуем перетащить начинку
      cy.log('🔄 Перетаскиваем начинку...');
      cy.contains('Филе Люминесцентного тетраодонтимформа').trigger('dragstart', { 
        force: true, 
        bubbles: true,
        eventConstructor: 'DragEvent' 
      });
      
      cy.get('@constructor').trigger('drop', { 
        force: true, 
        bubbles: true,
        eventConstructor: 'DragEvent'
      });
      
      cy.wait(1000);

      // Проверяем состояние ПОСЛЕ начинки
      cy.get('@constructor').within(() => {
        cy.get('*').then($els => {
          cy.log(`🏗️ Элементов в конструкторе после начинки: ${$els.length}`);
          cy.log('📝 Текст в конструкторе:');
          $els.each((i, el) => {
            if (el.textContent && el.textContent.trim()) {
              cy.log(`  ${i}: "${el.textContent.trim()}"`);
            }
          });
        });
      });

      // Перетаскиваем булку
      cy.log('🔄 Перетаскиваем булку...');
      cy.contains('Флюоресцентная булка R2-D3').trigger('dragstart', { 
        force: true, 
        bubbles: true,
        eventConstructor: 'DragEvent'
      });
      
      cy.get('@constructor').trigger('drop', { 
        force: true, 
        bubbles: true,
        eventConstructor: 'DragEvent'
      });
      
      cy.wait(1000);

      // Проверяем состояние ПОСЛЕ булки
      cy.get('@constructor').within(() => {
        cy.get('*').then($els => {
          cy.log(`🏗️ Элементов в конструкторе после булки: ${$els.length}`);
          cy.log('📝 Текст в конструкторе:');
          $els.each((i, el) => {
            if (el.textContent && el.textContent.trim()) {
              cy.log(`  ${i}: "${el.textContent.trim()}"`);
            }
          });
        });
      });

      // Проверяем кнопку
      cy.get('[data-testid="order-button"]').then($btn => {
        cy.log(`🔘 Кнопка: ${$btn.prop('disabled') ? '❌ disabled' : '✅ active'}`);
      });
    });
  });
});