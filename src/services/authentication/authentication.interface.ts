
export interface IAuthService {
    getUserId(bearerToken : string): string;
    getUserFromStore(userId: string): Promise<User | void>;
    createUserCreds(userId: string): Promise<any>;
}
