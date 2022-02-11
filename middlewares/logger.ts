import type { Context, Middleware } from "oak";
import type { LogLevels } from "std/log/mod.ts";
import { getLogger } from "std/log/mod.ts";

function format(ctx: Context, start: number): string {
	return JSON.stringify({
		responseTime: performance.now() - start,
		url: ctx.request.url.href,
		headers: Object.fromEntries([...ctx.request.headers]),
		ip: ctx.request.ip,
	});
}

export default function (name?: string): Middleware {
	const logger = getLogger(name);
	return async (ctx: Context, next: () => Promise<unknown>) => {
		const start = performance.now();
		await next();
		logger.debug(format(ctx, start));
	};
}
