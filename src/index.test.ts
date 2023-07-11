import { execSync } from 'child_process';

const $ = (command: string) => execSync(command, { encoding: 'utf-8' });

test('main', () => {
	expect($(`tsx ./src/index.ts --help`).trim()).toMatchInlineSnapshot(`
		"Usage: nexis [options] [command]

		CLI utils that help me bootstrap and manage my projects

		Options:
		  -V, --version          output the version number
		  -h, --help             display help for command

		Commands:
		  create-repo [options]  Initialize a new node.js project
		  help [command]         display help for command"
	`);
});
