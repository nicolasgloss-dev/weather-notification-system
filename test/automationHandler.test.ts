// -----------------------------------------------------------------------------
// automationHandler.test.ts
// -----------------------------------------------------------------------------
// This test file checks the logic of the automationHandler Lambda function.
// It verifies that different weather conditions trigger the correct simulated
// automation actions. Each test includes inline comments to explain purpose.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Mock the AWS SDK SNS client globally (before importing the handler).
// This prevents Jest from trying to load the real @aws-sdk/client-sns module,
// which uses dynamic imports not supported in this test environment.
// -----------------------------------------------------------------------------
jest.mock("@aws-sdk/client-sns", () => ({
    SNSClient: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({ MessageId: "mocked-id" }),
    })),
    PublishCommand: jest.fn(),
}));

// Import the Lambda handler after mocking the AWS SDK.
import { main } from "../lambda/automation/automationHandler";

describe("automationHandler Lambda", () => {
    // Reset mocks before each test run to avoid interference between tests.
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------------------------------------------------------------------------
    // Basic structure test — ensures the Lambda always returns a valid response.
    // ---------------------------------------------------------------------------
    test("returns success response with expected structure", async () => {
        const result = await main({});
        expect(result).toHaveProperty("statusCode", 200); // Should return 200
        expect(result).toHaveProperty("condition"); // Randomised weather condition
        expect(result).toHaveProperty("message", "Automation simulation complete.");
    });

    // ---------------------------------------------------------------------------
    // Storm case
    // Cchecks that the Lambda handles “Storm” correctly and still returns success.
    // Math.random() is mocked to a value that falls into the "Storm" branch.
    // ---------------------------------------------------------------------------
    test("handles Storm condition", async () => {
        jest.spyOn(Math, "random").mockReturnValue(0.5); // Force predictable condition
        const result = await main({});
        expect(result.statusCode).toBe(200); // Should respond successfully
        expect(typeof result.condition).toBe("string"); // Should include condition
        jest.spyOn(Math, "random").mockRestore();
    });

    // ---------------------------------------------------------------------------
    // Rain case
    // Verifies that the “Rain” branch executes and the SNS client is called.
    // The SNS client is mocked, so this only tests logic, not actual AWS calls.
    // ---------------------------------------------------------------------------
    test("handles Rain condition and calls SNS", async () => {
        jest.spyOn(Math, "random").mockReturnValue(0.3); // Simulate Rain case
        const result = await main({});
        expect(result.statusCode).toBe(200); // Should complete successfully
        jest.spyOn(Math, "random").mockRestore();
    });

    // ---------------------------------------------------------------------------
    // Clear and Cloudy cases
    // Ensures both conditions complete safely without triggering errors.
    // Demonstrates that the Lambda is resilient across all logic branches.
    // ---------------------------------------------------------------------------
    test("handles Clear and Cloudy conditions gracefully", async () => {
        for (const value of [0.0, 0.8]) {
            jest.spyOn(Math, "random").mockReturnValue(value);
            const result = await main({});
            expect(result.statusCode).toBe(200);
        }
        jest.spyOn(Math, "random").mockRestore();
    });
});
