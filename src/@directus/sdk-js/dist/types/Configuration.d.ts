/**
 * @module Configuration
 */
import { AuthModes } from "./Authentication";
export interface IStorageAPI {
    getItem<T extends any = any>(key: string): T;
    setItem(key: string, value: any): void;
    removeItem(key: string): void;
}
export interface IConfigurationValues {
    url: string;
    project: string;
    token?: string;
    localExp?: number;
    tokenExpirationTime?: number;
    persist: boolean;
    mode: AuthModes;
    storage?: IStorageAPI;
}
export interface IConfiguration {
    token?: string;
    url: string;
    project: string;
    localExp?: number;
    tokenExpirationTime?: number;
    persist: boolean;
    mode: AuthModes;
    dehydrate(): IConfigurationValues | undefined;
    deleteHydratedConfig(): void;
    hydrate(config: IConfigurationValues): void;
    partialUpdate(config: Partial<IConfigurationValues>): void;
    reset(): void;
    update(config: IConfigurationValues): void;
}
export interface IConfigurationDefaults {
    tokenExpirationTime: number;
    mode: AuthModes;
}
export interface IConfigurationOptions {
    /**
     * The URL of the direcuts CMS
     */
    url: string;
    /**
     * The token to authenticate if preferred
     */
    token?: string;
    /**
     * Project namespace
     */
    project: string;
    /**
     * Default login expiration as number in ms
     */
    localExp?: number;
    /**
     * If the token should be persitated or rehydrated
     */
    persist?: boolean;
    /**
     * Whether to use cookies or JWTs
     */
    mode: AuthModes;
    /**
     * Auto token expiration time
     */
    tokenExpirationTime?: number;
    storage?: IStorageAPI;
}
/**
 * Configuration holder for directus implementations
 * @author Jan Biasi <biasijan@gmail.com>
 */
export declare class Configuration implements IConfiguration {
    private storage?;
    /**
     * Defaults for all directus sdk instances, can be modified if preferred
     * @type {IConfigurationDefaults}
     */
    static defaults: IConfigurationDefaults;
    /**
     * Saves the internal configuration values, **DO NOT modify** from the outside
     * @internal
     */
    private internalConfiguration;
    /**
     * Creates a new configuration instance, will be used once for each directus instance (passing refs).
     * @constructor
     * @param {IConfigurationOptions} initialConfig   Initial configuration values
     * @param {IStorageAPI?} storage                  Storage adapter for persistence
     */
    constructor(initialConfig?: IConfigurationOptions, storage?: IStorageAPI | undefined);
    get token(): string | undefined;
    set token(token: string | undefined);
    get tokenExpirationTime(): number | undefined;
    set tokenExpirationTime(tokenExpirationTime: number | undefined);
    get url(): string;
    set url(url: string);
    get project(): string;
    set project(project: string);
    get localExp(): number | undefined;
    set localExp(localExp: number | undefined);
    get persist(): boolean;
    set persist(persist: boolean);
    get mode(): AuthModes;
    set mode(mode: AuthModes);
    /**
     * Update the configuration values, will also hydrate them if persistance activated
     * @param {IConfigurationValues} config
     */
    update(config: IConfigurationValues): void;
    /**
     * Update partials of the configuration, behaves like the [update] method
     * @param {Partial<IConfigurationValues>} config
     */
    partialUpdate(config: Partial<IConfigurationValues>): void;
    /**
     * Reset the whole confiugration and remove hydrated values from storage as well
     */
    reset(): void;
    dehydrate(): IConfigurationValues | undefined;
    hydrate(props: IConfigurationValues): void;
    deleteHydratedConfig(): void;
    private dehydratedInitialConfiguration;
}
//# sourceMappingURL=Configuration.d.ts.map