import { Router } from "oak";
import type { Context } from "oak";

function handleHealth(ctx: Context) {
	const now = new Date();
	const { start } = ctx.state;
	const uptime = now.getTime() - start.getTime();
	const json = { start, now, uptime };
	ctx.response.body = json;
	ctx.response.headers.set("cache-control", "private, max-age=0");
}

export default new Router()
	.get("/", handleHealth);
