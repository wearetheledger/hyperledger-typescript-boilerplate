import { ChainMethod } from './../../services/routes/chainmethods.enum';

export interface MessageBody {
    payload: string;
    event: ChainMethod;
    userId: string;
}