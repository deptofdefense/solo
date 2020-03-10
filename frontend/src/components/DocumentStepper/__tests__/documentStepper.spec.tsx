import React from "react";
import DocumentStepper from "../DocumentStepper";
import DocumentStepperStep from "../DocumentStepperStep";
import { defaultDoc } from "solo-types";
import { render } from "test-utils";

jest.mock("date-fns", () => ({
  parseISO: () => "testiso",
  formatDistanceToNow: () => {
    return "some amount of time";
  }
}));

afterAll(() => {
  jest.restoreAllMocks();
});

describe("DocumentStepperStep component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <DocumentStepperStep title="teststep" complete />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not include the left bar if it's the first element", () => {
    const { container } = render(
      <DocumentStepperStep first title="teststep" />
    );
    expect(container.querySelector("div.stepRight")).toBeInTheDocument();
    expect(container.querySelector("div.stepLeft")).not.toBeInTheDocument();
  });

  it("does not include the right bar if it's the last element", () => {
    const { container } = render(<DocumentStepperStep last title="teststep" />);
    expect(container.querySelector("div.stepRight")).not.toBeInTheDocument();
    expect(container.querySelector("div.stepLeft")).toBeInTheDocument();
  });

  it("has green color if completed", () => {
    const { container } = render(
      <DocumentStepperStep title="teststep" complete />
    );
    expect(container.firstChild).toHaveClass("stepComplete");
  });

  it("has grey color if not complete", () => {
    const { container } = render(
      <DocumentStepperStep title="teststep" complete={false} />
    );
    expect(container.firstChild).toHaveClass("stepIncomplete");
  });

  it("includes formatted date if included", () => {
    const { queryByText } = render(
      <DocumentStepperStep title="teststep" occuredAt="somedate" />
    );
    expect(queryByText("some amount of time ago")).toBeInTheDocument();
  });

  it("uses dot circle icon when incomplete", () => {
    const { container } = render(
      <DocumentStepperStep title="teststep" complete={false} />
    );
    expect(
      container.querySelector("svg[data-icon='dot-circle']")
    ).toBeInTheDocument();
  });

  it("uses dot circle icon when incomplete", () => {
    const { container } = render(
      <DocumentStepperStep title="teststep" complete />
    );
    expect(
      container.querySelector("svg[data-icon='check-circle']")
    ).toBeInTheDocument();
  });
});

describe("DocumentStepper component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <DocumentStepper statuses={defaultDoc.statuses} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
