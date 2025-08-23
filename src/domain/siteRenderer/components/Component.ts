import { Error } from 'mongoose';

type TypedObject<T> = { [key: string]: T };
type TypedObjectOrArray<T> = TypedObject<T> | T[];
type Hook = (hook: string) => void;
type ComponentEvent = (event: string) => void;

interface Component {
	getType(): string;
	getVersion(): string;
	renderToHtml(): string;

	getSlots(): TypedObjectOrArray<Component>;
	getSlot(slotId: string): Component | undefined;
	getAttributes(): TypedObject<string>;
	getAttribute(attributeName: string): string | undefined;
	getHooks(): TypedObject<Hook>;
	getHook(hookName: string): Hook | undefined;
	getEvents(): TypedObject<ComponentEvent>;
	getEvent(eventName: string): ComponentEvent | undefined;
	getDependencies(): DependencyDefinition[];
	getStyles(): TypedObject<string>;
	getStyle(styleName: string): string | undefined;
}

type ComponentConstructorObject = {
	slots?: TypedObjectOrArray<Component>;
	attributes?: TypedObject<string>;
	hooks?: TypedObject<Hook>;
	styles?: TypedObject<string>;
	events?: TypedObject<ComponentEvent>;
};

type DependencyDefinition = {
	modulePath: string;
	options: {
		type: 'JavaScript' | 'CSS';
		globalName?: string;
		legacy?: boolean;
		legacyOptions?: {
			detectAlreadyImportedKey?: string;
			exportFilters?: string | RegExp | string[];
		};
	};
};

abstract class ComponentBase implements Component {
	private readonly slots: TypedObjectOrArray<Component>;
	private readonly attributes: TypedObject<string>;
	private readonly styles: TypedObject<string>;
	private readonly hooks: TypedObject<Hook>;
	private readonly events: TypedObject<ComponentEvent>;

	constructor(options: ComponentConstructorObject) {
		this.slots = options.slots ?? {};
		this.attributes = options.attributes ?? {};
		this.hooks = options.hooks ?? {};
		this.events = options.events ?? {};
		this.styles = options.styles ?? {};
	}

	public getAttributes(): TypedObject<string> {
		return this.attributes;
	}

	public getAttribute(attribute: string): string | undefined {
		return this.attributes[attribute];
	}

	public getEvents(): TypedObject<ComponentEvent> {
		return this.events;
	}

	public getEvent(eventName: string): ComponentEvent | undefined {
		return this.events[eventName];
	}

	public getHooks(): TypedObject<Hook> {
		return this.hooks;
	}

	public getHook(hookName: string): Hook | undefined {
		return this.hooks[hookName];
	}

	public getSlots(): TypedObjectOrArray<Component> {
		return this.slots;
	}

	public getStyle(styleName: string): string | undefined {
		return this.styles[styleName];
	}

	public getStyles(): TypedObject<string> {
		return this.styles;
	}

	public hasStyle(): boolean {
		return Object.keys(this.styles).length > 0;
	}

	// TODO: Add support for named slots that are lists instead of a single component
	public getSlot(slotId: string | number): Component | undefined {
		const isSlotArray = Array.isArray(slotId);
		if (isSlotArray && typeof slotId === 'number') {
			return (this.slots as Component[])[slotId];
		} else if (!isSlotArray && typeof slotId === 'string') {
			return (this.slots as TypedObject<Component>)[slotId];
		} else {
			throw new Error('Cannot resolve slot by given slotId');
		}
	}

	protected generateDependencyLoading(): string {
		if (this.getDependencies().length === 0) {
			return '';
		}

		let result = 'Promise.all([';

		for (const dependency of this.getDependencies()) {
			result += `loadModule("${dependency.modulePath}", ${JSON.stringify(dependency.options)}),`;
		}

		result = result.substring(0, result.length - 1);
		return `${result}])`;
	}

	abstract getType(): string;

	abstract getVersion(): string;

	abstract getDependencies(): DependencyDefinition[];

	abstract renderToHtml(): string;
}

export { Component, ComponentBase };
export type {
	TypedObject,
	TypedObjectOrArray,
	Hook,
	ComponentEvent,
	ComponentConstructorObject,
	DependencyDefinition,
};
