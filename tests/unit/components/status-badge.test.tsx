import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/brand/status";

describe("StatusBadge Component", () => {
  it("renders correct label for active status", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("renders correct label for draft status", () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
  });

  it("renders correct label for ready_for_testing status", () => {
    render(<StatusBadge status="ready_for_testing" />);
    expect(screen.getByText("READY FOR TESTING")).toBeInTheDocument();
  });

  it("renders correct label for rejected status", () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText("REJECTED")).toBeInTheDocument();
  });
});
