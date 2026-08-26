import { describe, expect, it } from "vitest";
import { filterBusinesses } from "@/components/BusinessDirectory";
import { getPublishedDirectoryBusinesses } from "@/lib/businesses";

describe("directory search", () => {
  const businesses = getPublishedDirectoryBusinesses();

  it("matches name, category and locality without accents", () => {
    expect(filterBusinesses(businesses, "formigal")).toHaveLength(1);
    expect(filterBusinesses(businesses, "oficina")).toHaveLength(1);
    expect(filterBusinesses(businesses, "sao pedro")).toHaveLength(1);
  });

  it("finds Boi na Brasa by category and locality", () => {
    expect(filterBusinesses(businesses, "restaurante").map((business) => business.slug)).toEqual(["boi-na-brasa"]);
    expect(filterBusinesses(businesses, "torres vedras").map((business) => business.slug)).toEqual(["boi-na-brasa"]);
  });
});
