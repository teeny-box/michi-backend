import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResponseDto } from './dto/chat-response.dto';
import { UsersService } from '@/domain/auth/users/users.service';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import RequestWithUser from '@/domain/auth/interfaces/request-with-user.interface';
import { RedisCacheService } from '@/common';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';
import { ChatroomService } from '@/domain/chatroom/chatroom.service';
import { CreateChatroomDto } from '@/domain/chatroom/dto/create-chatroom.dto';
import { ChatroomResponseDto } from '@/domain/chatroom/dto/chatroom-response.dto';
import { NotEnoughUserInChatQueueException } from '@/domain/chatroom/exceptions/chatroom.exception';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly redisCacheService: RedisCacheService,
    private readonly chatroomService: ChatroomService,
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

  /**
   * 랜덤 채팅을 시작합니다
   * @description
   * - 가장 먼저 들어온 유저를 큐에서 빼고 채팅방을 생성합니다.
   * = 큐에서 나온 유저가 자신인 경우 다시 큐에 넣고 다음 유저를 가져옵니다.
   * - 온라인 상태의 대기 중인 사용자가 없을 경우 예외를 발생시킵니다.
   * @param req
   */
  @Post('random')
  @UseGuards(JwtAuthGuard)
  async startRandomChat(@Req() req: RequestWithUser) {
    const sender = req.user.userId;
    let receiver = await this.redisCacheService.getNextUserFromChatQueue();

    while (receiver === sender) {
      receiver = await this.redisCacheService.getNextUserFromChatQueue();
      await this.redisCacheService.addUserToChatQueue(sender);
    }

    if (receiver) {
      const chatroom = await this.chatroomService.create(
        new CreateChatroomDto(
          `${sender}, ${receiver}`,
          ChatRoomType.PRIVATE,
          sender,
        ),
      );

      // 다시 큐에 추가
      await this.redisCacheService.addUserToChatQueue(receiver);

      return HttpResponse.success(
        `${receiver}님과 채팅을 시작합니다.`,
        new ChatroomResponseDto(chatroom),
      );
    } else {
      throw new NotEnoughUserInChatQueueException(
        '대기중인 사용자가 없습니다.',
      );
    }
  }
}
