import { ApiModelProperty } from '@nestjs/swagger';

export class AssetDto {
    @ApiModelProperty()
    readonly name: string;
    @ApiModelProperty()
    readonly description: string;
}