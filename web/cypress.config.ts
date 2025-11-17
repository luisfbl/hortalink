import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:4321",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    retries: 1,
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL || "http://localhost:5555/api",
    testUserEmail: process.env.CYPRESS_TEST_USER_EMAIL || "cliente@hortalink.test",
    testUserPassword: process.env.CYPRESS_TEST_USER_PASSWORD || "SenhaSegura123",
  },
});
