import React from "react";
import AuthContextProvider from "../AuthContextProvider";
import { AuthContext } from "../AuthContext";
import {
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
  ACCESS_TOKEN_LOCAL_STORAGE_KEY
} from "const";
import { render, fireEvent, wait } from "test-utils";

interface TestConsumerProps {
  apiCallCb?: (apiCall: any) => void;
}

// This is a test component for ease of testing the AuthContext provider
const AuthContextTestConsumer: React.FC<TestConsumerProps> = ({
  apiCallCb = cb => cb()
}) => (
  <AuthContextProvider>
    <AuthContext.Consumer>
      {value => (
        <div>
          <button onClick={value.apiLogin} data-testid="login" />
          <button onClick={value.apiLogout} data-testid="logout" />
          <button
            onClick={() => apiCallCb(value.apiCall)}
            data-testid="apiCall"
          />
          {value.username && (
            <span data-testid="username">{value.username}</span>
          )}
          {value.userId && <span data-testid="userId">{value.userId}</span>}
          {value.authenticated && (
            <span data-testid="authenticated">{value.authenticated}</span>
          )}
        </div>
      )}
    </AuthContext.Consumer>
  </AuthContextProvider>
);

// username: testuser, userId: 70
const fakeToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTgyMTQ5Nzk0LCJqdGkiOiIwYjc3OTVkMmYzZjE0MjkxYWI4NzAxOGE2ODMyZjJhYiIsInVzZXJfaWQiOjcwLCJ1c2VybmFtZSI6InRlc3R1c2VyIn0.DNnc3y1r4ZMZ3uW_UkjY2jI6i4MqmjOCRAWZBaZUIiE";

const makeResponse = (
  status: number = 200,
  body: object = {}
): Partial<Response> => ({
  ok: 200 <= status && status <= 299,
  status,
  json: jest.fn().mockResolvedValue(body),
  statusText: "test status text"
});

const renderAndLogin = async (Component: JSX.Element) => {
  const rendered = render(Component);
  const { getByTestId, queryByTestId } = rendered;
  const loginButton = getByTestId("login");
  fireEvent.click(loginButton);
  await wait(() => {
    // okay, they're logged in
    expect(queryByTestId("authenticated")).toBeInTheDocument();
    expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toEqual(
      fakeToken
    );
  });
  return rendered;
};

describe("authentication context provider", () => {
  let fakeFetch: jest.Mock;
  let originalFetch: any;

  // mock the fetch api
  beforeAll(() => {
    fakeFetch = jest.fn();
    originalFetch = window.fetch;
    window.fetch = fakeFetch;
  });

  beforeEach(() => {
    fakeFetch.mockResolvedValue(
      makeResponse(200, {
        access: fakeToken,
        refresh: fakeToken
      })
    );
  });

  afterEach(() => {
    fakeFetch.mockReset();
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
  });

  afterAll(() => {
    window.fetch = originalFetch;
  });

  it("is unauthenticated by default", () => {
    const { queryByTestId } = render(<AuthContextTestConsumer />);
    expect(queryByTestId("username")).not.toBeInTheDocument();
    expect(queryByTestId("userId")).not.toBeInTheDocument();
    expect(queryByTestId("authenticated")).not.toBeInTheDocument();
  });

  it("login updates user context on success", async () => {
    const { getByTestId, queryByText } = render(<AuthContextTestConsumer />);
    const loginButton = getByTestId("login");
    fireEvent.click(loginButton);
    await wait(() => {
      expect(queryByText(/testuser/)).toBeInTheDocument();
      expect(queryByText(/70/)).toBeInTheDocument();
      expect(getByTestId("authenticated")).toBeInTheDocument();
    });
  });

  it("login adds tokens to localstorage on success", async () => {
    const { getByTestId } = render(<AuthContextTestConsumer />);
    const loginButton = getByTestId("login");
    fireEvent.click(loginButton);
    await wait(() => {
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toEqual(
        fakeToken
      );
      expect(localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY)).toEqual(
        fakeToken
      );
    });
  });

  it("logout updates user context and local storage", async () => {
    const { queryByTestId, getByTestId } = await renderAndLogin(
      <AuthContextTestConsumer />
    );
    const logoutButton = getByTestId("logout");
    fireEvent.click(logoutButton);
    await wait(() => {
      // make sure they're logged out
      expect(queryByTestId("authenticated")).not.toBeInTheDocument();
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
    });
  });

  it("login handles an access token that does not contain the required claims", async () => {
    const { queryByTestId, getByTestId } = await renderAndLogin(
      <AuthContextTestConsumer />
    );
    const loginButton = getByTestId("login");
    fakeFetch.mockResolvedValue(
      makeResponse(200, {
        access: "thisshouldntwork",
        refresh: "thisshouldntwork"
      })
    );
    fireEvent.click(loginButton);
    await wait(() => {
      // make sure this logs them out
      expect(queryByTestId("authenticated")).not.toBeInTheDocument();
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
    });
  });

  it("login call handles a 401 response", async () => {
    const { queryByTestId, getByTestId } = await renderAndLogin(
      <AuthContextTestConsumer />
    );
    const loginButton = getByTestId("login");
    fakeFetch.mockResolvedValue(makeResponse(401));
    fireEvent.click(loginButton);
    await wait(() => {
      // make sure a 401 logs them out
      expect(queryByTestId("authenticated")).not.toBeInTheDocument();
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
    });
  });

  it("apiCall adds authentication header when authenticated", async () => {
    const onCall = (cb: CallableFunction) => {
      cb("/test", {
        method: "GET"
      });
    };
    const { getByTestId } = await renderAndLogin(
      <AuthContextTestConsumer apiCallCb={onCall} />
    );
    const apiCall = getByTestId("apiCall");
    fireEvent.click(apiCall);
    await wait(() => {
      // first call was to login
      expect(fakeFetch).toHaveBeenCalledTimes(2);
      expect(fakeFetch.mock.calls[1][0]).toEqual(
        expect.stringMatching(/test$/)
      );
      expect(fakeFetch.mock.calls[1][1]).toMatchObject({
        headers: {
          Authorization: `Bearer ${fakeToken}`
        },
        method: "GET"
      });
    });
  });

  it("apiCall does not add header whan not authenticated", async () => {
    const onCall = (cb: CallableFunction) => {
      cb("/test", {
        method: "GET"
      });
    };
    const { getByTestId } = await render(
      <AuthContextTestConsumer apiCallCb={onCall} />
    );
    const apiCall = getByTestId("apiCall");
    fireEvent.click(apiCall);
    await wait(() => {
      expect(fakeFetch).toHaveBeenCalled();
      expect(fakeFetch.mock.calls[0][0]).toEqual(
        expect.stringMatching(/test$/)
      );
      expect(fakeFetch.mock.calls[0][1]).toMatchObject({
        method: "GET"
      });
      expect(fakeFetch.mock.calls[0][1]).not.toHaveProperty(
        "headers.Authorization"
      );
    });
  });

  it("apiCall logs user out on a 401 response", async () => {
    const onCall = async (cb: CallableFunction) => {
      try {
        await cb();
      } catch (e) {
        // expecting an error here
      }
    };
    const { getByTestId, queryByTestId } = await renderAndLogin(
      <AuthContextTestConsumer apiCallCb={onCall} />
    );
    fakeFetch.mockResolvedValue(makeResponse(401));
    const apiCall = getByTestId("apiCall");
    fireEvent.click(apiCall);
    await wait(() => {
      expect(fakeFetch).toHaveBeenCalled();
      expect(queryByTestId("authenticated")).not.toBeInTheDocument();
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
    });
  });

  it("apiCall bubbles network errors", async () => {
    const onCall = jest.fn(async (cb: CallableFunction) => {
      try {
        return await cb();
      } catch (e) {
        // expecting an error here
      }
    });
    const { getByTestId, queryByTestId } = await renderAndLogin(
      <AuthContextTestConsumer apiCallCb={onCall} />
    );
    fakeFetch.mockResolvedValue(makeResponse(500));
    const apiCall = getByTestId("apiCall");
    fireEvent.click(apiCall);
    await wait(() => {
      expect(fakeFetch).toHaveBeenCalled();
      expect(queryByTestId("authenticated")).toBeInTheDocument();
      expect(
        localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
      ).not.toBeNull();
    });
  });
});
