import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { ChatroomResponseDto } from '@/domain/chatroom/dto/chatroom-response.dto';
import { CreateChatroomDto } from '@/domain/chatroom/dto/create-chatroom.dto';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import RequestWithUser from '@/common/interfaces/request-with-user.interface';
import { CreateChatroomResponseDto } from '@/domain/chatroom/dto/create-chatroom-response.dto';

@Controller('chatroom')
@UseGuards(JwtAuthGuard)
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Get('')
  async find(
    @Req() req: RequestWithUser,
    @Query() pageOptionsDto?: PageOptionsDto,
  ) {
    const { results, total } = await this.chatroomService.findWithDetails(
      req.user.userId,
      pageOptionsDto,
    );
    const { data, meta } = new PageDto(
      results.map(
        (chatroom) => new ChatroomResponseDto(chatroom, req.user.userId),
      ),
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success('채팅방 조회가 완료되었습니다.', data, meta);
  }

  /**
   * 채팅방 생성
   * @param createChatRoomDto
   */
  @Post('')
  async create(@Body() createChatRoomDto: CreateChatroomDto) {
    const result = await this.chatroomService.create(createChatRoomDto);
    return HttpResponse.success(
      '채팅방이 생성되었습니다.',
      new CreateChatroomResponseDto(result),
    );
  }

  @Delete(':id')
  async softDeleteChatRoom(@Param('id') id: string) {
    await this.chatroomService.softDeleteChatRoom(id);
    return HttpResponse.success('채팅방이 삭제되었습니다.');
  }
}
