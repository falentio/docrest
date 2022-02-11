import type { Context, Middleware } from "oak";
import type { LogLevels } from "std/log/mod.ts";
import { getLogger } from "std/log/mod.ts";

function format(ctx: Context, start: number): string {
	const result = {};
	result.responseTime = performance.now() - start;
	result.url = ctx.request.url.href;
	result.headers = Object.fromEntries([...ctx.request.headers]);
	result.ip = ctx.request.ip;
	return JSON.stringify(result);
}

export default function (name?: string) {
	const logger = getLogger(name);
	return async (ctx: Context, next: () => Promise<void>) => {
		const start = performance.now();
		await next();
		logger.debug(format(ctx, start));
	};
}
