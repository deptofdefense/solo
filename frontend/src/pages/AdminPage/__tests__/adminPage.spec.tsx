import React from "react";
import AdminPage from "../AdminPage";
import { render, fireEvent, wait } from "test-utils";
import { defaultUserApiResponse, WarehouseUser } from "solo-types";

describe("AdminPage Component", () => {
  const fetchMock = jest.fn();
  const defaultUser = defaultUserApiResponse.results[0];

  beforeEach(() => {
    fetchMock.mockResolvedValue(defaultUserApiResponse);
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  const renderAndWaitForData = async () => {
    const { queryByText, ...rest } = render(<AdminPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock.mock.calls[0][0]).toEqual("/warehouse/users/");
      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        method: "GET"
      });
      expect(queryByText(defaultUser.username)).toBeInTheDocument();
    });
    return {
      queryByText,
      ...rest
    };
  };

  it("matches snapshot", async () => {
    const { asFragment } = await renderAndWaitForData();
    expect(asFragment()).toMatchSnapshot();
  });

  it("fails to fetch users due to network error", async () => {
    fetchMock.mockRejectedValue(new Error("network error"));
    const { queryAllByTestId } = render(<AdminPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      // update checks here once api is integrated
      expect(queryAllByTestId("has-cor-checkbox").length).toBeGreaterThan(0);
    });
  });

  it("click on checkboxes and change permissions", async () => {
    fetchMock.mockResolvedValue({
      ...defaultUserApiResponse,
      results: [
        {
          ...defaultUser,
          canD6T: false,
          canCOR: false
        }
      ]
    });
    const { getByTestId, getByText, container } = await renderAndWaitForData();
    await wait(() => {
      expect(getByTestId("has-cor-checkbox")).not.toBeChecked();
      expect(getByTestId("has-d6t-checkbox")).not.toBeChecked();
      expect(getByText("Submit")).toBeDisabled();
    });
    fireEvent.click(getByTestId("has-cor-checkbox"));
    fireEvent.click(getByTestId("has-d6t-checkbox"));
    await wait(() => {
      expect(getByTestId("has-cor-checkbox")).toBeChecked();
      expect(getByTestId("has-d6t-checkbox")).toBeChecked();
      expect(getByText("Submit")).not.toBeDisabled();
    });
    fetchMock.mockResolvedValue({});
    fireEvent.click(getByText("Submit"));
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual(
        `/warehouse/users/${defaultUser.userId}/`
      );
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "PATCH",
        body: JSON.stringify({
          canD6T: true,
          canCOR: true
        })
      });
      expect(container.querySelector("svg.fa-check")).toBeInTheDocument();
    });
  });

  it("submit user permissions network error shows error indicator icon", async () => {
    fetchMock.mockResolvedValue({
      ...defaultUserApiResponse,
      results: [
        {
          ...defaultUser,
          canD6T: false,
          canCOR: false
        }
      ]
    });
    const { getByTestId, getByText, container } = render(<AdminPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(getByTestId("has-cor-checkbox")).not.toBeChecked();
      expect(getByTestId("has-d6t-checkbox")).not.toBeChecked();
      expect(getByText("Submit")).toBeDisabled();
    });
    fireEvent.click(getByTestId("has-cor-checkbox"));
    fireEvent.click(getByTestId("has-d6t-checkbox"));
    await wait(() => {
      expect(getByTestId("has-cor-checkbox")).toBeChecked();
      expect(getByTestId("has-d6t-checkbox")).toBeChecked();
      expect(getByText("Submit")).not.toBeDisabled();
    });
    fetchMock.mockRejectedValue(new Error());
    fireEvent.click(getByText("Submit"));
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(
        container.querySelector("svg.fa-exclamation-circle")
      ).toBeInTheDocument();
    });
  });

  it("submit user permissions network error with message shows error indicator icon", async () => {
    fetchMock.mockResolvedValue({
      ...defaultUserApiResponse,
      results: [
        {
          ...defaultUser,
          canD6T: false,
          canCOR: false
        }
      ]
    });
    const { getByTestId, getByText, container } = render(<AdminPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(getByTestId("has-cor-checkbox")).not.toBeChecked();
      expect(getByTestId("has-d6t-checkbox")).not.toBeChecked();
      expect(getByText("Submit")).toBeDisabled();
    });
    fireEvent.click(getByTestId("has-cor-checkbox"));
    fireEvent.click(getByTestId("has-d6t-checkbox"));
    await wait(() => {
      expect(getByTestId("has-cor-checkbox")).toBeChecked();
      expect(getByTestId("has-d6t-checkbox")).toBeChecked();
      expect(getByText("Submit")).not.toBeDisabled();
    });
    const err = new Error();
    err.message = "some error message";
    fetchMock.mockRejectedValue(err);
    fireEvent.click(getByText("Submit"));
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(
        container.querySelector("svg.fa-exclamation-circle")
      ).toBeInTheDocument();
    });
  });

  it("checking permission options only updates user for that row", async () => {
    const user: WarehouseUser = {
      ...defaultUser,
      canD6T: false,
      canCOR: false
    };
    fetchMock.mockResolvedValue({
      ...defaultUserApiResponse,
      results: [
        {
          ...user,
          userId: 5
        },
        {
          ...user,
          username: "someotheruser",
          userId: 42
        }
      ]
    });
    const { getAllByTestId, getAllByText } = await renderAndWaitForData();
    await wait(() => {
      expect(getAllByTestId("has-cor-checkbox")).toHaveLength(2);
      expect(getAllByTestId("has-cor-checkbox")[0]).not.toBeChecked();
      expect(getAllByTestId("has-cor-checkbox")[1]).not.toBeChecked();
      expect(getAllByText("Submit")).toHaveLength(2);
      expect(getAllByText("Submit")[0]).toBeDisabled();
      expect(getAllByText("Submit")[1]).toBeDisabled();
    });
    fireEvent.click(getAllByTestId("has-cor-checkbox")[0]);
    await wait(() => {
      expect(getAllByTestId("has-cor-checkbox")[0]).toBeChecked();
      expect(getAllByText("Submit")[0]).not.toBeDisabled();
    });
  });
});
