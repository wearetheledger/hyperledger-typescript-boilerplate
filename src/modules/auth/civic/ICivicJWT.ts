import { IJWT } from '../interfaces/IJWT';
import { CivicUserProperty } from './civicUser.model';

export interface ICivicJWT extends IJWT{
    'contact.personal.email': CivicUserProperty;
    'contact.personal.phoneNumber': CivicUserProperty;
}