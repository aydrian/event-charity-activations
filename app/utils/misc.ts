import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()) // Initial char (after -/_)
    .replace(/[-_]+(.)/g, (_, c) => " " + c.toUpperCase()); // First char after each -/_

export function hexToRgbA(hex: string, alpha: number = 1) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = Number("0x" + c.join(""));
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
      ","
    )},${alpha})`;
  }
  throw new Error("Bad Hex");
}

export const USDollar = new Intl.NumberFormat("en-US", {
  currency: "USD",
  minimumFractionDigits: 0,
  style: "currency"
});
