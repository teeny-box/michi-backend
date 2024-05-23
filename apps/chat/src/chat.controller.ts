import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { ChatResponseDto } from './dto/chat-response.dto';
import { UsersService } from '../../auth/src/users/users.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':chatroomId')
  async findAllByChatroomId(
    @Param('chatroomId') chatroomId: string,
    @Query() pageOptionsDto?: PageOptionsDto,
  ) {
    const { results, total } = await this.chatService.find(
      chatroomId,
      pageOptionsDto,
    );

    // Unique userIds 를 추출하고 배치 조회
    const userIds = [...new Set(results.map((chat) => chat.userId))];
    const users = await this.usersService.findByUserIds(userIds);

    // userId 를 기준으로 사용자 정보를 매핑
    const userMap = new Map(users.map((user) => [user.userId, user]));

    const { data, meta } = new PageDto(
      results.map(
        (chat) => new ChatResponseDto(chat, userMap.get(chat.userId)),
      ),
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success(`조회가 완료되었습니다.`, data, meta);
  }
}
