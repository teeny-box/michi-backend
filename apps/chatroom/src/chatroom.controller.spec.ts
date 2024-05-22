import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';

describe('ChatroomController', () => {
  let chatroomController: ChatroomController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatroomController],
      providers: [ChatroomService],
    }).compile();

    chatroomController = app.get<ChatroomController>(ChatroomController);
  });
});
