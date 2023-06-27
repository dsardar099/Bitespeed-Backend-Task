import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IdentifyService } from './identify.service';
import { HandleIdentifyDto } from './dto/handle-identify.dto';

@Controller('identify')
@ApiTags('Identify')
export class IdentifyController {
  constructor(private identifyService: IdentifyService) {}

  @Post()
  handleIdentify(@Body() body: HandleIdentifyDto) {
    return this.identifyService.handleIdentify(body);
  }
}
