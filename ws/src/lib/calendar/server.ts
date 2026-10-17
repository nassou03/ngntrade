import { createServerFn } from "@tanstack/react-start";
import { loadCalendarEvents } from "./live";

export const getCalendarEvents = createServerFn({ method: "GET" }).handler(
  async () => {
    return loadCalendarEvents();
  },
);
