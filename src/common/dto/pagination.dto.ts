import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  public limit?: number = 10;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  public page?: number = 1;
}
