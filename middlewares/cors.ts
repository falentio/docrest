import type { Context, Middleware } from "oak";

export default function (): Middleware {
	return async (ctx: Context, next: () => Promise<unknown>) => {
		if (ctx.request.method === "OPTIONS") {
			const h = ctx.response.headers;
			h.set("Access-Control-Allow-Origin", "*");
			ctx.response.status = 204;
			return;
		}
		await next();
	};
}
