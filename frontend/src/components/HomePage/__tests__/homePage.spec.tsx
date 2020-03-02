import React from "react";
import HomePage from "../HomePage";
import { render, fireEvent, wait } from "test-utils";

describe("home page protected route component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(<HomePage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("includes username in the body", () => {
    const { queryByText } = render(<HomePage />, {
      authContext: {
        username: "testuser"
      }
    });
    expect(queryByText(/testuser/)).toBeInTheDocument();
  });

  it("calls logout on button click", () => {
    const fakeLogout = jest.fn();
    const { getByText } = render(<HomePage />, {
      authContext: {
        apiLogout: fakeLogout
      }
    });
    const logoutBtn = getByText("Logout");
    fireEvent.click(logoutBtn);
    expect(fakeLogout).toHaveBeenCalled();
  });

  it("makes api call and shows response on worker debug click", async () => {
    const fakeApiCall = jest.fn();
    fakeApiCall.mockResolvedValue({ task_id: "test taskid api return" });
    const { getByText, queryByText } = render(<HomePage />, {
      authContext: {
        username: "testuser",
        apiCall: fakeApiCall
      }
    });
    const debugWorkerBtn = getByText(/Create worker/);
    fireEvent.click(debugWorkerBtn);
    await wait(() => {
      expect(fakeApiCall).toHaveBeenCalled();
      expect(fakeApiCall.mock.calls[0][0]).toEqual("/workerlog/");
      expect(fakeApiCall.mock.calls[0][1]).toMatchObject({
        method: "POST",
        body: JSON.stringify({
          msg: "worker debug message"
        })
      });
      expect(queryByText(/test taskid api return/)).toBeInTheDocument();
    });
  });

  it("makes api call and shows error on worker debug click rejection", async () => {
    const fakeApiCall = jest.fn();
    fakeApiCall.mockRejectedValue(new Error("test api error message"));
    const { getByText, queryByText } = render(<HomePage />, {
      authContext: {
        username: "testuser",
        apiCall: fakeApiCall
      }
    });
    const debugWorkerBtn = getByText(/Create worker/);
    fireEvent.click(debugWorkerBtn);
    await wait(() => {
      expect(fakeApiCall).toHaveBeenCalled();
      expect(queryByText(/test api error message/)).toBeInTheDocument();
    });
  });
});
