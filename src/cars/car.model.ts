import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CarDto {
    @IsString()
    @ApiModelProperty()
    readonly key: string;
    @IsString()
    @ApiModelProperty()
    readonly make: string;
    @IsString()
    @ApiModelProperty()
    readonly model: string;
    @IsString()
    @ApiModelProperty()
    readonly color: string;
    @IsString()
    @ApiModelProperty()
    readonly owner: string;
}
