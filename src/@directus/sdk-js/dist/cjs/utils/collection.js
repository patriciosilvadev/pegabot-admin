"use strict";
/**
 * @module utils
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionItemPath = exports.DIRECTUS_COLLECTION_PREFIX = void 0;
exports.DIRECTUS_COLLECTION_PREFIX = "directus_";
/**
 * Returns the correct API path for the collection. It will
 * strip the prefix {@link DIRECTUS_COLLECTION_PREFIX | collection-prefix} or will add the
 * '/items/' path as prefix if not provided. The 'substr(9)' defines
 * the length of the defined {@link DIRECTUS_COLLECTION_PREFIX | collection-prefix}.
 * @param {string} collection     The name of the collection
 * @returns {string}
 * @internal
 *
 * @example
 * getCollectionItemPath('directus_users');
 * // => '/users'
 * getCollectionItemPath('users');
 * // => '/items/users'
 */
function getCollectionItemPath(collection) {
    if (collection.startsWith(exports.DIRECTUS_COLLECTION_PREFIX)) {
        return "/" + collection.substr(9);
    }
    return "/items/" + collection;
}
exports.getCollectionItemPath = getCollectionItemPath;
//# sourceMappingURL=collection.js.map