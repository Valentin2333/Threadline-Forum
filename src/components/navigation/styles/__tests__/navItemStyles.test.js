import { describe, it, expect } from "vitest";
import { navItemStyles, navItemStylesWithAvatar } from "../navItemStyles";

describe("navItemStyles", () => {
  it("returns active styles when isActive is true", () => {
    const styles = navItemStyles({ isActive: true });
    expect(styles.background).toContain("rgba(129");
    expect(styles.color).toBe("#fff");
    expect(styles.border).toContain("rgba(129");
  });

  it("returns inactive styles when isActive is false", () => {
    const styles = navItemStyles({ isActive: false });
    expect(styles.background).toBe("transparent");
    expect(styles.color).toContain("rgba(255");
    expect(styles.border).toContain("transparent");
  });
});

describe("navItemStylesWithAvatar", () => {
  it("extends navItemStyles with display flex", () => {
    const styles = navItemStylesWithAvatar({ isActive: true });
    expect(styles.display).toBe("inline-flex");
    expect(styles.alignItems).toBe("center");
    expect(styles.color).toBe("#fff"); // from navItemStyles active
  });

  it("includes inactive base styles", () => {
    const styles = navItemStylesWithAvatar({ isActive: false });
    expect(styles.background).toBe("transparent");
    expect(styles.display).toBe("inline-flex");
  });
});
