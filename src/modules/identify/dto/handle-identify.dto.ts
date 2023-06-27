import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class HandleIdentifyDto {
  @ApiPropertyOptional({ description: 'email', example: 'test@test.test' })
  @IsOptional()
  @IsEmail()
  @IsString()
  email: string;

  @ApiPropertyOptional({
    description: 'phone number',
    example: '+91 1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  @IsString()
  phoneNumber: string;
}
