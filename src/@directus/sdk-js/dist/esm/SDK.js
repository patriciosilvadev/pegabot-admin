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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
var SDK = /** @class */ (function () {
    // create a new instance with an API
    function SDK(options) {
        this.config = new Configuration(options, options ? options.storage : undefined);
        this.api = new API(this.config);
    }
    // #region authentication
    /**
     * Login to the API; Gets a new token from the API and stores it in this.api.token.
     */
    SDK.prototype.login = function (credentials, options) {
        return this.api.auth.login(credentials, options);
    };
    /**
     * Logs the user out by "forgetting" the token, and clearing the refresh interval
     */
    SDK.prototype.logout = function () {
        return this.api.auth.logout();
    };
    /**
     * Resets the client instance by logging out and removing the URL and project
     */
    SDK.prototype.reset = function () {
        this.api.reset();
    };
    /**
     * Refresh the token if it is about to expire (within 30 seconds of expiry date).
     * - Calls onAutoRefreshSuccess with the new token if the refreshing is successful.
     * - Calls onAutoRefreshError if refreshing the token fails for some reason.
     * @returns {[boolean, Error?]}
     */
    SDK.prototype.refreshIfNeeded = function () {
        return this.api.auth.refreshIfNeeded();
    };
    /**
     * Use the passed token to request a new one
     */
    SDK.prototype.refresh = function (token) {
        return this.api.auth.refresh(token);
    };
    /**
     * Request to reset the password of the user with the given email address.
     * The API will send an email to the given email address with a link to generate a new
     * temporary password.
     */
    SDK.prototype.requestPasswordReset = function (email, reset_url) {
        var body = {
            email: email
        };
        reset_url ? body.reset_url = reset_url : null;
        return this.api.post("/auth/password/request", body);
    };
    /**
     * Resets the password
     */
    SDK.prototype.resetPassword = function (password, token) {
        var body = {
            password: password,
            token: token
        };
        return this.api.post("/auth/password/reset", body);
    };
    // #endregion authentication
    // #endregion collection presets
    // #region activity
    /**
     * Get activity
     */
    SDK.prototype.getActivity = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/activity", params);
    };
    // #endregion activity
    // #region bookmarks
    /**
     * Get the bookmarks of the current user
     * @deprecated Will be removed in the next major version, please use {@link SDK.getCollectionPresets} instead
     * @see https://docs.directus.io/advanced/legacy-upgrades.html#directus-bookmarks
     */
    SDK.prototype.getMyBookmarks = function (params) {
        if (params === void 0) { params = {}; }
        return this.getCollectionPresets(params);
    };
    // #endregion bookmarks
    // #region collections
    /**
     * Get all available collections
     */
    SDK.prototype.getCollections = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/collections", params);
    };
    /**
     * Get collection info by name
     */
    SDK.prototype.getCollection = function (collection, params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/collections/" + collection, params);
    };
    /**
     * Create a collection
     */
    SDK.prototype.createCollection = function (data) {
        return this.api.post("/collections", data);
    };
    /**
     * Updates a certain collection
     */
    SDK.prototype.updateCollection = function (collection, data) {
        return this.api.patch("/collections/" + collection, data);
    };
    /**
     * Deletes a certain collection
     */
    SDK.prototype.deleteCollection = function (collection) {
        return this.api.delete("/collections/" + collection);
    };
    // #endregion collections
    // #region collection presets
    /**
     * Get the collection presets of the current user
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    SDK.prototype.getCollectionPresets = function (params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var user, id, role;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMe({ fields: "*.*" })];
                    case 1:
                        user = (_a.sent()).data;
                        id = user.id;
                        role = user.role.id;
                        return [2 /*return*/, Promise.all([
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
                            ]).then(function (values) {
                                var user = values[0], role = values[1], globalBookmarks = values[2];
                                return __spreadArrays((user.data || []), (role.data || []), (globalBookmarks.data || []));
                            })];
                }
            });
        });
    };
    /**
     * Create a new collection preset (bookmark / listing preferences)
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    SDK.prototype.createCollectionPreset = function (data) {
        return this.api.post("/collection_presets", data);
    };
    /**
     * Update collection preset (bookmark / listing preference)
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    // tslint:disable-next-line: max-line-length
    SDK.prototype.updateCollectionPreset = function (primaryKey, data) {
        return this.api.patch("/collection_presets/" + primaryKey, data);
    };
    /**
     * Delete collection preset by primarykey
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    SDK.prototype.deleteCollectionPreset = function (primaryKey) {
        return this.api.delete("/collection_presets/" + primaryKey);
    };
    // #endregion collection presets
    // #region extensions
    /**
     * Get the information of all installed interfaces
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    SDK.prototype.getInterfaces = function () {
        return this.api.request("get", "/interfaces", {}, {}, true);
    };
    /**
     * Get the information of all installed layouts
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    SDK.prototype.getLayouts = function () {
        return this.api.request("get", "/layouts", {}, {}, true);
    };
    /**
     * Get the information of all installed modules
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    SDK.prototype.getModules = function () {
        return this.api.request("get", "/modules", {}, {}, true);
    };
    // #endregion extensions
    // #region fields
    /**
     * Get all fields that are in Directus
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    SDK.prototype.getAllFields = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/fields", params);
    };
    /**
     * Get the fields that have been setup for a given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    SDK.prototype.getFields = function (collection, params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/fields/" + collection, params);
    };
    /**
     * Get the field information for a single given field
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    SDK.prototype.getField = function (collection, fieldName, params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/fields/" + collection + "/" + fieldName, params);
    };
    /**
     * Create a field in the given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    SDK.prototype.createField = function (collection, fieldInfo) {
        return this.api.post("/fields/" + collection, fieldInfo);
    };
    /**
     * Update a given field in a given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    SDK.prototype.updateField = function (collection, fieldName, fieldInfo) {
        return this.api.patch("/fields/" + collection + "/" + fieldName, fieldInfo);
    };
    SDK.prototype.updateFields = function (collection, fieldsInfoOrFieldNames, fieldInfo) {
        if (fieldInfo === void 0) { fieldInfo = null; }
        if (fieldInfo) {
            return this.api.patch("/fields/" + collection + "/" + fieldsInfoOrFieldNames.join(","), fieldInfo);
        }
        return this.api.patch("/fields/" + collection, fieldsInfoOrFieldNames);
    };
    /**
     * Delete a field from a collection
     * @see @see https://docs.directus.io/api/reference.html#fields-2
     */
    SDK.prototype.deleteField = function (collection, fieldName) {
        return this.api.delete("/fields/" + collection + "/" + fieldName);
    };
    // #endregion fields
    // #region assets
    /**
     * @see https://docs.directus.io/api/reference.html#assets
     */
    SDK.prototype.getAssetUrl = function (privateHash, params) {
        var querystring = params ? querify(params) : "";
        var url = [
            this.config.url.replace(/\/$/, ""),
            this.config.project,
            "assets",
            privateHash
        ].join("/");
        return querystring.length > 0 ? url + "?" + querystring : url;
    };
    /**
     * @see https://docs.directus.io/api/reference.html#assets
     */
    SDK.prototype.getAsset = function (privateHash, params) {
        return __awaiter(this, void 0, void 0, function () {
            var previousResponseType, response;
            return __generator(this, function (_a) {
                previousResponseType = this.api.xhr.defaults.responseType;
                this.api.xhr.defaults.responseType = "arraybuffer";
                response = this.api.request("get", "/assets/" + privateHash, params, undefined, false, undefined, true);
                this.api.xhr.defaults.responseType = previousResponseType;
                return [2 /*return*/, response];
            });
        });
    };
    // #endregion assets
    // #region files
    /**
     * Get a list of available files from Directus
     * @see https://docs.directus.io/api/reference.html#files
     */
    SDK.prototype.getFiles = function (params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.api.get("/files", params)];
            });
        });
    };
    /**
     * Get a certain file or certain file list from Directus
     * @see https://docs.directus.io/api/reference.html#files
     */
    SDK.prototype.getFile = function (fileName, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var files;
            return __generator(this, function (_a) {
                files = typeof fileName === "string" ? fileName : fileName.join(",");
                return [2 /*return*/, this.api.get("/files/" + files, params)];
            });
        });
    };
    /**
     * Upload multipart files in multipart/form-data
     * @see https://docs.directus.io/api/reference.html#files
     */
    SDK.prototype.uploadFiles = function (data, // TODO: fix type definition
    onUploadProgress) {
        if (onUploadProgress === void 0) { onUploadProgress = function () { return ({}); }; }
        var headers = {
            "Content-Type": "multipart/form-data",
            "X-Directus-Project": this.config.project,
        };
        if (this.config.token && isString(this.config.token) && this.config.token.length > 0) {
            headers["Authorization"] = "Bearer " + this.config.token;
        }
        return this.api.post("/files", data, {
            headers: headers,
            onUploadProgress: onUploadProgress,
        });
    };
    // #endregion files
    // #region items
    /**
     * Update an existing item
     * @see https://docs.directus.io/api/reference.html#update-item
     * @typeparam TTPartialItem Defining the item type in object schema
     * @typeparam TTResult Extension of [TPartialItem] as expected result
     */
    SDK.prototype.updateItem = function (collection, primaryKey, body, params) {
        if (params === void 0) { params = {}; }
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.patch(collectionBasePath + "/" + primaryKey, body, params);
    };
    /**
     * Update multiple items
     * @see https://docs.directus.io/api/reference.html#update-items
     * @typeparam TPartialItem Defining an array of items, each in object schema
     * @typeparam TResult Extension of [TPartialItem] as expected result
     * @return {Promise<IItemsResponse<TPartialItem & TResult>>}
     */
    SDK.prototype.updateItems = function (collection, body, params) {
        if (params === void 0) { params = {}; }
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.patch(collectionBasePath, body, params);
    };
    /**
     * Create a new item
     * @typeparam TItemType Defining an item and its fields in object schema
     * @return {Promise<IItemsResponse<TItemType>>}
     */
    SDK.prototype.createItem = function (collection, body) {
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.post(collectionBasePath, body);
    };
    /**
     * Create multiple items
     * @see https://docs.directus.io/api/reference.html#create-items
     * @typeparam TItemsType Defining an array of items, each in object schema
     */
    SDK.prototype.createItems = function (collection, body) {
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.post(collectionBasePath, body);
    };
    /**
     * Get items from a given collection
     * @see https://docs.directus.io/api/reference.html#get-multiple-items
     * @typeparam TItemsType Defining an array of items, each in object schema
     */
    SDK.prototype.getItems = function (collection, params) {
        if (params === void 0) { params = {}; }
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.get(collectionBasePath, params);
    };
    /**
     * Get a single item by primary key
     * @see https://docs.directus.io/api/reference.html#get-item
     * @typeparam TItemType Defining fields of an item in object schema
     */
    SDK.prototype.getItem = function (collection, primaryKey, params) {
        if (params === void 0) { params = {}; }
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.get(collectionBasePath + "/" + primaryKey, params);
    };
    /**
     * Delete a single item by primary key
     * @see https://docs.directus.io/api/reference.html#delete-items
     */
    SDK.prototype.deleteItem = function (collection, primaryKey) {
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.delete(collectionBasePath + "/" + primaryKey);
    };
    /**
     * Delete multiple items by primary key
     * @see https://docs.directus.io/api/reference.html#delete-items
     */
    SDK.prototype.deleteItems = function (collection, primaryKeys) {
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.delete(collectionBasePath + "/" + primaryKeys.join());
    };
    // #endregion items
    // #region listing preferences
    /**
     * Get the collection presets of the current user for a single collection
     */
    SDK.prototype.getMyListingPreferences = function (collection, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var user, id, role;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMe({ fields: "*.*" })];
                    case 1:
                        user = (_a.sent()).data;
                        id = user.id;
                        role = user.role.id;
                        return [2 /*return*/, Promise.all([
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
                            ]).then(function (values) {
                                var col = values[0], role = values[1], user = values[2];
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
                            })];
                }
            });
        });
    };
    // #endregion listing preferences
    // #region permissions
    /**
     * Get permissions
     * @param {QueryParamsType?} params
     * @return {Promise<IPermission>}
     */
    SDK.prototype.getPermissions = function (params) {
        if (params === void 0) { params = {}; }
        return this.getItems("directus_permissions", params);
    };
    /**
     * TODO: Fix type-def for return
     * Get the currently logged in user's permissions
     * @typeparam TResponse Permissions type as array extending any[]
     */
    SDK.prototype.getMyPermissions = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/permissions/me", params);
    };
    /**
     * TODO: Fix type-def for param and return
     * Create multiple new permissions
     * @typeparam TResponse Permissions type as array extending any[]
     */
    SDK.prototype.createPermissions = function (data) {
        return this.api.post("/permissions", data);
    };
    /**
     * TODO: Fix type-def for param and return
     * Update multiple permission records
     * @typeparam TResponse Permissions type as array extending any[]
     */
    SDK.prototype.updatePermissions = function (data) {
        return this.api.patch("/permissions", data);
    };
    // #endregion permissions
    // #region relations
    /**
     * Get all relationships
     * @param {QueryParamsType?} params
     * @return {Promise<IRelationsResponse>}
     */
    SDK.prototype.getRelations = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/relations", params);
    };
    /**
     * Creates new relation
     * @param {IRelation} data
     * @return {Promise<IRelationResponse>}
     */
    SDK.prototype.createRelation = function (data) {
        return this.api.post("/relations", data);
    };
    /**
     * Updates existing relation
     */
    SDK.prototype.updateRelation = function (primaryKey, data) {
        return this.api.patch("/relations/" + primaryKey, data);
    };
    /**
     * Get the relationship information for the given collection
     */
    SDK.prototype.getCollectionRelations = function (collection, params) {
        if (params === void 0) { params = {}; }
        return Promise.all([
            this.api.get("/relations", {
                "filter[collection_many][eq]": collection,
            }),
            this.api.get("/relations", {
                "filter[collection_one][eq]": collection,
            }),
        ]);
    };
    // #endregion relations
    // #region revisions
    /**
     * Get a single item's revisions by primary key
     * @typeparam DataAndDelta  The data including delta type for the revision
     * @param {string} collection
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    SDK.prototype.getItemRevisions = function (collection, primaryKey, params) {
        if (params === void 0) { params = {}; }
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.get(collectionBasePath + "/" + primaryKey + "/revisions", params);
    };
    /**
     * Revert an item to a previous state
     * @param {string} collection
     * @param {PrimaryKeyType} primaryKey
     * @param {number} revisionID
     */
    SDK.prototype.revert = function (collection, primaryKey, revisionID) {
        var collectionBasePath = getCollectionItemPath(collection);
        return this.api.patch(collectionBasePath + "/" + primaryKey + "/revert/" + revisionID);
    };
    // #endregion revisions
    // #region roles
    /**
     * Get a single user role
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    SDK.prototype.getRole = function (primaryKey, params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/roles/" + primaryKey, params);
    };
    /**
     * Get the user roles
     * @param {QueryParamsType?} params
     */
    SDK.prototype.getRoles = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/roles", params);
    };
    /**
     * Update a user role
     * @param {PrimaryKeyType} primaryKey
     * @param {Role} body
     */
    SDK.prototype.updateRole = function (primaryKey, body) {
        return this.updateItem("directus_roles", primaryKey, body);
    };
    /**
     * Create a new user role
     * @param {Role} body
     */
    SDK.prototype.createRole = function (body) {
        return this.createItem("directus_roles", body);
    };
    /**
     * Delete a user rol by primary key
     * @param {PrimaryKeyType} primaryKey
     */
    SDK.prototype.deleteRole = function (primaryKey) {
        return this.deleteItem("directus_roles", primaryKey);
    };
    // #endregion roles
    // #region settings
    /**
     * Get Directus' global settings
     * @param {QueryParamsType?} params
     * Limit is hardcoded to -1 because we always want to return all settings
     */
    SDK.prototype.getSettings = function (params) {
        if (params === void 0) { params = {}; }
        params.limit = -1;
        return this.api.get("/settings", params);
    };
    /**
     * Get the "fields" for directus_settings
     * @param {QueryParamsType?} params
     */
    SDK.prototype.getSettingsFields = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/settings/fields", params);
    };
    // #endregion settings
    // #region users
    /**
     * Get a list of available users in Directus
     * @param {QueryParamsType?} params
     */
    SDK.prototype.getUsers = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/users", params);
    };
    /**
     * Get a single Directus user
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    SDK.prototype.getUser = function (primaryKey, params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/users/" + primaryKey, params);
    };
    /**
     * Get the user info of the currently logged in user
     * @param {QueryParamsType?} params
     */
    SDK.prototype.getMe = function (params) {
        if (params === void 0) { params = {}; }
        return this.api.get("/users/me", params);
    };
    /**
     * Update a single user based on primaryKey
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    SDK.prototype.updateUser = function (primaryKey, body) {
        return this.updateItem("directus_users", primaryKey, body);
    };
    // #endregion users
    // #region server admin
    /**
     * This will update the database of the API instance to the latest version
     * using the migrations in the API
     * @return {Promise<void>}
     */
    SDK.prototype.updateDatabase = function () {
        return this.api.post("/update");
    };
    /**
     * Ping the API to check if it exists / is up and running, returns "pong"
     * @return {Promise<string>}
     */
    SDK.prototype.ping = function () {
        return this.api.request("get", "/server/ping", {}, {}, true, {}, true);
    };
    /**
     * Get the server info from the API
     * @return {Promise<IServerInformationResponse>}
     */
    SDK.prototype.serverInfo = function () {
        return this.api.request("get", "/", {}, {}, true);
    };
    /**
     * TODO: Add response type-def
     * Get the server info from the project
     * @return {Promise<any>}
     */
    SDK.prototype.projectInfo = function () {
        return this.api.request("get", "/");
    };
    /**
     * TODO: Add response type-def
     * Get all the setup third party auth providers
     * @return {Promise<any>}
     */
    SDK.prototype.getThirdPartyAuthProviders = function () {
        return this.api.get("/auth/sso");
    };
    /**
     * Do a test call to check if you're logged in
     * @return {Promise<boolean>}
     */
    SDK.prototype.isLoggedIn = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.api
                .get("/")
                .then(function (res) {
                if (res.public === undefined) {
                    return resolve(true);
                }
                else {
                    return resolve(false);
                }
            })
                .catch(function () { return resolve(false); });
        });
    };
    return SDK;
}());
export { SDK };
//# sourceMappingURL=SDK.js.map