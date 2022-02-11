import type { Context, Middleware } from "oak";

export interface RateLimitOptions {
	interval: number;
	limit: number;
	getIdentifier?(ctx: Context): string;
}

interface Data {
	last: Date;
	limit: number;
}

function defaultGetIdentifier(ctx: Context): string {
	return ctx.request.ip;
}

export default function ({
	interval,
	limit,
	getIdentifier = defaultGetIdentifier,
}: RateLimitOptions): Middleware {
	const pool: Record<string, Data> = {};
	return (ctx: Context, next: () => Promise<unknown>) => {
		const id = getIdentifier(ctx);
		const now = new Date();
		const data = pool[id] ??= {
			last: now,
			limit,
		} as Data;
		const reset = data.last.getTime() + interval;
		if (reset < now.getTime()) {
			data.limit = limit;
			data.last = now;
		}
		data.limit--;
		const h = ctx.response.headers;
		h.set("Rate-Limit-Remains", data.limit.toString());
		h.set("Rate-Limit-Total", limit.toString());
		h.set("Rate-Limit-Reset", new Date(reset).toUTCString());
		if (data.limit < 0) {
			h.delete("Rate-Limit-Remains");
			ctx.response.status = 429;
			return;
		}
		return next();
	};
}
