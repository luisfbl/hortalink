/// <reference types="cypress" />

const createTestUser = () => {
  const apiUrl = Cypress.env("apiUrl") as string;
  const email = Cypress.env("testUserEmail") as string;
  const password = Cypress.env("testUserPassword") as string;
  const boundary = `----CypressFormBoundary${Date.now()}`;

  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="name"\r\n\r\nHortalink Teste\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="email"\r\n\r\n${email}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="password"\r\n\r\n${password}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="role"\r\n\r\n3\r\n` +
    `--${boundary}--\r\n`;

  return cy
    .request({
      method: "POST",
      url: `${apiUrl}/v1/auth/sign-in`,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body,
      failOnStatusCode: false,
    })
    .then((response) => {
      const allowedStatus = [200, 201];
      if (!allowedStatus.includes(response.status)) {
        throw new Error(`Falha ao criar usuário de teste: status ${response.status}`);
      }
    });
};

describe("Fluxo de login", () => {
  const email = Cypress.env("testUserEmail") as string;
  const password = Cypress.env("testUserPassword") as string;

  before(() => {
    createTestUser();
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.visit("/access/signin");
  });

  it("Login com sucesso", () => {
    cy.get('[data-cy="login-email"]').type(email);
    cy.get('[data-cy="login-password"]').type(password);
    cy.get('[data-cy="login-submit"]').should("not.be.disabled").click();

    cy.location("pathname").should("eq", "/");
    cy.get('[data-cy="login-success-message"]').should(
      "contain",
      "Login efetuado com sucesso!"
    );
  });

  it("Login com erro", () => {
    cy.get('[data-cy="login-email"]').type("invalido@hortalink.test");
    cy.get('[data-cy="login-password"]').type("senhaErrada123");
    cy.get('[data-cy="login-submit"]').click();

    cy.location("pathname").should("eq", "/access/signin");
    cy.get('[data-cy="login-feedback"]').should("contain", "Credenciais inválidas.");
  });

  it("Botão desabilitado", () => {
    cy.get('[data-cy="login-submit"]').should("be.disabled");

    cy.get('[data-cy="login-email"]').type(email);
    cy.get('[data-cy="login-submit"]').should("be.disabled");

    cy.get('[data-cy="login-password"]').type(password);
    cy.get('[data-cy="login-submit"]').should("not.be.disabled");
  });

  it("Campos obrigatórios", () => {
    cy.get('[data-cy="login-form"]').submit();
    cy.get('[data-cy="login-feedback"]').should("contain", "E-mail é obrigatório.");

    cy.get('[data-cy="login-email"]').type(email);
    cy.get('[data-cy="login-form"]').submit();
    cy.get('[data-cy="login-feedback"]').should("contain", "Senha é obrigatória.");
  });
});
