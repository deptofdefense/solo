import React from "react";
import StatusPage from "../StatusPage";
import { render, wait, fireEvent } from "test-utils";

afterAll(() => {
  jest.restoreAllMocks();
});

describe("StatusPage component filtering", () => {
  const fakeFetch = jest.fn();

  afterEach(() => {
    fakeFetch.mockReset();
  });

  it("refetches documents when a search is submitted based on nomenclature", async () => {
    const { getByPlaceholderText, container } = render(<StatusPage />, {
      authContext: {
        apiCall: fakeFetch
      }
    });
    const btn = container.querySelector("button[type='submit']") as Element;
    const search = getByPlaceholderText("Search");
    const field = getByPlaceholderText("Field");
    fireEvent.change(field, {
      target: { value: "nomen" }
    });
    fireEvent.change(search, {
      target: { value: "bolts" }
    });
    await wait(() => {
      expect(field).toHaveValue("nomen");
      expect(search).toHaveValue("bolts");
    });
    fireEvent.click(btn);
    await wait(() => {
      // first call was on mount
      expect(fakeFetch).toHaveBeenCalledTimes(2);
      expect(fakeFetch.mock.calls[1][0]).toEqual("/documents?nomen=bolts");
    });
  });

  it("refetches documents when a search is submitted based on sdn", async () => {
    const { getByPlaceholderText, container } = render(<StatusPage />, {
      authContext: {
        apiCall: fakeFetch
      }
    });
    const btn = container.querySelector("button[type='submit']") as Element;
    const search = getByPlaceholderText("Search");
    const field = getByPlaceholderText("Field");
    fireEvent.change(field, {
      target: { value: "sdn" }
    });
    fireEvent.change(search, {
      target: { value: "somesdniwant" }
    });
    await wait(() => {
      expect(field).toHaveValue("sdn");
      expect(search).toHaveValue("somesdniwant");
    });
    fireEvent.click(btn);
    await wait(() => {
      // first call was on mount
      expect(fakeFetch).toHaveBeenCalledTimes(2);
      expect(fakeFetch.mock.calls[1][0]).toEqual("/documents?sdn=somesdniwant");
    });
  });

  it("refetches documents when a search is submitted based on commodity", async () => {
    const { getByPlaceholderText, container } = render(<StatusPage />, {
      authContext: {
        apiCall: fakeFetch
      }
    });
    const btn = container.querySelector("button[type='submit']") as Element;
    const search = getByPlaceholderText("Search");
    const field = getByPlaceholderText("Field");
    fireEvent.change(field, {
      target: { value: "commodity" }
    });
    fireEvent.change(search, {
      target: { value: "motortuh" }
    });
    await wait(() => {
      expect(field).toHaveValue("commodity");
      expect(search).toHaveValue("motortuh");
    });
    fireEvent.click(btn);
    await wait(() => {
      // first call was on mount
      expect(fakeFetch).toHaveBeenCalledTimes(2);
      expect(fakeFetch.mock.calls[1][0]).toEqual(
        "/documents?commodity=motortuh"
      );
    });
  });
});
