import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TesterDirectoryTable } from "@/components/brand/tester-directory-table";

const testers = [
  {
    id: "t1",
    displayName: "Alice Approved",
    emailNormalized: "alice@example.com",
    approvalStatus: "approved",
    userId: "u1",
    skillLevel: "4.0",
    playingFrequency: "daily",
    currentPaddle: "Alpha Paddle",
    playStyle: "aggressive_baseline",
    activeAssignmentCount: 2,
    lastActivityAt: new Date().toISOString(),
  },
  {
    id: "t2",
    displayName: "Bob Pending",
    emailNormalized: "bob@example.com",
    approvalStatus: "pending",
    userId: null,
    skillLevel: "3.0",
    playingFrequency: "weekly",
    currentPaddle: "Beta Paddle",
    playStyle: "dinker",
    activeAssignmentCount: 0,
    lastActivityAt: null,
  },
];

describe("TesterDirectoryTable (Sprint 1 revision, Step 5)", () => {
  it("shows all testers with no filters applied", () => {
    render(<TesterDirectoryTable testers={testers} />);
    expect(screen.getByText("Alice Approved")).toBeInTheDocument();
    expect(screen.getByText("Bob Pending")).toBeInTheDocument();
  });

  it("filters by search term (name)", async () => {
    const user = userEvent.setup();
    render(<TesterDirectoryTable testers={testers} />);
    await user.type(screen.getByPlaceholderText("Search by name or email..."), "Alice");
    expect(screen.getByText("Alice Approved")).toBeInTheDocument();
    expect(screen.queryByText("Bob Pending")).not.toBeInTheDocument();
  });

  it("filters by approval status independently of search", async () => {
    const user = userEvent.setup();
    render(<TesterDirectoryTable testers={testers} />);
    const approvalSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(approvalSelect, "pending");
    expect(screen.getByText("Bob Pending")).toBeInTheDocument();
    expect(screen.queryByText("Alice Approved")).not.toBeInTheDocument();
  });

  it("combines search and skill-level filters", async () => {
    const user = userEvent.setup();
    render(<TesterDirectoryTable testers={testers} />);
    const skillSelect = screen.getByDisplayValue("All skill levels");
    await user.selectOptions(skillSelect, "4.0");
    expect(screen.getByText("Alice Approved")).toBeInTheDocument();
    expect(screen.queryByText("Bob Pending")).not.toBeInTheDocument();
  });

  it("shows an empty state when no tester matches the filters", async () => {
    const user = userEvent.setup();
    render(<TesterDirectoryTable testers={testers} />);
    await user.type(screen.getByPlaceholderText("Search by name or email..."), "Nobody Matches This");
    expect(screen.getByText("No testers match your filters.")).toBeInTheDocument();
  });
});
