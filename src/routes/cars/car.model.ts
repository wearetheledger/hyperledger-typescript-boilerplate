import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CarDto {
    @IsString()
    @ApiModelProperty()
    readonly Key: string;
    @IsString()
    @ApiModelProperty()
    readonly Make: string;
    @IsString()
    @ApiModelProperty()
    readonly Model: string;
    @IsString()
    @ApiModelProperty()
    readonly Colour: string;
    @IsString()
    @ApiModelProperty()
    readonly Owner: string;
}