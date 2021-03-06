"use strict";
/**
 * @module Authentication
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
// Utilities
var is_1 = require("./utils/is");
var payload_1 = require("./utils/payload");
/**
 * Handles all authentication related logic, decoupled from the core
 * @internal
 * @author Jan Biasi <biasijan@gmail.com>
 */
var Authentication = /** @class */ (function () {
    /**
     * Creates a new authentication instance
     * @constructor
     * @param {IConfiguration} config
     * @param {IAuthenticationInjectableProps} inject
     */
    function Authentication(config, inject) {
        this.config = config;
        this.inject = inject;
        // Only start the auto refresh interval if the token exists and it's a JWT
        if (config.token && config.token.includes(".")) {
            this.startInterval(true);
        }
    }
    /**
     * Login to the API; Gets a new token from the API and stores it in this.token.
     * @param {ILoginCredentials} credentials   User login credentials
     * @param {ILoginOptions?} options          Additional options regarding persistance and co.
     * @return {Promise<IAuthenticateResponse>}
     */
    Authentication.prototype.login = function (credentials, options) {
        var _this = this;
        this.config.token = undefined;
        if (credentials.url && is_1.isString(credentials.url)) {
            this.config.url = credentials.url;
        }
        if (credentials.project && is_1.isString(credentials.project)) {
            this.config.project = credentials.project;
        }
        if (options && is_1.isString(options.mode)) {
            this.config.mode = options.mode;
        }
        if (credentials.persist || (options && options.persist) || this.config.persist) {
            // use interval for login refresh when option persist enabled
            this.startInterval();
        }
        var body = {
            email: credentials.email,
            password: credentials.password,
            mode: "jwt",
        };
        if (this.config.mode === "cookie") {
            body.mode = "cookie";
        }
        if (credentials.otp) {
            body.otp = credentials.otp;
        }
        var activeRequest = this.inject.post("/auth/authenticate", body);
        if (this.config.mode === "jwt") {
            activeRequest
                .then(function (res) {
                // save new token in configuration
                _this.config.token = res.data.token;
                return res;
            })
                .then(function (res) {
                _this.config.token = res.data.token;
                _this.config.localExp = new Date(Date.now() + (_this.config.tokenExpirationTime || 0)).getTime();
                return res;
            });
        }
        return activeRequest;
    };
    /**
     * Logs the user out by "forgetting" the token, and clearing the refresh interval
     */
    Authentication.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.inject.request("post", "/auth/logout", {}, {}, false)];
                    case 1:
                        response = _a.sent();
                        this.config.token = undefined;
                        if (this.refreshInterval) {
                            this.stopInterval();
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /// REFRESH METHODS ----------------------------------------------------------
    /**
     * Refresh the token if it is about to expire (within 30 seconds of expiry date).
     * - Calls onAutoRefreshSuccess with the new token if the refreshing is successful.
     * - Calls onAutoRefreshError if refreshing the token fails for some reason.
     * @return {RefreshIfNeededResponse}
     */
    Authentication.prototype.refreshIfNeeded = function () {
        var _this = this;
        var payload = this.getPayload();
        var _a = this.config, token = _a.token, localExp = _a.localExp;
        if (!is_1.isString(token)) {
            return;
        }
        if (!payload || !payload.exp) {
            return;
        }
        var timeDiff = (localExp || 0) - Date.now();
        if (timeDiff <= 0) {
            // token has expired, skipping auto refresh
            if (is_1.isFunction(this.onAutoRefreshError)) {
                // @ts-ignore
                this.onAutoRefreshError({
                    code: 102,
                    message: "auth_expired_token",
                });
            }
            return;
        }
        if (timeDiff < 30000) {
            return new Promise(function (resolve) {
                if (token) {
                    _this.refresh(token)
                        .then(function (res) {
                        _this.config.localExp = new Date(Date.now() + (_this.config.tokenExpirationTime || 0)).getTime();
                        _this.config.token = res.data.token || token;
                        // if autorefresh succeeded
                        if (is_1.isFunction(_this.onAutoRefreshSuccess)) {
                            // @ts-ignore
                            _this.onAutoRefreshSuccess(_this.config);
                        }
                        resolve([true]);
                    })
                        .catch(function (error) {
                        if (is_1.isFunction(_this.onAutoRefreshError)) {
                            // @ts-ignore
                            _this.onAutoRefreshError(error);
                        }
                        resolve([true, error]);
                    });
                }
            });
        }
        else {
            Promise.resolve([false]);
        }
    };
    /**
     * Use the passed token to request a new one.
     * @param {string} token
     */
    Authentication.prototype.refresh = function (token) {
        return this.inject.post("/auth/refresh", { token: token });
    };
    /**
     * Starts an interval of 10 seconds that will check if the token needs refreshing
     * @param {boolean?} fireImmediately    If it should immediately call [refreshIfNeeded]
     */
    Authentication.prototype.startInterval = function (fireImmediately) {
        if (fireImmediately) {
            this.refreshIfNeeded();
        }
        this.refreshInterval = setInterval(this.refreshIfNeeded.bind(this), 10000);
    };
    /**
     * Clears and nullifies the token refreshing interval
     */
    Authentication.prototype.stopInterval = function () {
        clearInterval(this.refreshInterval);
        this.refreshInterval = undefined;
    };
    /**
     * Gets the payload of the current token, return type can be generic
     * @typeparam T     The payload response type, arbitrary object
     * @return {T}
     */
    Authentication.prototype.getPayload = function () {
        if (!is_1.isString(this.config.token)) {
            return null;
        }
        return payload_1.getPayload(this.config.token);
    };
    return Authentication;
}());
exports.Authentication = Authentication;
//# sourceMappingURL=Authentication.js.map