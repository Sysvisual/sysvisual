let importedLegacyWrapper = false;

async function _loadLegacyScript(modulePath, options) {
	if (!importedLegacyWrapper) {
		window['loadLegacyScript'] = (await import(`/assets/wrapper.js`)).default;
		importedLegacyWrapper = true;
		console.log('Loaded legacy wrapper since it was not loaded.');
	}

	console.log(`Using legacy loader for "${modulePath}"`);
	return await window.loadLegacyScript(modulePath, options.legacyOptions);
}

async function loadModule(modulePath, options) {
	try {
		switch (options.type) {
			case 'JavaScript': {
				let module;

				if (!(options.legacy ?? false)) {
					module = await import(`/assets/${modulePath}.js`);
				} else {
					module = (await _loadLegacyScript(modulePath, options)).exports;
				}

				const moduleName =
					options.globalName === undefined ? module : options.globalName;

				window[moduleName] = module;
				console.log(
					`Module '${moduleName}' loaded and available globally as 'window.${moduleName}'`
				);
				break;
			}
			case 'CSS': {
				const linkElement = document.createElement('link');
				linkElement.rel = 'stylesheet';
				linkElement.href = `/assets/${modulePath}.css`;

				linkElement.onload = () => {
					console.log(`Module '${modulePath}' (CSS) loaded successfully.`);
				};
				linkElement.onerror = () => {
					const error = new Error(`Failed to load CSS module '${modulePath}'.`);
					console.error(error.message);
				};

				document.head.appendChild(linkElement);
				break;
			}
			default: {
				console.error(
					`Type "${options.type}" is not supported by the current version of the module loader.`
				);
				break;
			}
		}
	} catch (error) {
		console.error(`Error loading or processing module '${modulePath}':`, error);
	}
}

async function loadLiteGraph() {
	return Promise.all([
		loadModule('litegraphjs/litegraph', {
			type: 'JavaScript',
			globalName: 'litegraph',
			legacy: true,
			legacyOptions: {
				detectAlreadyImportedKey: 'LiteGraph',
				exportFilters: /^LiteGraph|LG/,
			},
		}),
		loadModule('litegraphjs/litegraph', { type: 'CSS' }),
	]);
}
