import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    Post,
    Put
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('folders/')
export class FoldersController {
    constructor(private folderService: FoldersService) {}

    @Post(':userId')
    create(@Body() folderDto: CreateFolderDto, @Param('userId') userId) {
        return this.folderService.createFolder(folderDto, userId);
    }

    @Get(':userId')
    getAll(@Param('userId') userId) {
        return this.folderService.findAll(userId);
    }

    @Put(':folderId')
    edit(@Body() folderDto: CreateFolderDto, @Param('folderId') folderId) {
        return this.folderService.updateFolder(folderDto, folderId);
    }

    @Delete(':folderId')
    delete(@Param('folderId') folderId) {
        return this.folderService.deleteFolder(folderId)
    }
}
