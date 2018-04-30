import { ApiModelProperty } from '@nestjs/swagger';

export class CivicUserModel {
    @ApiModelProperty()
    readonly userId: string;
    @ApiModelProperty()
    readonly data: CivicUserProperty[];
}

export interface CivicUserProperty {
    readonly label: string;
    readonly value: string;
    readonly isValid: boolean;
    readonly isOwner: boolean;
}
