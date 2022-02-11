import { Router } from "oak";
import type { Context } from "oak";
import doc from "./doc.ts";

function isValidUrl(s: string): boolean {
	try {
		new URL(s);
		return true;
	} catch {
		return false;
	}
}

async function handleDoc(ctx: Context) {
	const mod = ctx.request.url.searchParams.get("module") ?? "";
	const importMap = ctx
		.request.url.searchParams.get("importMap") ?? undefined;
	if (!isValidUrl(mod)) {
		ctx.response.status = 400;
		ctx.response.body = {
			error: true,
			msg: "invalid module url",
		};
		return;
	}

	if (importMap && !isValidUrl(importMap)) {
		ctx.response.status = 400;
		ctx.response.body = {
			error: true,
			msg: "invalid importMap url",
		};
		return;
	}

	const res = await fetch(mod);
	if (res.status !== 200) {
		ctx.response.status = 400;
		ctx.response.body = {
			error: true,
			msg: `non 200 http status code received from module endpoint, received: ${res.status}`,
		};
		return;
	}
	try {
		const modCache = res.headers.get("cache-control");
		ctx.response.body = await doc(mod, importMap);
		ctx.response.headers.set(
			"cache-control",
			modCache ?? "public, max-age=86400",
		);
	} catch (e) {
		ctx.response.status = 400;
		ctx.response.body = {
			error: true,
			msg: e.message,
		};
	}
}

export default new Router()
	.get("/doc", handleDoc);
