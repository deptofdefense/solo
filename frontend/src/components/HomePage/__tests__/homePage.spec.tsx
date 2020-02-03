import React from "react";
import { render, fireEvent, wait } from "test-utils";
import HomePage from "../HomePage";
import { auth } from "../../../api";

jest.mock("../../../api/auth");

const authMocked = auth as jest.Mocked<typeof auth>;

describe("HomePage componenet", () => {
  beforeAll(() => {
    authMocked.login = jest.fn();
  });

  afterEach(() => {
    authMocked.login.mockReset();
  });

  afterAll(() => {
    authMocked.login.mockRestore();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<HomePage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("displays success on api call success", async () => {
    authMocked.login.mockResolvedValue("test login return");
    const { getByText, queryByText } = render(<HomePage />);
    const loginButton = getByText("CAC Login");
    fireEvent.click(loginButton);
    await wait(() => {
      expect(queryByText("success")).toBeInTheDocument();
    });
  });

  it("displays error on api call failure", async () => {
    const err = new Error("some error message");
    authMocked.login.mockRejectedValue(err);
    const { getByText, queryByText } = render(<HomePage />);
    const loginButton = getByText("CAC Login");
    fireEvent.click(loginButton);
    await wait(() => {
      expect(queryByText(err.toString())).toBeInTheDocument();
    });
  });
});
