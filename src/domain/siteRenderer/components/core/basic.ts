import {
	ComponentBase,
	ComponentConstructorObject,
	DependencyDefinition,
} from '../Component';
import { Logger } from '../../../../shared/common/logging/logger';

const COMPONENT_PREFIX = 'core/basic';

const logger = Logger.instance.getLogger();

class ContainerComponent extends ComponentBase {
	public constructor(options: ComponentConstructorObject) {
		super(options);
	}

	getType(): string {
		return `${COMPONENT_PREFIX}/container`;
	}

	getVersion(): string {
		return '0.0.1';
	}

	renderToHtml(): string {
		const slots = this.getSlots();

		if (!Array.isArray(slots)) {
			logger.warn(
				'Tried to render ContainerComponent to html but slots were not an array.',
				{ slots }
			);
			return '';
		} else {
			const renderedSlots = slots.map((v) => v.renderToHtml());
			const styles = this.getStyles();
			const generatedStyle = Object.keys(styles)
				.map((s) => `${s}: ${styles[s]};`)
				.join('');

			return `<div${this.hasStyle() ? ` style="${generatedStyle}"` : ''}>${renderedSlots.join('')}</div>`;
		}
	}

	getDependencies(): DependencyDefinition[] {
		return [];
	}
}

class TextComponent extends ComponentBase {
	public constructor(options: ComponentConstructorObject) {
		super(options);
	}

	public getType() {
		return `${COMPONENT_PREFIX}/text`;
	}

	public getVersion(): string {
		return '0.0.1';
	}

	public renderToHtml(): string {
		const text = this.getAttribute('text');
		if (text === undefined) {
			throw new Error(
				`Could not render component "${this.getType()}" because attribute "text" is missing`
			);
		}
		const styles = this.getStyles();
		const generatedStyle = Object.keys(styles)
			.map((s) => `${s}: ${styles[s]};`)
			.join('');

		return `<p${this.hasStyle() ? ` style="${generatedStyle}"` : ''}>${text}</p>`;
	}

	getDependencies(): DependencyDefinition[] {
		return [];
	}
}

class LiteGraphComponent extends ComponentBase {
	constructor(options: ComponentConstructorObject) {
		super(options);
	}

	getType(): string {
		return `${COMPONENT_PREFIX}/litegraph`;
	}

	getVersion(): string {
		return '0.0.1';
	}

	renderToHtml(): string {
		return `<div class="canvas-wrapper"><canvas id="editorCanvas" width="1200" height="720"></canvas><script>document.addEventListener("DOMContentLoaded", async function() { await ${this.generateDependencyLoading()}; const graph = new litegraph.LGraph(); const canvas = new litegraph.LGraphCanvas('#editorCanvas', graph); const node_const = litegraph.LiteGraph.createNode('basic/const'); node_const.pos = [200, 200]; graph.add(node_const); node_const.setValue(4.5);  const node_watch = litegraph.LiteGraph.createNode('basic/watch'); node_watch.pos = [700, 200]; graph.add(node_watch); node_const.connect(0, node_watch, 0); graph.start(); })</script></div>`;
	}

	getDependencies(): DependencyDefinition[] {
		return [
			{
				modulePath: 'litegraphjs/litegraph',
				options: {
					type: 'JavaScript',
					globalName: 'litegraph',
					legacy: true,
					legacyOptions: {
						detectAlreadyImportedKey: 'LiteGraph',
						exportFilters: '^LiteGraph|LG',
					},
				},
			},
			{
				modulePath: 'litegraphjs/litegraph',
				options: {
					type: 'CSS',
				},
			},
		];
	}
}

export { TextComponent, LiteGraphComponent, ContainerComponent };
