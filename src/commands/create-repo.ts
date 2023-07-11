import { Command } from '@commander-js/extra-typings';
import * as prompt from '@inquirer/prompts';
import { $ } from 'execa';
import fs from 'fs';
import Listr from 'listr';
import path from 'path';

import { fetchAndExtract } from '../lib/fetch.js';
import { editFile } from '../lib/fs.js';
import { createGitHubRepo, getGitHubUser } from '../lib/github.js';
import { raise } from '../lib/raise.js';
import { AppInfo, getReplacers } from '../lib/replacers.js';

function validateName(name: string) {
	if (!name.length) return 'Name cannot be empty';
	if (!/^[a-z0-9-]+$/.test(name)) return 'Name can only contain lowercase letters, numbers and dashes';
	return true;
}

function validateSemVer(version: string) {
	if (!version.length) return 'Version cannot be empty';
	if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) return 'Version must be in the format of x.y.z';
	return true;
}

export const createRepo = new Command('create-repo')
	.option('--template <string>', 'Template repo to use', 'smeijer/node-module-boilerplate')
	.description('Initialize a new node.js project')
	.action(async function (opts) {
		const author = await getGitHubUser();

		const app: AppInfo = {
			name: await prompt.input({ message: 'name:', validate: validateName }),
			description: await prompt.input({ message: 'description:' }),
			version: await prompt.input({
				message: 'version:',
				default: '0.0.0',
				validate: validateSemVer,
			}),
		};

		const replacers = getReplacers({ app, author });

		const url = `https://github.com/${opts.template}/archive/HEAD.tar.gz`;
		const dest = path.resolve(process.cwd(), app.name);

		raise(!fs.existsSync(dest), `Directory "${app.name}" already exists, cowardly refusing to overwrite it`);

		const $$ = $({ cwd: dest });

		const tasks = new Listr([
			{
				title: 'Fetching template',
				task: async () => {
					await fetchAndExtract(url, dest, replacers);
					// drop the boilerplate part
					await editFile(path.join(dest, 'readme.md'), (content) => {
						const idx = content.lastIndexOf('---');
						return content.slice(idx + 3).trim();
					});
				},
			},
			{
				title: 'Installing dependencies',
				task: () => $$`npm i`,
			},
			{
				title: 'Initializing git',
				task: async () => {
					await $$`git init -q`;
					await $$`git branch -M main`;
				},
			},
			{
				title: 'Initializing GitHub repo',
				task: async () => {
					await createGitHubRepo({
						name: app.name,
						description: app.description,
					});
					await $$`git remote add origin git@github.com:${author.login}/${app.name}.git`;
				},
			},
			{
				title: 'Committing initial files',
				task: async () => {
					await $$`git add .`;
					await $$`git commit --message ${'chore: initial commit'}`;
				},
			},
			{
				title: 'Pushing to GitHub',
				task: () => $$`git push -u origin main`,
			},
		]);

		tasks.run().catch((e: Error) => raise(e.message));
	});
