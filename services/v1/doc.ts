import { doc } from "deno_doc";
import type { LoadResponse } from "deno_doc";
import type { DocNode } from "deno_doc/lib/types.d.ts";
import { ImportMap } from "@jspm/import-map";

function createLoader(reject: (msg: string) => void) {
	async function load(specifier: string): Promise<undefined | LoadResponse> {
		if (specifier.startsWith("http")) {
			const res = await fetch(specifier);
			if (res.status !== 200) {
				reject(`non 200 status code returned from ${specifier}`);
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
	return { load };
}

async function createResolver(
	reject: (msg: string) => void,
	moduleUrl: string,
	importMap?: string,
) {
	const map = new ImportMap(moduleUrl, {});
	if (importMap) {
		const res = await fetch(importMap);
		if (res.status !== 200) {
			reject(
				`non 200 status code returned from importMap endpoint, received: ${res.status}`,
			);
		}
		const content = await res.text();
		try {
			map.extend(JSON.parse(content));
		} catch {
			reject("invalid import map value");
		}
	}
	function resolve(specifier: string, ref: string): string {
		return map.resolve(specifier, ref) as string;
	}
	return { resolve };
}

export default function (moduleUrl: string, importMap?: string) {
	return new Promise<DocNode[]>(async (res, reject) => {
		const { load } = createLoader(reject);
		const { resolve } = await createResolver(reject, moduleUrl, importMap);
		res(await doc(moduleUrl, { load, resolve }).catch(() => {}));
	});
}
