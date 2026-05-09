import { describe, it, expect } from "vitest";

import { getByPath, isParseableDate } from "../src/utils";

describe("getByPath", () => {
  it("returns the value at a top-level key", () => {
    expect(getByPath({ name: "Alice" }, "name")).toBe("Alice");
  });

  it("returns the value at a dot-separated path", () => {
    const obj = { user: { profile: { name: "Bob" } } };
    expect(getByPath(obj, "user.profile.name")).toBe("Bob");
  });

  it("returns undefined when an intermediate segment is missing", () => {
    const obj = { user: { profile: null } };
    expect(getByPath(obj, "user.profile.name")).toBeUndefined();
  });

  it("returns undefined when the leaf key is missing", () => {
    expect(getByPath({ a: { b: 1 } }, "a.c")).toBeUndefined();
  });

  it("returns undefined when the input is null or undefined", () => {
    expect(getByPath(null, "anything")).toBeUndefined();
    expect(getByPath(undefined, "anything")).toBeUndefined();
  });

  it("returns the input when the path is empty", () => {
    const obj = { a: 1 };
    expect(getByPath(obj, "")).toBe(obj);
  });

  it("works with numeric values, booleans, and zero", () => {
    expect(getByPath({ count: 0 }, "count")).toBe(0);
    expect(getByPath({ flag: false }, "flag")).toBe(false);
  });

  it("does not throw when descending into a primitive", () => {
    // "name.first" on { name: "Alice" } — first level resolves to a string,
    // second level treats string indexing safely. Returns undefined.
    expect(getByPath({ name: "Alice" }, "name.first")).toBeUndefined();
  });
});

describe("isParseableDate", () => {
  it("returns true for ISO date strings", () => {
    expect(isParseableDate("2026-05-08")).toBe(true);
    expect(isParseableDate("2026-05-08T17:30:00Z")).toBe(true);
  });

  it("returns true for valid Date instances", () => {
    expect(isParseableDate(new Date())).toBe(true);
    expect(isParseableDate(new Date("2026-01-01"))).toBe(true);
  });

  it("returns false for invalid Date instances", () => {
    expect(isParseableDate(new Date("not a date"))).toBe(false);
  });

  it("returns true for finite numbers (epoch ms)", () => {
    expect(isParseableDate(0)).toBe(true);
    expect(isParseableDate(Date.now())).toBe(true);
  });

  it("returns false for NaN", () => {
    expect(isParseableDate(NaN)).toBe(false);
  });

  it("returns false for non-date strings", () => {
    expect(isParseableDate("hello world")).toBe(false);
    expect(isParseableDate("abc")).toBe(false);
  });

  it("returns false for null, undefined, booleans, and objects", () => {
    expect(isParseableDate(null)).toBe(false);
    expect(isParseableDate(undefined)).toBe(false);
    expect(isParseableDate(true)).toBe(false);
    expect(isParseableDate({})).toBe(false);
    expect(isParseableDate([])).toBe(false);
  });
});
