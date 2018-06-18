import { ChainMethod } from '../../../../chainmethods.enum';

export interface MessageBody {
    payload: any;
    chainMethod: ChainMethod;
    userId: string;
}