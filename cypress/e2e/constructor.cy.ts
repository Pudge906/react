describe('Страница «Конструктор»', () => {
  beforeEach(() => {
    // 1. Подставляем токены авторизации в localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'Bearer fake-token');
      win.localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    // 2. Замокаем запрос на получение ингредиентов
    cy.intercept('GET', '**/api/ingredients', { 
      fixture: 'ingredients.json',
      statusCode: 200 
    }).as('getIngredients');

    // 3. Замокаем запрос на получение пользователя (чтобы не было 403)
    cy.intercept('GET', '**/api/auth/user', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          email: 'test@user.com',
          name: 'Test User'
        }
      }
    }).as('getUser');

    // 4. Замокаем запрос на создание заказа (для тестов заказа)
    cy.intercept('POST', '**/api/orders', {
      statusCode: 200,
      body: {
        success: true,
        order: { number: 12345 }
      }
    }).as('createOrder');

    // 5. Выполняем cy.visit()
    cy.visit('/');
    
    // 6. Ждем загрузки данных
    cy.wait('@getIngredients');
    cy.wait('@getUser');
    cy.wait(1000); // Дополнительное ожидание для рендеринга
    
    // Игнорируем ошибки приложения
    Cypress.on('uncaught:exception', () => false);
  });

  // ТЕСТ 1: Добавление ингредиентов в конструктор
  it('должен добавлять ингредиенты в конструктор', () => {
    // Находим draggable элементы
    cy.contains('Филе Люминесцентного тетраодонтимформа')
      .parents('[draggable=true]')
      .first()
      .as('main');
    
    cy.contains('Флюоресцентная булка R2-D3')
      .parents('[draggable=true]')
      .first()
      .as('bun');
    
    cy.get('[class*="constructor"]').first().as('constructor');

    // Добавляем начинку
    cy.get('@main').trigger('dragstart', { force: true, bubbles: true });
    cy.get('@constructor').trigger('drop', { force: true, bubbles: true });
    cy.get('@main').trigger('dragend', { force: true });
    
    cy.wait(1000);

    // Добавляем булку
    cy.get('@bun').trigger('dragstart', { force: true, bubbles: true });
    cy.get('@constructor').trigger('drop', { force: true, bubbles: true });
    cy.get('@bun').trigger('dragend', { force: true });
    
    cy.wait(1000);

    // Проверяем, что ингредиенты появились в конструкторе
    cy.get('@constructor').contains('Филе Люминесцентного').should('exist');
    cy.get('@constructor').contains('Флюоресцентная булка').should('exist');
  });