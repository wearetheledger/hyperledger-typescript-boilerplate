
export interface IAuthService {
    getUserId(auth): string;
    getUserFromStore(userId: string): Promise<any>;
    createUserCreds(userId: string): Promise<any>;
}
