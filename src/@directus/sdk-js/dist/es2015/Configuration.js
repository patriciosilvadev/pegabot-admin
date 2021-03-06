/**
 * @module Configuration
 */
const STORAGE_KEY = "directus-sdk-js";
/**
 * Configuration holder for directus implementations
 * @author Jan Biasi <biasijan@gmail.com>
 */
export class Configuration {
    /**
     * Creates a new configuration instance, will be used once for each directus instance (passing refs).
     * @constructor
     * @param {IConfigurationOptions} initialConfig   Initial configuration values
     * @param {IStorageAPI?} storage                  Storage adapter for persistence
     */
    constructor(initialConfig = {}, storage) {
        this.storage = storage;
        let dehydratedConfig = {};
        if (storage && Boolean(initialConfig && initialConfig.persist)) {
            // dehydrate if storage was provided and persist flag is set
            dehydratedConfig = this.dehydratedInitialConfiguration(storage);
        }
        const persist = Boolean(dehydratedConfig.persist || initialConfig.persist);
        const project = dehydratedConfig.project || initialConfig.project;
        const mode = dehydratedConfig.mode || initialConfig.mode || Configuration.defaults.mode;
        const tokenExpirationTime = dehydratedConfig.tokenExpirationTime ||
            initialConfig.tokenExpirationTime ||
            Configuration.defaults.tokenExpirationTime;
        this.internalConfiguration = Object.assign(Object.assign(Object.assign({}, initialConfig), dehydratedConfig), { persist,
            mode,
            project,
            tokenExpirationTime });
    }
    // ACCESSORS =================================================================
    get token() {
        return this.internalConfiguration.token;
    }
    set token(token) {
        this.partialUpdate({ token });
    }
    get tokenExpirationTime() {
        return this.internalConfiguration.tokenExpirationTime;
    }
    set tokenExpirationTime(tokenExpirationTime) {
        if (typeof tokenExpirationTime === "undefined")
            return;
        // TODO: Optionally re-compute the localExp property for the auto-refresh
        this.partialUpdate({
            tokenExpirationTime: tokenExpirationTime * 60000,
        });
    }
    get url() {
        return this.internalConfiguration.url;
    }
    set url(url) {
        this.partialUpdate({ url });
    }
    get project() {
        return this.internalConfiguration.project;
    }
    set project(project) {
        this.partialUpdate({
            project: project,
        });
    }
    get localExp() {
        return this.internalConfiguration.localExp;
    }
    set localExp(localExp) {
        this.partialUpdate({ localExp });
    }
    get persist() {
        return this.internalConfiguration.persist;
    }
    set persist(persist) {
        this.internalConfiguration.persist = persist;
    }
    get mode() {
        return this.internalConfiguration.mode;
    }
    set mode(mode) {
        this.internalConfiguration.mode = mode;
    }
    // HELPER METHODS ============================================================
    /**
     * Update the configuration values, will also hydrate them if persistance activated
     * @param {IConfigurationValues} config
     */
    update(config) {
        this.internalConfiguration = config;
        this.hydrate(config);
    }
    /**
     * Update partials of the configuration, behaves like the [update] method
     * @param {Partial<IConfigurationValues>} config
     */
    partialUpdate(config) {
        this.internalConfiguration = Object.assign(Object.assign({}, this.internalConfiguration), config);
        this.hydrate(this.internalConfiguration);
    }
    /**
     * Reset the whole confiugration and remove hydrated values from storage as well
     */
    reset() {
        delete this.internalConfiguration.token;
        delete this.internalConfiguration.url;
        delete this.internalConfiguration.project;
        delete this.internalConfiguration.localExp;
        this.deleteHydratedConfig();
    }
    // STORAGE METHODS ===========================================================
    dehydrate() {
        if (!this.storage || !this.persist) {
            return;
        }
        const nativeValue = this.storage.getItem(STORAGE_KEY);
        if (!nativeValue) {
            return;
        }
        const parsedConfig = JSON.parse(nativeValue);
        this.internalConfiguration = parsedConfig;
        return parsedConfig;
    }
    hydrate(props) {
        // Clears the passed storage to avoid passing itself and going out of memory
        props.storage = undefined;
        if (!this.storage || !this.persist) {
            return;
        }
        this.storage.setItem(STORAGE_KEY, JSON.stringify(props));
    }
    deleteHydratedConfig() {
        if (!this.storage || !this.persist) {
            return;
        }
        this.storage.removeItem(STORAGE_KEY);
    }
    dehydratedInitialConfiguration(storage) {
        if (!storage) {
            return {};
        }
        const nativeValue = storage.getItem(STORAGE_KEY);
        if (!nativeValue) {
            return {};
        }
        try {
            return JSON.parse(nativeValue);
        }
        catch (err) {
            return {};
        }
    }
}
/**
 * Defaults for all directus sdk instances, can be modified if preferred
 * @type {IConfigurationDefaults}
 */
Configuration.defaults = {
    tokenExpirationTime: 5 * 6 * 1000,
    mode: "jwt",
};
//# sourceMappingURL=Configuration.js.map