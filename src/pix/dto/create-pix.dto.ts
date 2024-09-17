import { IsEmail, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreatePixDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsEmail()
    @IsNotEmpty()
    recipientEmail: string;
}
