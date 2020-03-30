import React from "react";
import AdminPage from "../AdminPage";
import { render, fireEvent, wait } from "test-utils";
import { defaultUserApiResponse } from "solo-types";
//import { fireEvent } from "@testing-library/react";
//import { queryByAttribute, queryByTitle } from "@testing-library/react";
//import { wait } from "@testing-library/react";

describe("AdminPage Component", () => {
  const fetchMock = jest.fn();
  const defaultUser = defaultUserApiResponse.results[0];

  beforeEach(() => {
    fetchMock.mockResolvedValue(defaultUserApiResponse);
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("matches snapshot", async () => {
    const { asFragment, queryByText } = render(<AdminPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(queryByText(defaultUser.username)).toBeInTheDocument();
      expect(queryByText(defaultUser.aac)).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  /*

      fetchUsers errors
          error state in document
      
      fetchUsers success
          table loaded with data
      
      sumitUsers errors
          ^table must be loaded with at least 1 row
          error state for table row
      
      submitUsers succeeds
          ^table must be loaded with at least 1 row
          success state for table row

  */

  it("fetches users and places them in a table", async () => {
   fetchMock.mockResolvedValue({
     ...defaultUserApiResponse
   });
   const { queryByText } = render(<AdminPage />, {
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
     expect(queryByText(defaultUser.username)).toBeInTheDocument()
   });
  });

  it("fails to fetch users due to network error", async () => {
    fetchMock.mockRejectedValue(new Error("network error"));
    render(<AdminPage />, {
      authContext: {
        apiCall: fetchMock
      }
    });
    await wait(() => {
      expect(fetchMock).toHaveBeenCalled();
      // add check here once api is integrated
    });
  });

  it("click on checkboxes and change permissions", async () => {
    fetchMock.mockResolvedValue({
      ...defaultUserApiResponse,
      results: [{
        ...defaultUser,
        canD6T: false,
        canCOR: false,
      }]
    });
    const { getByTestId, getByText, queryByText, container } = render(<AdminPage />, {
      authContext: {
        apiCall: fetchMock
      } 
    });

    await wait(() => {
      expect(fetchMock).toHaveBeenCalled()
      expect(queryByText(defaultUser.username)).toBeInTheDocument()
    })
    const submit = getByText("Submit")
    expect(submit).toBeDisabled();

    const corCheckbox = getByTestId("has-cor-checkbox");
    const d6tCheckbox = getByTestId("has-d6t-checkbox")
    fireEvent.change(corCheckbox, {
      target: { checked: true }
    }); 
    fireEvent.change(d6tCheckbox, {
      target: { checked: true }
    }); 
    await wait(() => {
      expect(corCheckbox).toBeChecked() 
      expect(d6tCheckbox).toBeChecked()
    });

    fetchMock.mockResolvedValue({});
    fireEvent.click(submit);
    await wait(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock.mock.calls[1][0]).toEqual(`/warehouse/users/${defaultUser.id}`)
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "PATCH",
        body: JSON.stringify({
          canD6T: true,
          canCOR: true
        })
      })
      expect(container.querySelector("svg.fa-check")).toBeInTheDocument()
    });
  });


  // it("modifies a user permission and submits causing an api call to backend", async () => {
  //   // setup fetch to return appropriate response
  //   // fetchMoock.mockResolved/Rejected value for initial data fetch
  //   // e.g. fetchMock.mockResolvedValue(defaultUserWarehouseApiResponse);
  //   // e.g. fetchMock.mockRejectedValue(new Error("network error"));

  //   // render component
  //     // expect stuff to look right

  //   // grab checkboxes you want 
  //     // checkbox = getAllBySomething

  //   // fireEvents on checkboxes you want
  //     // fireEvent.click checkboxes

  //   // expect checkboxes to be checked
  //     // await wait ( .... expect(checkox).toBeChecked()) 
      

  //   //fetchMock.mockResolved/rejected value
  
  //   // click submit
  //     // fireEvent.click(getBySomething('submit'))
    

  //   // expect api call / error state / success state
  //     // awaait wait (() expect(fetchMock).toHAveBeenCalledTimes(2))
  //     // expect(fetchMock.mock.calls[1][0]).toEqual('/modify/user/endpoint')
  //     // expect(fetchMock.mock.calls[1][1]).toMatchObject({
  //     //  userId: 1,
  //     //  permissions: ['D6T', 'COR', or whatever the data should look like sent to api]
  //     // })
  //     // expect(checkIcon).toBeInthedocument()
  //     //  or
  //     // expect(errorIcon).tobeinthedocument()
  //     // or
  //     // expect(loadingIcon).tobeinthedocument()

  //   // 
  // });





});
