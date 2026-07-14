import { describe, expect, it } from "vitest";
import { gradeAnswer, normalizeText } from "@/lib/grading";

describe("gradeAnswer", () => {
  it("grades multiple_choice by exact match", () => {
    expect(gradeAnswer("multiple_choice", "Paris", "Paris")).toBe(true);
    expect(gradeAnswer("multiple_choice", "London", "Paris")).toBe(false);
  });

  it("grades true_false by exact match", () => {
    expect(gradeAnswer("true_false", "True", "True")).toBe(true);
    expect(gradeAnswer("true_false", "False", "True")).toBe(false);
  });

  it("grades fill_blank case- and whitespace-insensitively", () => {
    expect(gradeAnswer("fill_blank", "mitochondria", "Mitochondria")).toBe(true);
    expect(gradeAnswer("fill_blank", "  Mitochondria  ", "mitochondria")).toBe(true);
    expect(gradeAnswer("fill_blank", "nucleus", "mitochondria")).toBe(false);
  });

  it("grades identification ignoring punctuation", () => {
    expect(gradeAnswer("identification", "Jose Rizal.", "Jose Rizal")).toBe(true);
    expect(gradeAnswer("identification", "jose, rizal", "Jose Rizal")).toBe(true);
  });
});

describe("normalizeText", () => {
  it("lowercases, trims, strips punctuation, and collapses whitespace", () => {
    expect(normalizeText("  Hello,   World!  ")).toBe("hello world");
  });
});
