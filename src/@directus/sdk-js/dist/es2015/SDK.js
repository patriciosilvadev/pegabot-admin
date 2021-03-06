/**
 * @module SDK
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Utilities
import { getCollectionItemPath } from "./utils/collection";
import { isString } from "./utils/is";
import { querify } from "./utils/qs";
// Manager classes
import { API } from "./API";
import { Configuration } from "./Configuration";
/**
 * Main SDK implementation provides the public API to interact with a
 * remote directus instance.
 * @uses API
 * @uses Configuration
 */
export class SDK {
    // create a new instance with an API
    constructor(options) {
        this.config = new Configuration(options, options ? options.storage : undefined);
        this.api = new API(this.config);
    }
    // #region authentication
    /**
     * Login to the API; Gets a new token from the API and stores it in this.api.token.
     */
    login(credentials, options) {
        return this.api.auth.login(credentials, options);
    }
    /**
     * Logs the user out by "forgetting" the token, and clearing the refresh interval
     */
    logout() {
        return this.api.auth.logout();
    }
    /**
     * Resets the client instance by logging out and removing the URL and project
     */
    reset() {
        this.api.reset();
    }
    /**
     * Refresh the token if it is about to expire (within 30 seconds of expiry date).
     * - Calls onAutoRefreshSuccess with the new token if the refreshing is successful.
     * - Calls onAutoRefreshError if refreshing the token fails for some reason.
     * @returns {[boolean, Error?]}
     */
    refreshIfNeeded() {
        return this.api.auth.refreshIfNeeded();
    }
    /**
     * Use the passed token to request a new one
     */
    refresh(token) {
        return this.api.auth.refresh(token);
    }
    /**
     * Request to reset the password of the user with the given email address.
     * The API will send an email to the given email address with a link to generate a new
     * temporary password.
     */
    requestPasswordReset(email, reset_url) {
        const body = {
            email
        };
        reset_url ? body.reset_url = reset_url : null;
        return this.api.post("/auth/password/request", body);
    }
    /**
     * Resets the password
     */
    resetPassword(password, token) {
        const body = {
            password,
            token
        };
        return this.api.post("/auth/password/reset", body);
    }
    // #endregion authentication
    // #endregion collection presets
    // #region activity
    /**
     * Get activity
     */
    getActivity(params = {}) {
        return this.api.get("/activity", params);
    }
    // #endregion activity
    // #region bookmarks
    /**
     * Get the bookmarks of the current user
     * @deprecated Will be removed in the next major version, please use {@link SDK.getCollectionPresets} instead
     * @see https://docs.directus.io/advanced/legacy-upgrades.html#directus-bookmarks
     */
    getMyBookmarks(params = {}) {
        return this.getCollectionPresets(params);
    }
    // #endregion bookmarks
    // #region collections
    /**
     * Get all available collections
     */
    getCollections(params = {}) {
        return this.api.get("/collections", params);
    }
    /**
     * Get collection info by name
     */
    getCollection(collection, params = {}) {
        return this.api.get(`/collections/${collection}`, params);
    }
    /**
     * Create a collection
     */
    createCollection(data) {
        return this.api.post("/collections", data);
    }
    /**
     * Updates a certain collection
     */
    updateCollection(collection, data) {
        return this.api.patch(`/collections/${collection}`, data);
    }
    /**
     * Deletes a certain collection
     */
    deleteCollection(collection) {
        return this.api.delete(`/collections/${collection}`);
    }
    // #endregion collections
    // #region collection presets
    /**
     * Get the collection presets of the current user
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    getCollectionPresets(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: user } = yield this.getMe({ fields: "*.*" });
            const id = user.id;
            const role = user.role.id;
            return Promise.all([
                this.api.get("/collection_presets", {
                    "filter[title][nnull]": 1,
                    "filter[user][eq]": id,
                }),
                this.api.get("/collection_presets", {
                    "filter[role][eq]": role,
                    "filter[title][nnull]": 1,
                    "filter[user][null]": 1,
                }),
                this.api.get("/collection_presets", {
                    "filter[role][null]": 1,
                    "filter[title][nnull]": 1,
                    "filter[user][null]": 1,
                }),
            ]).then((values) => {
                const [user, role, globalBookmarks] = values;
                return [...(user.data || []), ...(role.data || []), ...(globalBookmarks.data || [])];
            });
        });
    }
    /**
     * Create a new collection preset (bookmark / listing preferences)
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    createCollectionPreset(data) {
        return this.api.post("/collection_presets", data);
    }
    /**
     * Update collection preset (bookmark / listing preference)
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    // tslint:disable-next-line: max-line-length
    updateCollectionPreset(primaryKey, data) {
        return this.api.patch(`/collection_presets/${primaryKey}`, data);
    }
    /**
     * Delete collection preset by primarykey
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    deleteCollectionPreset(primaryKey) {
        return this.api.delete(`/collection_presets/${primaryKey}`);
    }
    // #endregion collection presets
    // #region extensions
    /**
     * Get the information of all installed interfaces
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    getInterfaces() {
        return this.api.request("get", "/interfaces", {}, {}, true);
    }
    /**
     * Get the information of all installed layouts
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    getLayouts() {
        return this.api.request("get", "/layouts", {}, {}, true);
    }
    /**
     * Get the information of all installed modules
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    getModules() {
        return this.api.request("get", "/modules", {}, {}, true);
    }
    // #endregion extensions
    // #region fields
    /**
     * Get all fields that are in Directus
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    getAllFields(params = {}) {
        return this.api.get("/fields", params);
    }
    /**
     * Get the fields that have been setup for a given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    getFields(collection, params = {}) {
        return this.api.get(`/fields/${collection}`, params);
    }
    /**
     * Get the field information for a single given field
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    getField(collection, fieldName, params = {}) {
        return this.api.get(`/fields/${collection}/${fieldName}`, params);
    }
    /**
     * Create a field in the given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    createField(collection, fieldInfo) {
        return this.api.post(`/fields/${collection}`, fieldInfo);
    }
    /**
     * Update a given field in a given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    updateField(collection, fieldName, fieldInfo) {
        return this.api.patch(`/fields/${collection}/${fieldName}`, fieldInfo);
    }
    updateFields(collection, fieldsInfoOrFieldNames, fieldInfo = null) {
        if (fieldInfo) {
            return this.api.patch(`/fields/${collection}/${fieldsInfoOrFieldNames.join(",")}`, fieldInfo);
        }
        return this.api.patch(`/fields/${collection}`, fieldsInfoOrFieldNames);
    }
    /**
     * Delete a field from a collection
     * @see @see https://docs.directus.io/api/reference.html#fields-2
     */
    deleteField(collection, fieldName) {
        return this.api.delete(`/fields/${collection}/${fieldName}`);
    }
    // #endregion fields
    // #region assets
    /**
     * @see https://docs.directus.io/api/reference.html#assets
     */
    getAssetUrl(privateHash, params) {
        const querystring = params ? querify(params) : "";
        const url = [
            this.config.url.replace(/\/$/, ""),
            this.config.project,
            "assets",
            privateHash
        ].join("/");
        return querystring.length > 0 ? url + "?" + querystring : url;
    }
    /**
     * @see https://docs.directus.io/api/reference.html#assets
     */
    getAsset(privateHash, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const previousResponseType = this.api.xhr.defaults.responseType;
            this.api.xhr.defaults.responseType = "arraybuffer";
            const response = this.api.request("get", "/assets/" + privateHash, params, undefined, false, undefined, true);
            this.api.xhr.defaults.responseType = previousResponseType;
            return response;
        });
    }
    // #endregion assets
    // #region files
    /**
     * Get a list of available files from Directus
     * @see https://docs.directus.io/api/reference.html#files
     */
    getFiles(params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.api.get("/files", params);
        });
    }
    /**
     * Get a certain file or certain file list from Directus
     * @see https://docs.directus.io/api/reference.html#files
     */
    getFile(fileName, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = typeof fileName === "string" ? fileName : fileName.join(",");
            return this.api.get(`/files/${files}`, params);
        });
    }
    /**
     * Upload multipart files in multipart/form-data
     * @see https://docs.directus.io/api/reference.html#files
     */
    uploadFiles(data, // TODO: fix type definition
    onUploadProgress = () => ({})) {
        const headers = {
            "Content-Type": "multipart/form-data",
            "X-Directus-Project": this.config.project,
        };
        if (this.config.token && isString(this.config.token) && this.config.token.length > 0) {
            headers["Authorization"] = `Bearer ${this.config.token}`;
        }
        return this.api.post("/files", data, {
            headers,
            onUploadProgress,
        });
    }
    // #endregion files
    // #region items
    /**
     * Update an existing item
     * @see https://docs.directus.io/api/reference.html#update-item
     * @typeparam TTPartialItem Defining the item type in object schema
     * @typeparam TTResult Extension of [TPartialItem] as expected result
     */
    updateItem(collection, primaryKey, body, params = {}) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.patch(`${collectionBasePath}/${primaryKey}`, body, params);
    }
    /**
     * Update multiple items
     * @see https://docs.directus.io/api/reference.html#update-items
     * @typeparam TPartialItem Defining an array of items, each in object schema
     * @typeparam TResult Extension of [TPartialItem] as expected result
     * @return {Promise<IItemsResponse<TPartialItem & TResult>>}
     */
    updateItems(collection, body, params = {}) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.patch(collectionBasePath, body, params);
    }
    /**
     * Create a new item
     * @typeparam TItemType Defining an item and its fields in object schema
     * @return {Promise<IItemsResponse<TItemType>>}
     */
    createItem(collection, body) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.post(collectionBasePath, body);
    }
    /**
     * Create multiple items
     * @see https://docs.directus.io/api/reference.html#create-items
     * @typeparam TItemsType Defining an array of items, each in object schema
     */
    createItems(collection, body) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.post(collectionBasePath, body);
    }
    /**
     * Get items from a given collection
     * @see https://docs.directus.io/api/reference.html#get-multiple-items
     * @typeparam TItemsType Defining an array of items, each in object schema
     */
    getItems(collection, params = {}) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.get(collectionBasePath, params);
    }
    /**
     * Get a single item by primary key
     * @see https://docs.directus.io/api/reference.html#get-item
     * @typeparam TItemType Defining fields of an item in object schema
     */
    getItem(collection, primaryKey, params = {}) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.get(`${collectionBasePath}/${primaryKey}`, params);
    }
    /**
     * Delete a single item by primary key
     * @see https://docs.directus.io/api/reference.html#delete-items
     */
    deleteItem(collection, primaryKey) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.delete(`${collectionBasePath}/${primaryKey}`);
    }
    /**
     * Delete multiple items by primary key
     * @see https://docs.directus.io/api/reference.html#delete-items
     */
    deleteItems(collection, primaryKeys) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.delete(`${collectionBasePath}/${primaryKeys.join()}`);
    }
    // #endregion items
    // #region listing preferences
    /**
     * Get the collection presets of the current user for a single collection
     */
    getMyListingPreferences(collection, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: user } = yield this.getMe({ fields: "*.*" });
            const id = user.id;
            const role = user.role.id;
            return Promise.all([
                this.api.get("/collection_presets", {
                    "filter[collection][eq]": collection,
                    "filter[role][null]": 1,
                    "filter[title][null]": 1,
                    "filter[user][null]": 1,
                    limit: 1,
                    sort: "-id",
                }),
                this.api.get("/collection_presets", {
                    "filter[collection][eq]": collection,
                    "filter[role][eq]": role,
                    "filter[title][null]": 1,
                    "filter[user][null]": 1,
                    limit: 1,
                    sort: "-id",
                }),
                this.api.get("/collection_presets", {
                    "filter[collection][eq]": collection,
                    "filter[title][null]": 1,
                    "filter[user][eq]": id,
                    limit: 1,
                    sort: "-id",
                }),
            ]).then((values) => {
                const [col, role, user] = values;
                if (user.data && user.data.length > 0) {
                    return user.data[0];
                }
                if (role.data && role.data.length > 0) {
                    return role.data[0];
                }
                if (col.data && col.data.length > 0) {
                    return col.data[0];
                }
                return {};
            });
        });
    }
    // #endregion listing preferences
    // #region permissions
    /**
     * Get permissions
     * @param {QueryParamsType?} params
     * @return {Promise<IPermission>}
     */
    getPermissions(params = {}) {
        return this.getItems("directus_permissions", params);
    }
    /**
     * TODO: Fix type-def for return
     * Get the currently logged in user's permissions
     * @typeparam TResponse Permissions type as array extending any[]
     */
    getMyPermissions(params = {}) {
        return this.api.get("/permissions/me", params);
    }
    /**
     * TODO: Fix type-def for param and return
     * Create multiple new permissions
     * @typeparam TResponse Permissions type as array extending any[]
     */
    createPermissions(data) {
        return this.api.post("/permissions", data);
    }
    /**
     * TODO: Fix type-def for param and return
     * Update multiple permission records
     * @typeparam TResponse Permissions type as array extending any[]
     */
    updatePermissions(data) {
        return this.api.patch("/permissions", data);
    }
    // #endregion permissions
    // #region relations
    /**
     * Get all relationships
     * @param {QueryParamsType?} params
     * @return {Promise<IRelationsResponse>}
     */
    getRelations(params = {}) {
        return this.api.get("/relations", params);
    }
    /**
     * Creates new relation
     * @param {IRelation} data
     * @return {Promise<IRelationResponse>}
     */
    createRelation(data) {
        return this.api.post("/relations", data);
    }
    /**
     * Updates existing relation
     */
    updateRelation(primaryKey, data) {
        return this.api.patch(`/relations/${primaryKey}`, data);
    }
    /**
     * Get the relationship information for the given collection
     */
    getCollectionRelations(collection, params = {}) {
        return Promise.all([
            this.api.get("/relations", {
                "filter[collection_many][eq]": collection,
            }),
            this.api.get("/relations", {
                "filter[collection_one][eq]": collection,
            }),
        ]);
    }
    // #endregion relations
    // #region revisions
    /**
     * Get a single item's revisions by primary key
     * @typeparam DataAndDelta  The data including delta type for the revision
     * @param {string} collection
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    getItemRevisions(collection, primaryKey, params = {}) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.get(`${collectionBasePath}/${primaryKey}/revisions`, params);
    }
    /**
     * Revert an item to a previous state
     * @param {string} collection
     * @param {PrimaryKeyType} primaryKey
     * @param {number} revisionID
     */
    revert(collection, primaryKey, revisionID) {
        const collectionBasePath = getCollectionItemPath(collection);
        return this.api.patch(`${collectionBasePath}/${primaryKey}/revert/${revisionID}`);
    }
    // #endregion revisions
    // #region roles
    /**
     * Get a single user role
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    getRole(primaryKey, params = {}) {
        return this.api.get(`/roles/${primaryKey}`, params);
    }
    /**
     * Get the user roles
     * @param {QueryParamsType?} params
     */
    getRoles(params = {}) {
        return this.api.get("/roles", params);
    }
    /**
     * Update a user role
     * @param {PrimaryKeyType} primaryKey
     * @param {Role} body
     */
    updateRole(primaryKey, body) {
        return this.updateItem("directus_roles", primaryKey, body);
    }
    /**
     * Create a new user role
     * @param {Role} body
     */
    createRole(body) {
        return this.createItem("directus_roles", body);
    }
    /**
     * Delete a user rol by primary key
     * @param {PrimaryKeyType} primaryKey
     */
    deleteRole(primaryKey) {
        return this.deleteItem("directus_roles", primaryKey);
    }
    // #endregion roles
    // #region settings
    /**
     * Get Directus' global settings
     * @param {QueryParamsType?} params
     * Limit is hardcoded to -1 because we always want to return all settings
     */
    getSettings(params = {}) {
        params.limit = -1;
        return this.api.get("/settings", params);
    }
    /**
     * Get the "fields" for directus_settings
     * @param {QueryParamsType?} params
     */
    getSettingsFields(params = {}) {
        return this.api.get("/settings/fields", params);
    }
    // #endregion settings
    // #region users
    /**
     * Get a list of available users in Directus
     * @param {QueryParamsType?} params
     */
    getUsers(params = {}) {
        return this.api.get("/users", params);
    }
    /**
     * Get a single Directus user
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    getUser(primaryKey, params = {}) {
        return this.api.get(`/users/${primaryKey}`, params);
    }
    /**
     * Get the user info of the currently logged in user
     * @param {QueryParamsType?} params
     */
    getMe(params = {}) {
        return this.api.get("/users/me", params);
    }
    /**
     * Update a single user based on primaryKey
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    updateUser(primaryKey, body) {
        return this.updateItem("directus_users", primaryKey, body);
    }
    // #endregion users
    // #region server admin
    /**
     * This will update the database of the API instance to the latest version
     * using the migrations in the API
     * @return {Promise<void>}
     */
    updateDatabase() {
        return this.api.post("/update");
    }
    /**
     * Ping the API to check if it exists / is up and running, returns "pong"
     * @return {Promise<string>}
     */
    ping() {
        return this.api.request("get", "/server/ping", {}, {}, true, {}, true);
    }
    /**
     * Get the server info from the API
     * @return {Promise<IServerInformationResponse>}
     */
    serverInfo() {
        return this.api.request("get", "/", {}, {}, true);
    }
    /**
     * TODO: Add response type-def
     * Get the server info from the project
     * @return {Promise<any>}
     */
    projectInfo() {
        return this.api.request("get", "/");
    }
    /**
     * TODO: Add response type-def
     * Get all the setup third party auth providers
     * @return {Promise<any>}
     */
    getThirdPartyAuthProviders() {
        return this.api.get("/auth/sso");
    }
    /**
     * Do a test call to check if you're logged in
     * @return {Promise<boolean>}
     */
    isLoggedIn() {
        return new Promise(resolve => {
            this.api
                .get("/")
                .then(res => {
                if (res.public === undefined) {
                    return resolve(true);
                }
                else {
                    return resolve(false);
                }
            })
                .catch(() => resolve(false));
        });
    }
}
//# sourceMappingURL=SDK.js.map