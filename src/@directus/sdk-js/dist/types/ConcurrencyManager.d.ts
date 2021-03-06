/**
 * @module ConcurrencyManager
 */
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
export interface IConcurrencyQueueItem {
    request: AxiosRequestConfig;
    resolver: (queuedRequest: AxiosRequestConfig) => any;
}
/**
 * Handling and limiting concurrent requests for the API.
 * @param {AxiosInstance} axios   Reference to the caller instance
 * @param {number=10} limit       How many requests to allow at once
 *
 * Based on https://github.com/bernawil/axios-concurrency/blob/master/index.js
 */
export declare const concurrencyManager: (axios: AxiosInstance, limit?: number) => {
    queue: IConcurrencyQueueItem[];
    running: IConcurrencyQueueItem[];
    interceptors: {
        request: number;
        response: number;
    };
    shiftInitial(): void;
    push(reqHandler: IConcurrencyQueueItem): void;
    shift(): void;
    requestHandler(req: AxiosRequestConfig): Promise<AxiosRequestConfig>;
    responseHandler(res: AxiosResponse): AxiosResponse;
    responseErrorHandler(res: AxiosResponse): any;
    detach(): void;
};
//# sourceMappingURL=ConcurrencyManager.d.ts.map