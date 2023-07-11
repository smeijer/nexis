import Debug from 'debug';
import fsp from 'fs/promises';
import replacestream from 'replacestream';
import { PassThrough, Readable } from 'stream';
import { finished } from 'stream/promises';
import { ReadableStream } from 'stream/web';
import tar from 'tar';

import { raise } from './raise.js';

const debug = Debug('nexis');

export async function fetchAndExtract(url: string, extractPath: string, replacers?: [string | RegExp, string][]) {
	const response = await fetch(url);

	raise(response.ok, `Failed to fetch the archive: ${response.status} ${response.statusText}`);
	raise(response.body, 'Response has no body');

	await fsp.mkdir(extractPath, { recursive: true });
	const extract = tar.extract({
		cwd: extractPath,
		strip: 1,
		filter() {
			return true;
		},
		transform(entry) {
			const pipeline = (replacers || []).reduce(
				(stream, [key, value]) => stream.pipe(replacestream(key, value) as PassThrough),
				new PassThrough(),
			);

			return entry.pipe(pipeline);
		},
		onentry(entry) {
			const filepath = entry.path.replace(/\//g, '/').split('/').slice(1).join('/');
			debug(`extracting ${filepath}`);
		},
	});

	const stream = Readable.fromWeb(response.body as ReadableStream<any>);
	stream.pipe(extract);

	await finished(stream);
}
