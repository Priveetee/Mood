export type DatePreset = "all" | "7d" | "30d" | "3m" | "year";

export { darkThemeColor, lightThemeColor } from "@/app/admin/constants";

export function getDateRangeFromPreset(preset: DatePreset) {
  const now = new Date();
  const from = new Date();

  switch (preset) {
    case "7d":
      from.setDate(now.getDate() - 7);
      return { from, to: now };
    case "30d":
      from.setDate(now.getDate() - 30);
      return { from, to: now };
    case "3m":
      from.setMonth(now.getMonth() - 3);
      return { from, to: now };
    case "year":
      from.setMonth(0);
      from.setDate(1);
      return { from, to: now };
    case "all":
      return { from: new Date(2020, 0, 1), to: now };
    default:
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
}
