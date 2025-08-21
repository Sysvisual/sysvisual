/**
 * Loads a script that uses and IIFE (Immediately Invoked Function Expression) for initialization returns an object with all exports provided by the script.
 *
 * @param scriptUrl The path from where the script should be downloaded
 * @param options Is an object with multiple optional fields:
 * detectAlreadyImportedKey: Is used to avoid importing the same script multiple times.
 * filter: Can be either a string (exact match), RegExp or a list of exact matches to filter what gets exported
 * @returns {Promise<unknown>}
 */
export default (scriptUrl, options) => {
	return new Promise((resolve, reject) => {
		if (options.detectAlreadyImportedKey !== undefined) {
			if (window[options.detectAlreadyImportedKey]) {
				console.warn(`${scriptUrl} was already imported. Skipping import`);
				resolve({ alreadyImported: true, exports: {} });
				return;
			}
		}

		const scriptElement = document.createElement('script');
		scriptElement.src = `/assets/${scriptUrl}.js`;
		scriptElement.async = true;

		scriptElement.onload = () => {
			console.log(`${scriptUrl} was loaded successfully via legacy wrapper.`);
			const exportObject = {};

			if (options.exportFilters !== undefined) {
				const filter = options.exportFilters;
				switch (typeof filter) {
					case 'string':
						if (window[filter] === undefined) {
							reject(
								new Error(
									'No object to export that satisfies the exact match filter.'
								)
							);
							return;
						}
						exportObject[filter] = window[filter];
						break;
					case 'object':
						if (filter instanceof RegExp) {
							for (const key in window) {
								if (filter.test(key)) {
									exportObject[key] = window[key];
								}
							}
						} else if (Array.isArray(filter)) {
							for (const key in window) {
								if (filter.includes(key)) {
									exportObject[key] = window[key];
								}
							}
						} else {
							reject(
								new Error(`type of filter is not supported: ${typeof filter}`)
							);
							return;
						}
						break;
					default:
						reject(
							new Error(`type of filter is not supported: ${typeof filter}`)
						);
						return;
				}
			} else {
				resolve({ alreadyImported: false, exports: window });
				return;
			}

			if (Object.keys(exportObject).length <= 0) {
				reject(
					new Error(`${scriptUrl} was loaded but no exports were not found.`)
				);
			}

			resolve({ alreadyImported: false, exports: exportObject });
		};

		scriptElement.onerror = (e) => {
			console.error(`Failed to load ${scriptUrl} via legacy wrapper:`, e);
			reject(new Error(`Failed to load ${scriptUrl} via legacy wrapper.`));
		};

		document.body.appendChild(scriptElement);
	});
};
