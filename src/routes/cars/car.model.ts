import { ApiModelProperty } from '@nestjs/swagger';

export class CarDto {
    @ApiModelProperty()
    readonly Key: string;
    @ApiModelProperty()
    readonly Make: string;
    @ApiModelProperty()
    readonly Model: string;
    @ApiModelProperty()
    readonly Colour: string;
    @ApiModelProperty()
    readonly Owner: string;
}