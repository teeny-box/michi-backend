import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PageOptionsDto } from '@/libs/common/dto/page/page-options.dto';
import { PageDto } from '@/libs/common/dto/page/page.dto';
import { PageMetaDto } from '@/libs/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/libs/common/dto/http-response';
import { ChatResponseDto } from './dto/chat-response.dto';
import { UsersService } from '@/domain/auth/users/users.service';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import RequestWithUser from '@/domain/auth/interfaces/request-with-user.interface';
import { RedisCacheService } from '@/libs/common';
import { StatusGateway } from '@/domain/chat/socket/status.gateway';
import { NotEnoughUserInChatQueueException } from '@/domain/chat/exceptions/chatroom.exception';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly redisCacheService: RedisCacheService,
    private readonly statusGateway: StatusGateway,
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

  @Get('random')
  @UseGuards(JwtAuthGuard)
  async requestRandomChat(@Req() req: RequestWithUser) {
    const sender = req.user.userId;
    const receiver = await this.redisCacheService.getNextUserFromChatQueue();
    if (receiver) {
      this.statusGateway.sendChatRequest(sender, receiver);
      return HttpResponse.success(
        `${receiver}님에게 랜덤 채팅 요청을 전송하였습니다.`,
      );
    } else {
      throw new NotEnoughUserInChatQueueException(
        '대기중인 사용자가 없습니다.',
      );
    }
  }
}
