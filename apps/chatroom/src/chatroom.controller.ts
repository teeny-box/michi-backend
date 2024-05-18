import {Body, Controller, Get, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {ChatroomService} from './chatroom.service';
import {CreateChatroomDto} from "./dto/create-chatroom.dto";
import {JwtAuthGuard} from "../../auth/src/guards/jwt-auth.guard";
import RequestWithUser from "../../auth/src/interfaces/request-with-user.interface";
import {HttpResponse} from "../../auth/src/@types/http-response";
import {PageOptionsDto} from "@/common/dto/page/page-options.dto";
import {PageDto} from "@/common/dto/page/page.dto";
import {ChatroomResponseDto} from "./dto/chatroom-response.dto";
import {PageMetaDto} from "@/common/dto/page/page-meta.dto";

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Get('')
  async getChatRooms(@Query() pageOptionsDto?: PageOptionsDto) {
    console.log(pageOptionsDto);
    const { results, total } = await this.chatroomService.getChatRooms(pageOptionsDto);
    const { data, meta } = new PageDto(
        results.map(chatroom => new ChatroomResponseDto(chatroom)),
        new PageMetaDto(pageOptionsDto, total)
    );

    return HttpResponse.success('채팅방 조회가 완료되었습니다.', data, meta);
  }

  /**
   * 채팅방 생성
   * @param req
   * @param createChatRoomDto
   */
  @UseGuards(JwtAuthGuard)
  @Post(':userId')
  async createChatRoom(@Req() req: RequestWithUser, @Body() createChatRoomDto: CreateChatroomDto) {
    console.log(req.user)
    const result = await this.chatroomService.createChatRoom(req.user, createChatRoomDto);
    return HttpResponse.success('채팅방이 생성되었습니다.', new ChatroomResponseDto(result));
  }
}
