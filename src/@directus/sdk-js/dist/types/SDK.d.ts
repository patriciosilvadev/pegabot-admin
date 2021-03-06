/**
 * @module SDK
 */
import { ILoginCredentials, ILoginOptions } from "./schemes/auth/Login";
import { BodyType } from "./schemes/http/Body";
import { QueryParams as QueryParamsType, AssetQueryParams as AssetQueryParamsType } from "./schemes/http/Query";
import { IField } from "./schemes/directus/Field";
import { IRelation } from "./schemes/directus/Relation";
import { IRole } from "./schemes/directus/Role";
import { ICollection } from "./schemes/directus/Collection";
import { ICollectionPreset } from "./schemes/directus/CollectionPreset";
import { IPermission } from "./schemes/directus/Permission";
import { IUser } from "./schemes/directus/User";
import { IUpdateCollectionPresetBody } from "./schemes/request/Collection";
import { IAuthenticateResponse } from "./schemes/auth/Authenticate";
import { IRelationResponse, IRelationsResponse } from "./schemes/response/Relation";
import { IActivityResponse } from "./schemes/response/Activity";
import { ICollectionResponse, ICollectionsResponse } from "./schemes/response/Collection";
import { ICollectionPresetResponse } from "./schemes/response/CollectionPreset";
import { IFieldResponse, IFieldsResponse } from "./schemes/response/Field";
import { IFileResponse, IFilesResponse } from "./schemes/response/File";
import { IItemResponse, IItemsResponse } from "./schemes/response/Item";
import { ILogoutResponse } from "./schemes/response/Login";
import { IRevisionResponse } from "./schemes/response/Revision";
import { IRoleResponse } from "./schemes/response/Role";
import { IRefreshTokenResponse } from "./schemes/response/Token";
import { IUserResponse, IUsersResponse } from "./schemes/response/User";
import { IAPI } from "./API";
import { IConfiguration, IConfigurationOptions } from "./Configuration";
import { IServerInformationResponse } from "./schemes/response/ServerInformation";
import { ISettingsResponse } from "./schemes/response/Setting";
declare type PrimaryKeyType = string | number;
/**
 * Main SDK implementation provides the public API to interact with a
 * remote directus instance.
 * @uses API
 * @uses Configuration
 */
export declare class SDK {
    config: IConfiguration;
    api: IAPI;
    constructor(options: IConfigurationOptions);
    /**
     * Login to the API; Gets a new token from the API and stores it in this.api.token.
     */
    login(credentials: ILoginCredentials, options?: ILoginOptions): Promise<IAuthenticateResponse>;
    /**
     * Logs the user out by "forgetting" the token, and clearing the refresh interval
     */
    logout(): Promise<ILogoutResponse>;
    /**
     * Resets the client instance by logging out and removing the URL and project
     */
    reset(): void;
    /**
     * Refresh the token if it is about to expire (within 30 seconds of expiry date).
     * - Calls onAutoRefreshSuccess with the new token if the refreshing is successful.
     * - Calls onAutoRefreshError if refreshing the token fails for some reason.
     * @returns {[boolean, Error?]}
     */
    refreshIfNeeded(): Promise<[boolean, Error?]> | void;
    /**
     * Use the passed token to request a new one
     */
    refresh(token: string): Promise<IRefreshTokenResponse>;
    /**
     * Request to reset the password of the user with the given email address.
     * The API will send an email to the given email address with a link to generate a new
     * temporary password.
     */
    requestPasswordReset<TResponse extends any = any>(email: string, reset_url?: string): Promise<TResponse>;
    /**
     * Resets the password
     */
    resetPassword<TResponse extends any = any>(password: string, token: string): Promise<TResponse>;
    /**
     * Get activity
     */
    getActivity(params?: QueryParamsType): Promise<IActivityResponse>;
    /**
     * Get the bookmarks of the current user
     * @deprecated Will be removed in the next major version, please use {@link SDK.getCollectionPresets} instead
     * @see https://docs.directus.io/advanced/legacy-upgrades.html#directus-bookmarks
     */
    getMyBookmarks<TResponse extends any[] = any[]>(params?: QueryParamsType): Promise<TResponse>;
    /**
     * Get all available collections
     */
    getCollections(params?: QueryParamsType): Promise<ICollectionsResponse[]>;
    /**
     * Get collection info by name
     */
    getCollection(collection: string, params?: QueryParamsType): Promise<ICollectionResponse>;
    /**
     * Create a collection
     */
    createCollection(data: ICollection): Promise<ICollectionResponse>;
    /**
     * Updates a certain collection
     */
    updateCollection(collection: string, data: Partial<ICollection>): Promise<ICollectionResponse>;
    /**
     * Deletes a certain collection
     */
    deleteCollection(collection: string): Promise<void>;
    /**
     * Get the collection presets of the current user
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    getCollectionPresets<TResponse extends any[] = any[]>(params?: QueryParamsType): Promise<TResponse>;
    /**
     * Create a new collection preset (bookmark / listing preferences)
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    createCollectionPreset<CollectionPreset extends ICollectionPreset>(data: CollectionPreset): Promise<ICollectionPresetResponse<CollectionPreset>>;
    /**
     * Update collection preset (bookmark / listing preference)
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    updateCollectionPreset<PartialCollectionPreset extends Partial<ICollectionPreset>, TResultCollectionPreset extends ICollectionPreset = ICollectionPreset>(primaryKey: PrimaryKeyType, data: IUpdateCollectionPresetBody): Promise<ICollectionPresetResponse<PartialCollectionPreset & TResultCollectionPreset>>;
    /**
     * Delete collection preset by primarykey
     * @see https://docs.directus.io/api/reference.html#collection-presets
     */
    deleteCollectionPreset(primaryKey: PrimaryKeyType): Promise<void>;
    /**
     * Get the information of all installed interfaces
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    getInterfaces<TResponse extends any[] = any[]>(): Promise<TResponse>;
    /**
     * Get the information of all installed layouts
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    getLayouts<TResponse extends any[] = any[]>(): Promise<TResponse>;
    /**
     * Get the information of all installed modules
     * @see https://docs.directus.io/api/reference.html#get-extensions
     */
    getModules<TResponse extends any[] = any[]>(): Promise<TResponse>;
    /**
     * Get all fields that are in Directus
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    getAllFields<TFieldsType extends IField[]>(params?: QueryParamsType): Promise<IFieldsResponse<TFieldsType>>;
    /**
     * Get the fields that have been setup for a given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    getFields<TFieldsType extends IField[]>(collection: string, params?: QueryParamsType): Promise<IFieldsResponse<TFieldsType>>;
    /**
     * Get the field information for a single given field
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    getField<TFieldType extends IField>(collection: string, fieldName: string, params?: QueryParamsType): Promise<IFieldResponse<TFieldType>>;
    /**
     * Create a field in the given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    createField<TFieldType extends IField>(collection: string, fieldInfo: TFieldType): Promise<IFieldResponse<TFieldType>>;
    /**
     * Update a given field in a given collection
     * @see https://docs.directus.io/api/reference.html#fields-2
     */
    updateField<TFieldType extends Partial<IField>>(collection: string, fieldName: string, fieldInfo: TFieldType): Promise<IFieldResponse<IField & TFieldType> | undefined>;
    /**
     * Update multiple fields at once
     * @see https://docs.directus.io/api/reference.html#fields-2
     * @example
     *
     * // Set multiple fields to the same value
     * updateFields("projects", ["first_name", "last_name", "email"], {
     *   default_value: ""
     * })
     *
     * // Set multiple fields to different values
     * updateFields("projects", [
     *   {
     *     id: 14,
     *     sort: 1
     *   },
     *   {
     *     id: 17,
     *     sort: 2
     *   },
     *   {
     *     id: 912,
     *     sort: 3
     *   }
     * ])
     */
    updateFields<TFieldsType extends IField[]>(collection: string, fields: Array<Partial<IField>>): Promise<IFieldsResponse<TFieldsType & IField[]> | undefined>;
    updateFields<TFieldsType extends IField[]>(collection: string, fields: string[], fieldInfo: Partial<IField>): Promise<IFieldsResponse<TFieldsType & IField[]> | undefined>;
    /**
     * Delete a field from a collection
     * @see @see https://docs.directus.io/api/reference.html#fields-2
     */
    deleteField(collection: string, fieldName: string): Promise<void>;
    /**
     * @see https://docs.directus.io/api/reference.html#assets
     */
    getAssetUrl(privateHash: string, params?: AssetQueryParamsType): string;
    /**
     * @see https://docs.directus.io/api/reference.html#assets
     */
    getAsset(privateHash: string, params?: AssetQueryParamsType): Promise<any>;
    /**
     * Get a list of available files from Directus
     * @see https://docs.directus.io/api/reference.html#files
     */
    getFiles(params?: QueryParamsType): Promise<IFilesResponse>;
    /**
     * Get a certain file or certain file list from Directus
     * @see https://docs.directus.io/api/reference.html#files
     */
    getFile<TFile extends string | string[]>(fileName: TFile, params?: QueryParamsType): Promise<TFile extends string ? IFileResponse : IFilesResponse>;
    /**
     * Upload multipart files in multipart/form-data
     * @see https://docs.directus.io/api/reference.html#files
     */
    uploadFiles<TResponse extends any = any[]>(data: object, // TODO: fix type definition
    onUploadProgress?: () => object): Promise<TResponse>;
    /**
     * Update an existing item
     * @see https://docs.directus.io/api/reference.html#update-item
     * @typeparam TTPartialItem Defining the item type in object schema
     * @typeparam TTResult Extension of [TPartialItem] as expected result
     */
    updateItem<TTPartialItem extends object, TTResult extends object = TTPartialItem>(collection: string, primaryKey: PrimaryKeyType, body: TTPartialItem, params?: QueryParamsType): Promise<IItemResponse<TTPartialItem & TTResult>>;
    /**
     * Update multiple items
     * @see https://docs.directus.io/api/reference.html#update-items
     * @typeparam TPartialItem Defining an array of items, each in object schema
     * @typeparam TResult Extension of [TPartialItem] as expected result
     * @return {Promise<IItemsResponse<TPartialItem & TResult>>}
     */
    updateItems<TPartialItem extends object[], TResult extends TPartialItem = TPartialItem>(collection: string, body: TPartialItem, params?: QueryParamsType): Promise<IItemsResponse<TPartialItem & TResult>>;
    /**
     * Create a new item
     * @typeparam TItemType Defining an item and its fields in object schema
     * @return {Promise<IItemsResponse<TItemType>>}
     */
    createItem<TItemType extends object>(collection: string, body: TItemType): Promise<IItemResponse<TItemType>>;
    /**
     * Create multiple items
     * @see https://docs.directus.io/api/reference.html#create-items
     * @typeparam TItemsType Defining an array of items, each in object schema
     */
    createItems<TItemsType extends Array<{}>>(collection: string, body: BodyType): Promise<IItemsResponse<TItemsType>>;
    /**
     * Get items from a given collection
     * @see https://docs.directus.io/api/reference.html#get-multiple-items
     * @typeparam TItemsType Defining an array of items, each in object schema
     */
    getItems<TTItemsType extends Array<{}>>(collection: string, params?: QueryParamsType): Promise<IItemsResponse<TTItemsType>>;
    /**
     * Get a single item by primary key
     * @see https://docs.directus.io/api/reference.html#get-item
     * @typeparam TItemType Defining fields of an item in object schema
     */
    getItem<TItemType extends object = {}>(collection: string, primaryKey: PrimaryKeyType, params?: QueryParamsType): Promise<IItemResponse<TItemType>>;
    /**
     * Delete a single item by primary key
     * @see https://docs.directus.io/api/reference.html#delete-items
     */
    deleteItem(collection: string, primaryKey: PrimaryKeyType): Promise<void>;
    /**
     * Delete multiple items by primary key
     * @see https://docs.directus.io/api/reference.html#delete-items
     */
    deleteItems(collection: string, primaryKeys: PrimaryKeyType[]): Promise<void>;
    /**
     * Get the collection presets of the current user for a single collection
     */
    getMyListingPreferences<TResponse extends any[] = any[]>(collection: string, params?: QueryParamsType): Promise<TResponse>;
    /**
     * Get permissions
     * @param {QueryParamsType?} params
     * @return {Promise<IPermission>}
     */
    getPermissions(params?: QueryParamsType): Promise<IItemsResponse<IPermission[]>>;
    /**
     * TODO: Fix type-def for return
     * Get the currently logged in user's permissions
     * @typeparam TResponse Permissions type as array extending any[]
     */
    getMyPermissions<TResponse extends any[] = any[]>(params?: QueryParamsType): Promise<TResponse>;
    /**
     * TODO: Fix type-def for param and return
     * Create multiple new permissions
     * @typeparam TResponse Permissions type as array extending any[]
     */
    createPermissions<TResponse extends any[] = any[]>(data: any[]): Promise<TResponse>;
    /**
     * TODO: Fix type-def for param and return
     * Update multiple permission records
     * @typeparam TResponse Permissions type as array extending any[]
     */
    updatePermissions<TResponse extends any[] = any[]>(data: any[]): Promise<TResponse>;
    /**
     * Get all relationships
     * @param {QueryParamsType?} params
     * @return {Promise<IRelationsResponse>}
     */
    getRelations(params?: QueryParamsType): Promise<IRelationsResponse>;
    /**
     * Creates new relation
     * @param {IRelation} data
     * @return {Promise<IRelationResponse>}
     */
    createRelation(data: IRelation): Promise<IRelationResponse>;
    /**
     * Updates existing relation
     */
    updateRelation(primaryKey: PrimaryKeyType, data: Partial<IRelation>): Promise<IRelationResponse>;
    /**
     * Get the relationship information for the given collection
     */
    getCollectionRelations(collection: string, params?: QueryParamsType): Promise<IRelationsResponse[]>;
    /**
     * Get a single item's revisions by primary key
     * @typeparam DataAndDelta  The data including delta type for the revision
     * @param {string} collection
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    getItemRevisions<TDataAndDelta extends object = {}>(collection: string, primaryKey: PrimaryKeyType, params?: QueryParamsType): Promise<IRevisionResponse<TDataAndDelta>>;
    /**
     * Revert an item to a previous state
     * @param {string} collection
     * @param {PrimaryKeyType} primaryKey
     * @param {number} revisionID
     */
    revert(collection: string, primaryKey: PrimaryKeyType, revisionID: number): Promise<void>;
    /**
     * Get a single user role
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    getRole(primaryKey: PrimaryKeyType, params?: QueryParamsType): Promise<IRoleResponse>;
    /**
     * Get the user roles
     * @param {QueryParamsType?} params
     */
    getRoles(params?: QueryParamsType): Promise<IRoleResponse[]>;
    /**
     * Update a user role
     * @param {PrimaryKeyType} primaryKey
     * @param {Role} body
     */
    updateRole<Role extends Partial<IRole>>(primaryKey: PrimaryKeyType, body: Role): Promise<IItemResponse<Role & IRole>>;
    /**
     * Create a new user role
     * @param {Role} body
     */
    createRole<TRole extends IRole>(body: TRole): Promise<IItemResponse<TRole>>;
    /**
     * Delete a user rol by primary key
     * @param {PrimaryKeyType} primaryKey
     */
    deleteRole(primaryKey: PrimaryKeyType): Promise<void>;
    /**
     * Get Directus' global settings
     * @param {QueryParamsType?} params
     * Limit is hardcoded to -1 because we always want to return all settings
     */
    getSettings(params?: QueryParamsType): Promise<ISettingsResponse>;
    /**
     * Get the "fields" for directus_settings
     * @param {QueryParamsType?} params
     */
    getSettingsFields(params?: QueryParamsType): Promise<IFieldsResponse<IField[]>>;
    /**
     * Get a list of available users in Directus
     * @param {QueryParamsType?} params
     */
    getUsers(params?: QueryParamsType): Promise<IUsersResponse<IUser[]>>;
    /**
     * Get a single Directus user
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    getUser<User extends IUser = IUser>(primaryKey: PrimaryKeyType, params?: QueryParamsType): Promise<IUserResponse<User>>;
    /**
     * Get the user info of the currently logged in user
     * @param {QueryParamsType?} params
     */
    getMe<User extends IUser = IUser>(params?: QueryParamsType): Promise<IUserResponse<User>>;
    /**
     * Update a single user based on primaryKey
     * @param {PrimaryKeyType} primaryKey
     * @param {QueryParamsType?} params
     */
    updateUser<User extends Partial<IUser>>(primaryKey: PrimaryKeyType, body: User): Promise<IItemResponse<User & IUser>>;
    /**
     * This will update the database of the API instance to the latest version
     * using the migrations in the API
     * @return {Promise<void>}
     */
    updateDatabase(): Promise<void>;
    /**
     * Ping the API to check if it exists / is up and running, returns "pong"
     * @return {Promise<string>}
     */
    ping(): Promise<string>;
    /**
     * Get the server info from the API
     * @return {Promise<IServerInformationResponse>}
     */
    serverInfo(): Promise<IServerInformationResponse>;
    /**
     * TODO: Add response type-def
     * Get the server info from the project
     * @return {Promise<any>}
     */
    projectInfo(): Promise<any>;
    /**
     * TODO: Add response type-def
     * Get all the setup third party auth providers
     * @return {Promise<any>}
     */
    getThirdPartyAuthProviders(): Promise<any>;
    /**
     * Do a test call to check if you're logged in
     * @return {Promise<boolean>}
     */
    isLoggedIn(): Promise<boolean>;
}
export {};
//# sourceMappingURL=SDK.d.ts.map