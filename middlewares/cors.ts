import type { Context, Middleware } from "oak";

export default function (): Middleware {
	return async (ctx: Context, next: () => Promise<void>) => {
		if (ctx.request.method === "OPTIONS") {
			const h = ctx.response.headers;
			h.set("Access-Control-Allow-Origin", "*");
			ctx.response.status = 204;
		}
		await next();
	};
}
