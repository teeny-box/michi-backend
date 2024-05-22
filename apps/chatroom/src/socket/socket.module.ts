import {forwardRef, Module} from "@nestjs/common";
import {SocketGateway} from "./socket.gateway";
import {ChatroomModule} from "../chatroom.module";
import {ChatModule} from "../../../chat/src/chat.module";

@Module({
  imports: [forwardRef(() => ChatroomModule), forwardRef(() => ChatModule)],
  providers: [SocketGateway]
})
export class SocketModule {}