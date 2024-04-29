import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './folders.entity';
import { Repository } from 'typeorm';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FoldersService {
    constructor(
        @InjectRepository(Folder) private foldersRepository: Repository<Folder>,
        private usersService: UsersService,
    ) {}

    async createFolder(dto: CreateFolderDto, userId: number): Promise<Folder> {
        const folderData = { ...dto, userId };
        if (!dto.folder_name) {
            throw new HttpException('Название папки обязательно для заполнения', HttpStatus.BAD_REQUEST);
        }
        const folder = await this.foldersRepository.save(folderData);
        return folder;
    }

    async findAll(userId: number): Promise<Folder[]> {
        return await this.foldersRepository.find({ where: { userId } });
    }

    async updateFolder(dto: CreateFolderDto, folderId: number): Promise<string> {
        await this.foldersRepository.update(folderId, dto);
        return 'Папка успешно отредактирована';
    }

    async deleteFolder(folderId: number): Promise<string> {
        await this.foldersRepository.delete(folderId);
        return 'Папка успешно удалена';
    }
}
