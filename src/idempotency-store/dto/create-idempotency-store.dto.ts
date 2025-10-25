import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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
  responseBodyJson?: unknown;

  @IsOptional()
  @IsString()
  resourceId?: string;
}
