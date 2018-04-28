import { ApiModelProperty } from '@nestjs/swagger';

export class Auth0UserModel {
    @ApiModelProperty()
    // tslint:disable-next-line:variable-name
    readonly user_id: string;
    @ApiModelProperty()
    readonly nickname: string;
    @ApiModelProperty()
    readonly email: string;
    @ApiModelProperty()
    readonly name: string;
    @ApiModelProperty()
    readonly picture: string;
    @ApiModelProperty()
    // tslint:disable-next-line:variable-name
    readonly created_at: string;
    @ApiModelProperty()
    // tslint:disable-next-line:variable-name
    readonly user_metadata: object;
    @ApiModelProperty()
    // tslint:disable-next-line:variable-name
    readonly app_metadata: object;
}
