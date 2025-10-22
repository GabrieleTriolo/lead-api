import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateIdempotencyStoreDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  idempotencyKey!: string;

  @IsNotEmpty()
  @IsDate()
  expiresAt!: Date;

  @IsOptional()
  @IsInt()
  responseStatusCode?: number;

  @IsOptional()
  responseBodyJson?: unknown;

  @IsOptional()
  @IsString()
  resourceId?: string;
}
