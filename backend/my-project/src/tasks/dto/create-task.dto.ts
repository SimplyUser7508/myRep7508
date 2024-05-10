import { IsDate, IsString, Length } from "class-validator";

export class CreateTaskDto{
    @IsString({message: 'Должно быть строкой'})
    @Length(1, 25, {message: 'Не более 24 символов'})
    readonly task_name: string;

    @IsString({message: 'Должно быть строкой'})
    @Length(1, 255, {message: 'Не более 255 символов'})
    readonly description: string;

    // @IsDate({message: 'Некорректный формат даты'})
    readonly deadline: Date;
}