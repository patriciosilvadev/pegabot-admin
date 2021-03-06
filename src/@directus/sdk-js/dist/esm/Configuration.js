/**
 * @module Configuration
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var STORAGE_KEY = "directus-sdk-js";
/**
 * Configuration holder for directus implementations
 * @author Jan Biasi <biasijan@gmail.com>
 */
var Configuration = /** @class */ (function () {
    /**
     * Creates a new configuration instance, will be used once for each directus instance (passing refs).
     * @constructor
     * @param {IConfigurationOptions} initialConfig   Initial configuration values
     * @param {IStorageAPI?} storage                  Storage adapter for persistence
     */
    function Configuration(initialConfig, storage) {
        if (initialConfig === void 0) { initialConfig = {}; }
        this.storage = storage;
        var dehydratedConfig = {};
        if (storage && Boolean(initialConfig && initialConfig.persist)) {
            // dehydrate if storage was provided and persist flag is set
            dehydratedConfig = this.dehydratedInitialConfiguration(storage);
        }
        var persist = Boolean(dehydratedConfig.persist || initialConfig.persist);
        var project = dehydratedConfig.project || initialConfig.project;
        var mode = dehydratedConfig.mode || initialConfig.mode || Configuration.defaults.mode;
        var tokenExpirationTime = dehydratedConfig.tokenExpirationTime ||
            initialConfig.tokenExpirationTime ||
            Configuration.defaults.tokenExpirationTime;
        this.internalConfiguration = __assign(__assign(__assign({}, initialConfig), dehydratedConfig), { persist: persist,
            mode: mode,
            project: project,
            tokenExpirationTime: tokenExpirationTime });
    }
    Object.defineProperty(Configuration.prototype, "token", {
        // ACCESSORS =================================================================
        get: function () {
            return this.internalConfiguration.token;
        },
        set: function (token) {
            this.partialUpdate({ token: token });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "tokenExpirationTime", {
        get: function () {
            return this.internalConfiguration.tokenExpirationTime;
        },
        set: function (tokenExpirationTime) {
            if (typeof tokenExpirationTime === "undefined")
                return;
            // TODO: Optionally re-compute the localExp property for the auto-refresh
            this.partialUpdate({
                tokenExpirationTime: tokenExpirationTime * 60000,
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "url", {
        get: function () {
            return this.internalConfiguration.url;
        },
        set: function (url) {
            this.partialUpdate({ url: url });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "project", {
        get: function () {
            return this.internalConfiguration.project;
        },
        set: function (project) {
            this.partialUpdate({
                project: project,
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "localExp", {
        get: function () {
            return this.internalConfiguration.localExp;
        },
        set: function (localExp) {
            this.partialUpdate({ localExp: localExp });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "persist", {
        get: function () {
            return this.internalConfiguration.persist;
        },
        set: function (persist) {
            this.internalConfiguration.persist = persist;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "mode", {
        get: function () {
            return this.internalConfiguration.mode;
        },
        set: function (mode) {
            this.internalConfiguration.mode = mode;
        },
        enumerable: false,
        configurable: true
    });
    // HELPER METHODS ============================================================
    /**
     * Update the configuration values, will also hydrate them if persistance activated
     * @param {IConfigurationValues} config
     */
    Configuration.prototype.update = function (config) {
        this.internalConfiguration = config;
        this.hydrate(config);
    };
    /**
     * Update partials of the configuration, behaves like the [update] method
     * @param {Partial<IConfigurationValues>} config
     */
    Configuration.prototype.partialUpdate = function (config) {
        this.internalConfiguration = __assign(__assign({}, this.internalConfiguration), config);
        this.hydrate(this.internalConfiguration);
    };
    /**
     * Reset the whole confiugration and remove hydrated values from storage as well
     */
    Configuration.prototype.reset = function () {
        delete this.internalConfiguration.token;
        delete this.internalConfiguration.url;
        delete this.internalConfiguration.project;
        delete this.internalConfiguration.localExp;
        this.deleteHydratedConfig();
    };
    // STORAGE METHODS ===========================================================
    Configuration.prototype.dehydrate = function () {
        if (!this.storage || !this.persist) {
            return;
        }
        var nativeValue = this.storage.getItem(STORAGE_KEY);
        if (!nativeValue) {
            return;
        }
        var parsedConfig = JSON.parse(nativeValue);
        this.internalConfiguration = parsedConfig;
        return parsedConfig;
    };
    Configuration.prototype.hydrate = function (props) {
        // Clears the passed storage to avoid passing itself and going out of memory
        props.storage = undefined;
        if (!this.storage || !this.persist) {
            return;
        }
        this.storage.setItem(STORAGE_KEY, JSON.stringify(props));
    };
    Configuration.prototype.deleteHydratedConfig = function () {
        if (!this.storage || !this.persist) {
            return;
        }
        this.storage.removeItem(STORAGE_KEY);
    };
    Configuration.prototype.dehydratedInitialConfiguration = function (storage) {
        if (!storage) {
            return {};
        }
        var nativeValue = storage.getItem(STORAGE_KEY);
        if (!nativeValue) {
            return {};
        }
        try {
            return JSON.parse(nativeValue);
        }
        catch (err) {
            return {};
        }
    };
    /**
     * Defaults for all directus sdk instances, can be modified if preferred
     * @type {IConfigurationDefaults}
     */
    Configuration.defaults = {
        tokenExpirationTime: 5 * 6 * 1000,
        mode: "jwt",
    };
    return Configuration;
}());
export { Configuration };
//# sourceMappingURL=Configuration.js.map