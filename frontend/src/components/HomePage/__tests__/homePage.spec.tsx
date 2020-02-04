import React from "react";
import { render, fireEvent, wait } from "test-utils";
import HomePage from "../HomePage";
import { auth } from "../../../api";

jest.mock("../../../api/auth");

const authMocked = auth as jest.Mocked<typeof auth>;

describe("HomePage componenet", () => {
  beforeAll(() => {
    authMocked.apiConnectivityTest = jest.fn();
  });

  afterEach(() => {
    authMocked.apiConnectivityTest.mockReset();
  });

  afterAll(() => {
    authMocked.apiConnectivityTest.mockRestore();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<HomePage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("displays success on api call success", async () => {
    authMocked.apiConnectivityTest.mockResolvedValue("test login return");
    const { getByText, queryByText } = render(<HomePage />);
    const loginButton = getByText("API Test");
    fireEvent.click(loginButton);
    await wait(() => {
      expect(queryByText("success")).toBeInTheDocument();
    });
  });

  it("displays error on api call failure", async () => {
    const err = new Error("some error message");
    authMocked.apiConnectivityTest.mockRejectedValue(err);
    const { getByText, queryByText } = render(<HomePage />);
    const loginButton = getByText("API Test");
    fireEvent.click(loginButton);
    await wait(() => {
      expect(queryByText(err.toString())).toBeInTheDocument();
    });
  });
});
