import { Router } from "oak";
import type { Context } from "oak";

function handleHealth(ctx: Context) {
	const now = new Date();
	const { start } = ctx.state;
	const uptime = now.getTime() - start.getTime();
	const json = {
		start: start.toUTCString(),
		now: now.toUTCString(),
		uptime,
	};
	ctx.response.body = json;
}

export default new Router()
	.get("/", handleHealth);
