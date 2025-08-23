import { ErrorResult, Result } from '../../shared/common/helpers/result';
import fs from 'fs';
import {
	Component,
	ComponentBase,
	ComponentConstructorObject,
} from './components/Component';
import {
	ContainerComponent,
	LiteGraphComponent,
	TextComponent,
} from './components/core/basic';

class TemplateParser {
	private readonly data: string;
	private index = 0;
	private readonly length: number;

	constructor(data: string) {
		this.data = data;
		this.length = data.length;
	}

	private checkBounds(amount: number): boolean {
		return this.index + amount < this.length;
	}

	private peek(amount: number = 1, offset: number = 0): string | undefined {
		if (!this.checkBounds(amount + offset)) {
			return undefined;
		}

		return this.data.substring(
			this.index + offset,
			this.index + amount + offset
		);
	}

	public fillData(
		components: { [key: string]: Component[] },
		properties: { [key: string]: string }
	): string {
		let result = '';
		let batchStartIndex = this.index;
		while (this.index++ < this.length) {
			if (this.peek(1) === '\\') {
				if (['$', '\\'].includes(this.peek(1, 1) ?? '')) {
					result += this.data.substring(batchStartIndex, this.index);
					this.index += 2;
					result += this.data[this.index - 1];
					batchStartIndex = this.index;
				}
			}
			if (this.peek(3) === '${{') {
				result += this.data.substring(batchStartIndex, this.index);
				this.index += 3;
				const startIndex = this.index;
				const endIndex = this.data.indexOf('}}', this.index);
				if (endIndex === -1) {
					throw new Error(
						'Could not parse site template, missing closing "}}" for property'
					);
				}

				const propertyKey = this.data.substring(startIndex, endIndex).trim();
				result += properties[propertyKey];
				this.index = endIndex + 2;
				batchStartIndex = this.index;
			}
			if (this.peek(3) === '$[[') {
				result += this.data.substring(batchStartIndex, this.index);
				this.index += 3;
				const startIndex = this.index;
				const endIndex = this.data.indexOf(']]', this.index);
				if (endIndex === -1) {
					throw new Error(
						'Could not parse site template, missing closing "]]" for slot'
					);
				}
				const slotKey = this.data.substring(startIndex, endIndex).trim();
				if (components[slotKey] !== undefined) {
					result += components[slotKey].map((c) => c.renderToHtml()).join('');
				}
				//result += components[slotKey]?.renderToHtml();
				this.index = endIndex + 2;
				batchStartIndex = this.index;
			}
		}
		if (this.index !== batchStartIndex) {
			result += this.data.substring(batchStartIndex, this.index);
		}

		return result;
	}
}

let siteTemplate = fs
	.readFileSync('templates/site_template.html')
	.toString('utf8');
let loaderScript = fs.readFileSync('assets/loader.js').toString('utf8');

(async () => {
	fs.watchFile('templates/site_template.html', async (_) => {
		siteTemplate = fs
			.readFileSync('templates/site_template.html')
			.toString('utf8');
		console.log('Reloaded site template!');
	});
	fs.watchFile('assets/loader.js', async (_) => {
		loaderScript = fs.readFileSync('assets/loader.js').toString('utf8');
		console.log('Reloaded loader script!');
	});
})();

export type SiteDefinition = {
	metadata: {
		[key: string]: string;
	};
	components: { [key: string]: Component[] };
};

const componentRepository: { [key: string]: typeof ComponentBase } = {
	'core/basic/text': TextComponent,
	'core/basic/container': ContainerComponent,
	'core/basic/litegraph': LiteGraphComponent,
};

function convertObjectToComponent(component: {
	[key: string]: unknown;
}): Component {
	const componentClass = componentRepository[component.type as string];

	if (!componentClass) {
		throw new Error(`Unknown component type: "${component.type}"`);
	}

	if (component.slots) {
		component.slots = (component.slots as { [key: string]: unknown }[]).map(
			(s) => convertObjectToComponent(s)
		);
	}
	// @ts-expect-error Here we create an instance of a Component and not the ComponentBase
	return new componentClass(component as unknown as ComponentConstructorObject);
}

export function renderFromObject(definition: SiteDefinition) {
	const properties: { [key: string]: string } = {};
	Object.keys(definition.metadata).map(
		(k) => (properties[`metadata_${k}`] = definition.metadata[k])
	);
	const components: { [key: string]: Component[] } = {};
	Object.keys(definition.components).map(
		(c) =>
			(components[c] = definition.components[c].map((k) =>
				convertObjectToComponent(k as unknown as { [key: string]: string })
			))
	);

	return renderSite(components, properties);
}

export function renderSite(
	components: { [key: string]: Component[] },
	properties: { [key: string]: string }
): ErrorResult<string> {
	properties['buitlin_loaderscript'] = loaderScript;
	const parser = new TemplateParser(siteTemplate);
	const result = parser.fillData(components, properties);

	return new Result(result, null);
}
