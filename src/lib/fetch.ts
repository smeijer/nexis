import fsp from 'fs/promises';
import replacestream from 'replacestream';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { ReadableStream } from 'stream/web';
import tar, { ReadEntry } from 'tar';

import { raise } from './raise.js';

export async function fetchAndExtract(url: string, extractPath: string, replacers?: Record<string, string>) {
	const response = await fetch(url);

	raise(response.ok, `Failed to fetch the archive: ${response.status} ${response.statusText}`);
	raise(response.body, 'Response has no body');

	await fsp.mkdir(extractPath, { recursive: true });
	const extract = tar.extract({
		cwd: extractPath,
		strip: 1,
		transform(entry) {
			if (!replacers || !Object.keys(replacers).length) return entry;
			return entry.pipe(replacestream(/__([A-Z_]*)__/g, (_match, key) => replacers[key] || '')) as ReadEntry;
		},
	});

	const stream = Readable.fromWeb(response.body as ReadableStream<any>);
	stream.pipe(extract);

	await finished(stream);
}
