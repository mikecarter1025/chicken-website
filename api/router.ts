import { createRouter, publicQuery } from "./middleware";
import { challengesRouter } from "./routers/challenges";
import { shameRouter } from "./routers/shame";
import { settingsRouter } from "./routers/settings";
import { adminRouter } from "./routers/admin";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  challenges: challengesRouter,
  shame: shameRouter,
  settings: settingsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
