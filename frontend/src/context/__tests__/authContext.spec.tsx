import React from "react";
import AuthContextProvider from "../AuthContextProvider";
import { AuthContext } from "../AuthContext";
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY
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
          <button
            onClick={() => value.apiLogin().catch(() => {})}
            data-testid="login"
          />
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

// username: testuser
// user_id: 91
// exp: 1585082555
const fakeRefreshToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTU4NTA4MjU1NSwianRpIjoiODE4N2U3ZDk2YzllNDUwMzhkZDQzNDdjZDA0MDcyM2EiLCJ1c2VyX2lkIjo5MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciJ9.iu9rMY5HTSl5iGnvPduTZ7ZpDholOXjnUViZnGM8L_0";

// username: testuser
// user_id: 91
// exp: 1584996455
const fakeAccessToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTg0OTk2NDU1LCJqdGkiOiI5MDA2ZDcyNmZlNTU0ZDc0YjM3OWEwNDdlMDhhMWI1ZSIsInVzZXJfaWQiOjkxLCJ1c2VybmFtZSI6InRlc3R1c2VyIn0.G-uVkNma4fHlMWjh7YKVKLjvzVokBJ1d0AQ-o9l27GI";

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
      fakeAccessToken
    );
    expect(localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY)).toEqual(
      fakeRefreshToken
    );
  });
  return rendered;
};

describe("authentication context provider", () => {
  let fakeFetch: jest.Mock;
  let fakeDate: jest.Mock;
  let originalFetch: any;
  let originalDate: any;

  // mock the fetch api
  beforeAll(() => {
    fakeFetch = jest.fn();
    fakeDate = jest.fn();
    originalDate = Date.now;
    Date.now = fakeDate;
    originalFetch = window.fetch;
    window.fetch = fakeFetch;
  });

  beforeEach(() => {
    // default is a non-expired token
    fakeDate.mockReturnValue(1584996440000);
    fakeFetch.mockResolvedValue(
      makeResponse(200, {
        access: fakeAccessToken,
        refresh: fakeRefreshToken
      })
    );
  });

  afterEach(() => {
    fakeDate.mockReset();
    fakeFetch.mockReset();
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
  });

  afterAll(() => {
    Date.now = originalDate;
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
      expect(queryByText(/91/)).toBeInTheDocument();
      expect(getByTestId("authenticated")).toBeInTheDocument();
    });
  });

  it("login adds tokens to localstorage on success", async () => {
    const { getByTestId } = render(<AuthContextTestConsumer />);
    const loginButton = getByTestId("login");
    fireEvent.click(loginButton);
    await wait(() => {
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toEqual(
        fakeAccessToken
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
    });
  });

  it("login handles an token that does not contain the required claims", async () => {
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
          Authorization: `Bearer ${fakeAccessToken}`
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

  it("apiCall refreshes a token if required prior to call", async () => {
    const onCall = (cb: CallableFunction) => {
      cb("/test", {
        method: "GET"
      });
    };
    const { getByTestId } = await renderAndLogin(
      <AuthContextTestConsumer apiCallCb={onCall} />
    );
    fakeDate.mockReturnValue(1584996600000); // refresh required
    const apiCall = getByTestId("apiCall");
    fireEvent.click(apiCall);
    await wait(() => {
      expect(fakeFetch.mock.calls[0][0]).toEqual(
        expect.stringMatching(/\/login\/$/)
      );
      expect(fakeFetch.mock.calls[1][0]).toEqual(
        expect.stringMatching(/\/login\/refresh\//)
      );
      expect(fakeFetch.mock.calls[2][0]).toEqual(
        expect.stringMatching(/\/test/)
      );
    });
  });

  it("apiCall logs user out if refresh required and api errors", async () => {
    const onCall = (cb: CallableFunction) => {
      cb("/test", {
        method: "GET"
      }).catch(() => {
        //vexpecting error here
      });
    };
    const { getByTestId, queryByTestId } = await renderAndLogin(
      <AuthContextTestConsumer apiCallCb={onCall} />
    );
    await wait(() => {
      expect(fakeFetch).toHaveBeenCalled();
    });
    fakeDate.mockReturnValue(1584996600000); // refresh required
    fakeFetch.mockResolvedValue(makeResponse(400));
    const apiCall = getByTestId("apiCall");
    fireEvent.click(apiCall);
    await wait(() => {
      expect(fakeFetch.mock.calls[1][0]).toEqual(
        expect.stringMatching(/\/login\/refresh\/$/)
      );
      expect(queryByTestId("authenticated")).not.toBeInTheDocument();
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
    });
  });

  it("apiCall logs user out if refresh required network errors", async () => {
    const onCall = (cb: CallableFunction) => {
      cb("/test", {
        method: "GET"
      }).catch(() => {
        //vexpecting error here
      });
    };
    const { getByTestId, queryByTestId } = await renderAndLogin(
      <AuthContextTestConsumer apiCallCb={onCall} />
    );
    await wait(() => {
      expect(fakeFetch).toHaveBeenCalled();
    });
    fakeDate.mockReturnValue(1584996600000); // refresh required
    fakeFetch.mockRejectedValue(new Error("some network error"));
    const apiCall = getByTestId("apiCall");
    fireEvent.click(apiCall);
    await wait(() => {
      expect(fakeFetch.mock.calls[1][0]).toEqual(
        expect.stringMatching(/\/login\/refresh\/$/)
      );
      expect(queryByTestId("authenticated")).not.toBeInTheDocument();
      expect(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)).toBeNull();
    });
  });

  describe("authentication context provider development login", () => {
    let fakePrompt: jest.Mock;
    let originalPrompt: any;
    let originalEnv = process.env;

    beforeAll(() => {
      fakePrompt = jest.fn();
      originalPrompt = window.prompt;
      window.prompt = fakePrompt;
    });

    afterEach(() => {
      fakePrompt.mockReset();
    });

    afterAll(() => {
      window.prompt = originalPrompt;
      process.env = originalEnv;
    });

    it("login prompts for username and adds headers in development", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development"
      };
      fakePrompt.mockReturnValue("scott");
      const { getByTestId } = render(<AuthContextTestConsumer />);
      const loginButton = getByTestId("login");
      fireEvent.click(loginButton);
      await wait(() => {
        expect(fakePrompt).toHaveBeenCalledTimes(1);
        expect(fakeFetch).toHaveBeenCalledTimes(1);
        expect(fakeFetch.mock.calls[0][1]).toMatchObject({
          headers: {
            Authorization: "scott"
          }
        });
      });
    });

    it("login defaults to empty string Authorization header in development", async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: "development"
      };
      fakePrompt.mockReturnValue(null);
      const { getByTestId } = render(<AuthContextTestConsumer />);
      const loginButton = getByTestId("login");
      fireEvent.click(loginButton);
      await wait(() => {
        expect(fakePrompt).toHaveBeenCalledTimes(1);
        expect(fakeFetch).toHaveBeenCalledTimes(1);
        expect(fakeFetch.mock.calls[0][1]).toMatchObject({
          headers: {
            Authorization: ""
          }
        });
      });
    });
  });
});
