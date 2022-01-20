import { Controller, Get, Post } from '@nestjs/common';

@Controller('messages')
export class MessagesController {
  @Get()
  listMessages() {
    return [];
  }

  @Post()
  createMessage() {}

  @Get('/:id')
  getMessage() {
    return 'this is only one message';
  }
}
