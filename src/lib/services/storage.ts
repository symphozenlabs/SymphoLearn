/** Defensive JSON helpers over Web Storage — private windows and full quotas never throw into the UI. */

export function readJson<T>(key: string, store: Storage | undefined = globalThis.localStorage): T | null {
	try {
		const raw = store?.getItem(key);
		return raw ? (JSON.parse(raw) as T) : null;
	} catch {
		return null;
	}
}

export function writeJson(key: string, value: unknown, store: Storage | undefined = globalThis.localStorage) {
	try {
		store?.setItem(key, JSON.stringify(value));
	} catch {
		/* storage unavailable — state stays in memory for this visit */
	}
}

export function removeKey(key: string, store: Storage | undefined = globalThis.localStorage) {
	try {
		store?.removeItem(key);
	} catch {
		/* ignore */
	}
}

/** A short pause so client-only "requests" feel like the network they stand in for. */
export const latency = (ms = 450) => new Promise((r) => setTimeout(r, ms));
