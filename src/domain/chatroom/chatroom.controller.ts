import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { ChatroomResponseDto } from '@/domain/chatroom/dto/chatroom-response.dto';
import { CreateChatroomDto } from '@/domain/chatroom/dto/create-chatroom.dto';

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Get('')
  async find(
    @Query('userId') userId?: string,
    @Query() pageOptionsDto?: PageOptionsDto,
  ) {
    const { results, total } = await this.chatroomService.find(
      userId,
      pageOptionsDto,
    );
    const { data, meta } = new PageDto(
      results.map((chatroom) => new ChatroomResponseDto(chatroom)),
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success('채팅방 조회가 완료되었습니다.', data, meta);
  }

  /**
   * 채팅방 생성
   * @param createChatRoomDto
   */
  // @UseGuards(JwtAuthGuard)
  @Post('')
  async create(@Body() createChatRoomDto: CreateChatroomDto) {
    const result = await this.chatroomService.create(createChatRoomDto);
    return HttpResponse.success(
      '채팅방이 생성되었습니다.',
      new ChatroomResponseDto(result),
    );
  }
}
