import type { Context, Middleware } from "oak";

export default function (headers: HeadersInit): Middleware {
	const d = new Headers(headers);
	return (ctx: Context, next: () => Promise<unknown>) => {
		const h = ctx.response.headers;
		for (const [k, v] of d) {
			h.set(k, v);
		}
		return next();
	};
}
