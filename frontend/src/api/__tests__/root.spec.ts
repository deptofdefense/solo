import root from "../root";
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY, 
         REFRESH_TOKEN_LOCAL_STORAGE_KEY } from "../../constants";
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

describe("test root api", () => {
  let fakeFetch: jest.Mock;
  let originalFetch: any;

  beforeAll(() => {
    fakeFetch = jest.fn();
    originalFetch = window.fetch;
    window.fetch = fakeFetch;
  });

  afterEach(() => {
    fakeFetch.mockReset();
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
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
    ).resolves.toMatchObject({});
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

  it("rejects promise on bad status code", async () => {
    const mockResponse = makeResponse(400);
    fakeFetch.mockResolvedValue(mockResponse);
    await expect(root.get("/test")).rejects.toMatchObject({
      status: 400
    });
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

  it("get() adds authorization header if access token is in localstorage", async () => {
    localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, "testauthtoken")
    const mockResponse = makeResponse();
    fakeFetch.mockResolvedValue(mockResponse);
    await expect(root.get("/")).resolves.toMatchObject({});
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(fakeFetch.mock.calls[0][1]).toMatchObject({
      headers: {
        Authorization: `Bearer testauthtoken`
      }
    })
  })

  it("post() adds authorization header if access token is in localstorage", async () => {
    localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, "testauthtoken")
    const mockResponse = makeResponse();
    fakeFetch.mockResolvedValue(mockResponse);
    await expect(root.post("/", {})).resolves.toMatchObject({});
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(fakeFetch.mock.calls[0][1]).toMatchObject({
      headers: {
        Authorization: `Bearer testauthtoken`
      }
    })
  })

  it("clears access token and refresh token if 401 response is received", async () => {
    localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, "testexpiredaccesstoken");
    localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, "testexpiredrefreshtoken");
    const mockResponse = makeResponse(401);
    fakeFetch.mockResolvedValue(mockResponse);
    await expect(root.get("/")).rejects.toMatchObject({
      status: 401
    })
    expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
  })
});
