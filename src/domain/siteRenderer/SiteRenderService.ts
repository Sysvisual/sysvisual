import {
	ErrorResult,
	Result,
	resultFromError,
} from '../../shared/common/helpers/result';
import fs from 'fs';

type ComponentSlot<T> = {
	allowedTypes: string[];
	value: T;
};

type Component = {
	type: string;
	version: string;
	dependencies?: (Component | string)[];
	slots?: ComponentSlot<unknown>[];
	attributes?: { [attr: string]: string };
	hooks?: { [hook: string]: (event: unknown) => void };
	events?: { [event: string]: (event: unknown) => unknown };
	renderToHtml: (self: Component) => string;
};

class TemplateParser {
	private data: string;
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

	public fillData(properties: { [key: string]: string }): string {
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
				while (this.peek(2) !== '}}') {
					this.index++;
				}
				const propertyKey = this.data.substring(startIndex, this.index).trim();
				result += properties[propertyKey];
				this.index += 2;
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

(async () => {
	fs.watchFile('templates/site_template.html', async (_) => {
		siteTemplate = fs
			.readFileSync('templates/site_template.html')
			.toString('utf8');
		console.log('Reloaded site template!');
	});
})();

export function renderSite(
	components: Component[],
	properties: { [key: string]: string }
): ErrorResult<string> {
	if (components.length === 0) {
		const parser = new TemplateParser(siteTemplate);
		const result = parser.fillData(properties);

		return new Result(result, null);
	}
	return resultFromError(new Error('Could not render site'));
}
