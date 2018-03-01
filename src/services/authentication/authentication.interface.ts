
export interface IAuthService {
    getCredsUserId(auth): string;
    getAuthUserId(auth): string;
    getUserFromStore(userId: string): Promise<any>;
    createUserCreds(userId: string): Promise<any>;
}
