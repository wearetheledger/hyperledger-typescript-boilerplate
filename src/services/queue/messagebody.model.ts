import { ChainMethod } from '../../routes/chainmethods.enum';


export interface MessageBody {
    payload: string;
    chainMethod: ChainMethod;
    userId: string;
}