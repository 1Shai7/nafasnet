import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import RoomBlueprint from "@/components/RoomBlueprint";
import BrandLogo from "@/components/BrandLogo";

afterEach(() => {
  cleanup();
});

describe("NafasNet UI Component Smoke Tests", () => {
  it("renders BrandLogo with bilingual NafasNet wordmark, Arabic calligraphy, and tagline", () => {
    render(<BrandLogo />);
    expect(screen.getByText("Nafas")).toBeInTheDocument();
    expect(screen.getByText("Net")).toBeInTheDocument();
    expect(screen.getByText("نَفَس")).toBeInTheDocument();
    expect(
      screen.getByText("Breath & Indoor Air Intelligence for Winter Smog")
    ).toBeInTheDocument();
  });

  it("toggles all 4 indoor defenses in RoomBlueprint and updates Room Protection Score from 0% to 100%", () => {
    render(<RoomBlueprint />);

    expect(screen.getByText("0%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Damp-Cloth Door Seal/i }));
    expect(screen.getByText("25%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Kitchen Chimney \/ Exhaust/i }));
    expect(screen.getByText("50%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Wet Mop \(No Dry Sweep\)/i }));
    expect(screen.getByText("75%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /DIY Box-Fan Filter/i }));
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
