import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Renders a component wrapped in MemoryRouter.
 * Accepts all options from RTL's render plus `initialEntries`.
 */
export function renderWithRouter(
  ui,
  { initialEntries = ["/"], ...options } = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
    options,
  );
}
