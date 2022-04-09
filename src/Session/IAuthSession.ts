



export interface IAuthSession {
    valid: boolean;
    token?: string;
    user_guid?: string;
    persistent_token?: string;
    persistent_token_expiration?: string;
    user_salutation?: string;
    account_name?: string;
    document_guid?: string;
    document_token?: string;
    id?: number;
}