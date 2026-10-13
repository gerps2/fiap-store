import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @MinLength(3)
  sku!: string;

  @Field()
  @IsString()
  @MinLength(3)
  name!: string;

  @Field()
  @IsString()
  description!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  priceCents!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field()
  @IsString()
  categorySlug!: string;
}
