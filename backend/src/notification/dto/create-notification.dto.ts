import { NotificationType } from "../../schemas/notification.schema";
import { IsNotEmpty, IsEnum, IsOptional, IsMongoId } from "class-validator";

export class CreateNotificationDto {

    
    @IsNotEmpty()
    from: string;

    

    @IsNotEmpty()
    body: string;

    

    @IsOptional()
    @IsMongoId()
    borrowId?: string;

    
}
