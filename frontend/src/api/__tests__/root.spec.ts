import root from "../root";
import {} from "test-utils";

const makeResponse = (
  status: number = 200,
  body: object = {}
): Partial<Response> => ({
  ok: 200 <= status && status <= 299,
  status,
  json: jest.fn().mockResolvedValue(body),
  statusText: "test status text"
});

describe("test fetch mock", () => {
  let fakeFetch: jest.Mock;
  let originalFetch: any;

  beforeAll(() => {
    fakeFetch = jest.fn();
    originalFetch = window.fetch;
    window.fetch = fakeFetch;
  });

  afterEach(() => {
    fakeFetch.mockReset();
  });

  afterAll(() => {
    window.fetch = originalFetch;
  });

  it("adds base headers and params to request along with manual params", async () => {
    const mockResponse = makeResponse();
    fakeFetch.mockResolvedValue(mockResponse);
    await expect(
      root.get("/test", {
        cache: "no-cache"
      })
    ).resolves;
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(fakeFetch.mock.calls[0][0]).toEqual(
      expect.stringMatching(/\/test$/)
    );
    expect(fakeFetch.mock.calls[0][1]).toMatchObject({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      cache: "no-cache"
    });
  });

  it("returns json when request successful", async () => {
    const mockResponse = makeResponse(200, {
      data: "test"
    });
    fakeFetch.mockResolvedValue(mockResponse);
    await expect(root.get("/test")).resolves.toMatchObject({
      data: "test"
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  it("bubbles network errors", async () => {
    const networkErrorTest = new Error("some network issue");
    fakeFetch.mockRejectedValue(networkErrorTest);
    await expect(root.get("/test")).rejects.toMatchObject(networkErrorTest);
  });

  it("throws an error on bad statusCode", async () => {
    const mockResponse = makeResponse(400);
    fakeFetch.mockResolvedValue(mockResponse);
    await expect(root.get("/test")).rejects.toMatchObject(
      new Error("test status text")
    );
  });

  it("post stringifies data and adds headers before calling fetch", async () => {
    const mockResponse = makeResponse();
    fakeFetch.mockResolvedValue(mockResponse);
    const testPayload = { data: "example" };
    await expect(root.post("/test", testPayload)).resolves.toMatchObject({});
    expect(fakeFetch.mock.calls[0][0]).toEqual(
      expect.stringMatching(/\/test$/)
    );
    expect(fakeFetch.mock.calls[0][1]).toMatchObject({
      body: JSON.stringify(testPayload),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
  });
});
