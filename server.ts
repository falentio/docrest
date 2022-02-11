import { Application, Router } from "oak";
import * as log from "std/log/mod.ts";

import health from "./services/health/router.ts";
import v1 from "./services/v1/router.ts";

import cors from "./middlewares/cors.ts";
import logger from "./middlewares/logger.ts";

// deno-lint-ignore no-explicit-any
function getEnv<T extends (s: string) => any>(n: string, d: string, f: T) {
	return f(Deno.env.get(n) ?? d);
}

const port = getEnv("PORT", "8080", Number);
const logLevel = getEnv("LOG_LEVEL", "NOTSET", String);

await log.setup({
	handlers: {
		console: new log.handlers.ConsoleHandler("NOTSET"),
	},
	loggers: {
		default: {
			level: logLevel,
			handlers: ["console"],
		},
	},
});

const router = new Router();
router.use("/health", health.routes());
router.use("/v1", v1.routes());

export const app = new Application({
	proxy: true,
	state: {
		start: new Date(),
	},
});

app.use(logger());
app.use(cors());
app.use(router.routes());

app.addEventListener(
	"listen",
	() => void log.info("listening on port: " + port),
	{ once: true },
);

if (import.meta.main) {
	app.listen({ port });
}
