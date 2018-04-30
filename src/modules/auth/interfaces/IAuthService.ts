import { IJWT } from './IJWT';

export interface IAuthService {
    getUserId(tokenObject: object): string;

    getUserFromStore(userId: string): Promise<User>;

    createUserCreds(tokenObject: IJWT): Promise<User>;
}
