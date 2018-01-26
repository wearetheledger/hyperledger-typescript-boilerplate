import { ChainMethod } from '../../routes/chainmethods.enum';

export interface MessageBody {
    payload: any;
    chainMethod: ChainMethod;
    userId: string;
}