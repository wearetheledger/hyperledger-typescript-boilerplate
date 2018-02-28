import { ApiModelProperty } from '@nestjs/swagger';

export class Auth0UserModel {
    @ApiModelProperty()
    readonly username: string;
    @ApiModelProperty()
    readonly email: string;

    @ApiModelProperty()
    // tslint:disable-next-line:variable-name
    readonly user_metadata: object;
}