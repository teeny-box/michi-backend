import {IsNotEmpty, IsString} from "class-validator";

export class RegisterFcmTokenDto {
    @IsString()
    @IsNotEmpty()
    readonly token: string;
}