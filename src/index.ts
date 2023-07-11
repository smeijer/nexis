import { Command } from '@commander-js/extra-typings';
import fs from 'fs';
import { PackageJson } from 'type-fest';

import { createRepo } from './commands/create-repo.js';

const pkg = JSON.parse(fs.readFileSync('../package.json', 'utf8')) as PackageJson;

const program = new Command('nexis')
	.description(pkg.description || '')
	.version(pkg.version || '0.0.0')
	.addCommand(createRepo);

program.parse(process.argv);

process.on('uncaughtException', function (err) {
	// eslint-disable-next-line no-console
	console.log(`error: ${err.message}\n`);
	process.exit(1);
});
