import React from "react";
import { render, fireEvent, wait, sleep } from "test-utils";
import { defaultApiResponse } from "solo-types";
import EnterReceiptPage from "../EnterReceiptPage";
import EnterReceiptStatusIndicator from "../EnterReceiptStatusIndicator";

describe("EnterReceiptPage submit all process", () => {
  const fetchMock = jest.fn();
  const defaultDoc = defaultApiResponse.results[0];

  afterEach(() => {
    fetchMock.mockReset();
  });

  const renderAndSearchForDocument = async () => {
    fetchMock.mockResolvedValue(defaultApiResponse);
    const { getByPlaceholderText, getByText, queryByText, ...rest } = render(
      <EnterReceiptPage />,
      {
        authContext: {
          apiCall: fetchMock
        }
      }
    );
    const inpField = getByPlaceholderText("SDN");
    const searchBtn = getByText("Search");
    const submitBtn = getByText("Submit All");
    fireEvent.change(inpField, {
      target: { value: defaultDoc.sdn }
    });
    await wait(() => {
      expect(inpField).toHaveValue(defaultDoc.sdn);
    });
    fireEvent.click(searchBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(queryByText(defaultDoc.part.nomen)).toBeInTheDocument();
    });
    return {
      getByPlaceholderText,
      getByText,
      queryByText,
      inpField,
      searchBtn,
      submitBtn,
      ...rest
    };
  };

  it("cannot submit all when there are no documents to submit", async () => {
    const { getByText } = render(<EnterReceiptPage />);
    const submitBtn = getByText("Submit All");
    expect(submitBtn).toHaveAttribute("disabled");
  });

  it("posts documents to api and displays success message on submit all", async () => {
    const { submitBtn, queryByText } = await renderAndSearchForDocument();
    fetchMock.mockResolvedValue({});
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toEqual("/documents/d6t");
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "POST",
        body: JSON.stringify([
          {
            sdn: defaultDoc.sdn,
            status: "D6T",
            quantity:
              defaultDoc.statuses[defaultDoc.statuses.length - 1].projected_qty,
            subinventory: defaultDoc.suppadd.subinventorys[0].code,
            locator: defaultDoc.suppadd.subinventorys[0].locators[0].code
          }
        ])
      });
      expect(
        queryByText("Successfully submitted 1 document(s)")
      ).toBeInTheDocument();
    });
  });

  it("posts documents to api and displays error on submit all failure", async () => {
    const { submitBtn, queryByText } = await renderAndSearchForDocument();
    fetchMock.mockRejectedValue(new Error());
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(queryByText("Something went wrong")).toBeInTheDocument();
    });
  });

  it("cannot submit docs while any of them are still loading", async () => {
    // add a 1 second load time to the api call in order to
    // test that submit cannot be called during that time
    fetchMock.mockImplementation(async () => {
      await sleep(500);
      return defaultApiResponse;
    });
    const { getByPlaceholderText, getByText, queryByText } = render(
      <EnterReceiptPage />,
      {
        authContext: {
          apiCall: fetchMock
        }
      }
    );
    const inpField = getByPlaceholderText("SDN");
    const searchBtn = getByText("Search");
    const submitBtn = getByText("Submit All");
    fireEvent.change(inpField, {
      target: { value: "asdf" }
    });
    fireEvent.click(searchBtn);
    await wait(() => {
      expect(queryByText("asdf")).toBeInTheDocument();
    });
    fireEvent.click(submitBtn);
    await wait(() => {
      expect(
        queryByText(
          "All documents must be successfully loaded before submitting"
        )
      ).toBeInTheDocument();
      expect(queryByText(defaultDoc.sdn)).toBeInTheDocument();
    });
  });

  it("selects first subinventory and first locator by default", async () => {
    const { getByPlaceholderText } = await renderAndSearchForDocument();
    const subinventorySelect = getByPlaceholderText("Subinventory");
    const locatorSelect = getByPlaceholderText("Locator");
    await wait(() => {
      expect(subinventorySelect).toHaveValue(
        defaultDoc.suppadd.subinventorys[0].code
      );
      expect(locatorSelect).toHaveValue(
        defaultDoc.suppadd.subinventorys[0].locators[0].code
      );
    });
  });

  it("selects corresponding locators on selecting different subinventory", async () => {
    const { getByPlaceholderText } = await renderAndSearchForDocument();
    const subinventorySelect = getByPlaceholderText("Subinventory");
    const locatorSelect = getByPlaceholderText("Locator");
    fireEvent.change(subinventorySelect, {
      target: { value: defaultDoc.suppadd.subinventorys[1].code }
    });
    await wait(() => {
      expect(subinventorySelect).toHaveValue(
        defaultDoc.suppadd.subinventorys[1].code
      );
      expect(locatorSelect).toHaveValue(
        defaultDoc.suppadd.subinventorys[1].locators[0].code
      );
    });
  });

  it("can change the quantitiy to a valid number", async () => {
    const { getByPlaceholderText } = await renderAndSearchForDocument();
    const quantityInp = getByPlaceholderText("Quantity");
    expect(quantityInp).toHaveValue(
      defaultDoc.statuses[
        defaultDoc.statuses.length - 1
      ].projected_qty.toString()
    );
    fireEvent.change(quantityInp, {
      target: { value: "30" }
    });
    await wait(() => {
      expect(quantityInp).toHaveValue("30");
    });
    fireEvent.change(quantityInp, {
      target: { value: "not a number" }
    });
    await wait(() => {
      expect(quantityInp).toHaveValue("30");
    });
  });

  it("can select a different locator", async () => {
    const { getByPlaceholderText } = await renderAndSearchForDocument();
    const locatorSelect = getByPlaceholderText("Locator");
    fireEvent.change(locatorSelect, {
      target: { value: defaultDoc.suppadd.subinventorys[0].locators[1].code }
    });
    await wait(() => {
      expect(locatorSelect).toHaveValue(
        defaultDoc.suppadd.subinventorys[0].locators[1].code
      );
    });
  });
});

describe("EnterReceiptPageStatusIndicator component", () => {
  it("renders error alert when status is error", () => {
    const { asFragment } = render(
      <EnterReceiptStatusIndicator loading={false} error={true} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not render while loading", async () => {
    const { asFragment } = render(
      <EnterReceiptStatusIndicator loading={true} error={true} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders success alert when status is success", async () => {
    const { asFragment } = render(
      <EnterReceiptStatusIndicator loading={true} error={false} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
