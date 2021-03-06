"use strict";
/**
 * @module API
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = exports.APIError = void 0;
var axios_1 = require("axios");
var Authentication_1 = require("./Authentication");
var ConcurrencyManager_1 = require("./ConcurrencyManager");
// Utilities
var is_1 = require("./utils/is");
var payload_1 = require("./utils/payload");
var qs_1 = require("./utils/qs");
var APIError = /** @class */ (function (_super) {
    __extends(APIError, _super);
    function APIError(message, info) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.info = info;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        return _this;
    }
    Object.defineProperty(APIError.prototype, "url", {
        get: function () {
            return this.info.url;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APIError.prototype, "method", {
        get: function () {
            return this.info.method.toUpperCase();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APIError.prototype, "code", {
        get: function () {
            return "" + (this.info.code || -1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APIError.prototype, "params", {
        get: function () {
            return this.info.params || {};
        },
        enumerable: false,
        configurable: true
    });
    APIError.prototype.toString = function () {
        return [
            "Directus call failed:",
            this.method + " " + this.url + " " + JSON.stringify(this.params) + " -",
            this.message,
            "(code " + this.code + ")",
        ].join(" ");
    };
    return APIError;
}(Error));
exports.APIError = APIError;
/**
 * API definition for HTTP transactions
 * @uses Authentication
 * @uses axios
 * @author Jan Biasi <biasijan@gmail.com>
 */
var API = /** @class */ (function () {
    function API(config) {
        this.config = config;
        var axiosOptions = {
            paramsSerializer: qs_1.querify,
            timeout: 10 * 60 * 1000,
            withCredentials: false,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        };
        if (config.mode === "cookie") {
            axiosOptions.withCredentials = true;
        }
        this.xhr = axios_1.default.create(axiosOptions);
        this.auth = new Authentication_1.Authentication(config, {
            post: this.post.bind(this),
            xhr: this.xhr,
            request: this.request.bind(this),
        });
        this.concurrent = ConcurrencyManager_1.concurrencyManager(this.xhr, 10);
    }
    /**
     * Resets the client instance by logging out and removing the URL and project
     */
    API.prototype.reset = function () {
        this.auth.logout();
        this.config.deleteHydratedConfig();
    };
    /// REQUEST METHODS ----------------------------------------------------------
    /**
     * GET convenience method. Calls the request method for you
     * @typeparam T   response type
     * @return {Promise<T>}
     */
    API.prototype.get = function (endpoint, params) {
        if (params === void 0) { params = {}; }
        return this.request("get", endpoint, params);
    };
    /**
     * POST convenience method. Calls the request method for you
     * @typeparam T   response type
     * @return {Promise<T>}
     */
    API.prototype.post = function (endpoint, body, params) {
        if (body === void 0) { body = {}; }
        if (params === void 0) { params = {}; }
        return this.request("post", endpoint, params, body);
    };
    /**
     * PATCH convenience method. Calls the request method for you
     * @typeparam T   response type
     * @return {Promise<T>}
     */
    API.prototype.patch = function (endpoint, body, params) {
        if (body === void 0) { body = {}; }
        if (params === void 0) { params = {}; }
        return this.request("patch", endpoint, params, body);
    };
    /**
     * PUT convenience method. Calls the request method for you
     * @typeparam T   response type
     * @return {Promise<T>}
     */
    API.prototype.put = function (endpoint, body, params) {
        if (body === void 0) { body = {}; }
        if (params === void 0) { params = {}; }
        return this.request("put", endpoint, params, body);
    };
    /**
     * DELETE convenience method. Calls the request method for you
     * @typeparam T   response type
     * @return {Promise<T>}
     */
    API.prototype.delete = function (endpoint) {
        return this.request("delete", endpoint);
    };
    /**
     * Gets the payload of the current token, return type can be generic
     * @typeparam T   extends object, payload type
     * @return {T}
     */
    API.prototype.getPayload = function () {
        if (!is_1.isString(this.config.token)) {
            return null;
        }
        return payload_1.getPayload(this.config.token);
    };
    /**
     * Perform an API request to the Directus API
     * @param {RequestMethod} method    Selected HTTP method
     * @param {string} endpoint         Endpoint definition as path
     * @param {object={}} params        Query parameters
     * @param {object={}} data          Data passed to directus
     * @param {boolean=false} noProject Do not include the `project` in the url (for system calls)
     * @param {object={}} headers       Optional headers to include
     * @param {boolean=false} skipParseToJSON  Whether to skip `JSON.parse` or not
     * @typeparam T                     Response type definition, defaults to `any`
     * @return {Promise<T>}
     */
    API.prototype.request = function (method, endpoint, params, data, noProject, headers, skipParseToJSON) {
        if (params === void 0) { params = {}; }
        if (noProject === void 0) { noProject = false; }
        if (headers === void 0) { headers = {}; }
        if (skipParseToJSON === void 0) { skipParseToJSON = false; }
        if (!this.config.url) {
            throw new Error("SDK has no URL configured to send requests to, please check the docs.");
        }
        if (noProject === false && !this.config.project) {
            throw new Error("SDK has no project configured to send requests to, please check the docs.");
        }
        var baseURL = "" + this.config.url;
        if (baseURL.endsWith("/") === false)
            baseURL += "/";
        if (noProject === false) {
            baseURL += this.config.project + "/";
        }
        var requestOptions = {
            baseURL: baseURL,
            data: data,
            headers: headers,
            method: method,
            params: params,
            url: endpoint,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        };
        if (this.config.token && is_1.isString(this.config.token) && this.config.token.length > 0) {
            requestOptions.headers = headers;
            requestOptions.headers.Authorization = "Bearer " + this.config.token;
        }
        if (this.config.project) {
            requestOptions.headers["X-Directus-Project"] = this.config.project;
        }
        return this.xhr
            .request(requestOptions)
            .then(function (res) { return res.data; })
            .then(function (responseData) {
            if (!responseData || responseData.length === 0) {
                return responseData;
            }
            if (typeof responseData !== "object") {
                try {
                    return skipParseToJSON ? responseData : JSON.parse(responseData);
                }
                catch (error) {
                    throw {
                        data: responseData,
                        error: error,
                        json: true,
                    };
                }
            }
            return responseData;
        })
            .catch(function (error) {
            var errorResponse = error
                ? error.response || {}
                : {};
            var errorResponseData = errorResponse.data || {};
            var baseErrorInfo = {
                error: error,
                url: requestOptions.url,
                method: requestOptions.method,
                params: requestOptions.params,
                code: errorResponseData.error ? errorResponseData.error.code || error.code || -1 : -1,
            };
            if (error && error.response && errorResponseData.error) {
                throw new APIError(errorResponseData.error.message || "Unknown error occured", baseErrorInfo);
            }
            else if (error.response && error.response.json === true) {
                throw new APIError("API returned invalid JSON", __assign(__assign({}, baseErrorInfo), { code: 422 }));
            }
            else {
                throw new APIError("Network error", __assign(__assign({}, baseErrorInfo), { code: -1 }));
            }
        });
    };
    return API;
}());
exports.API = API;
//# sourceMappingURL=API.js.map
