import { User } from 'fabric-client';

export interface IAuthService {
    getUserId(bearerToken: string): string;

    getUserFromStore(userId: string): Promise<User>;

    createUserCreds(userId: string): Promise<any>;
}
