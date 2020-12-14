import { IRole } from "./Role";
declare type UserStatus = "active" | "inactive";
/**
 * @see https://docs.directus.io/api/reference.html#user-object
 */
export interface IUser {
    avatar?: number;
    company?: string;
    email: string;
    email_notifications: boolean;
    external_id: string;
    first_name: string;
    high_contrast_mode?: boolean;
    id: number;
    last_access_on: string;
    last_name: string;
    last_page?: string;
    locale?: string;
    locale_options?: string;
    role: IRole;
    status: UserStatus;
    timezone?: string;
    title?: string;
    token: string;
}
export {};
//# sourceMappingURL=User.d.ts.map