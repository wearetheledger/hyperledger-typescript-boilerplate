import { ChainMethod } from './../routes/chainmethods.enum';

export interface MessageBody {
    payload: string;
    event: ChainMethod;
    userId: string;
}