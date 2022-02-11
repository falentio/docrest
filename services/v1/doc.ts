import { doc } from "deno_doc";
import type { LoadResponse } from "deno_doc";
import { ImportMap } from "@jspm/import-map";

async function load(specifier: string): Promise<undefined | LoadResponse> {
	if (specifier.startsWith("http")) {
		const res = await fetch(specifier);
		if (res.status !== 200) {
			return undefined;
		}
		const content = await res.text();
		const headers = Object.fromEntries([...res.headers]);
		const loadRes: LoadResponse = {
			content,
			specifier,
			headers,
		};
		return loadRes;
	}
	return undefined;
}

async function createResolver(moduleUrl: string, importMap?: string) {
	const map = new ImportMap(moduleUrl, {});
	if (importMap) {
		const res = await fetch(importMap);
		if (res.status !== 200) {
			throw new Error(
				`non 200 status code returned from importMap endpoint, received: ${res.status}`,
			);
		}
		const content = await res.text();
		try {
			map.extend(JSON.parse(content));
		} catch {
			throw new Error("invalid import map value");
		}
	}
	function resolve(specifier: string, ref: string): string {
		return map.resolve(specifier, ref) as string;
	}
	return { resolve };
}

export default async function (moduleUrl: string, importMap?: string) {
	const { resolve } = await createResolver(moduleUrl, importMap);
	return doc(moduleUrl, { load, resolve });
}
