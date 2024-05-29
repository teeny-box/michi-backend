import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createS3Client } from '@/common/config/s3.config';
import { v4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpResponse } from '@/common/dto/http-response';
import { PresignedUrlDto } from './dto/presigned-url.dto';
import { DeleteFilesDto } from './dto/delete-files.dto';
import { deleteFiles } from '@/common/utils/s3.utils';

@Controller('images')
export class ImagesController {
  constructor(private readonly configService: ConfigService) {}

  @Post('/')
  async presignedUrl(@Body() presignedUrlDto: PresignedUrlDto) {
    const bucketName = this.configService.get('AWS_S3_BUCKET');
    const { filename } = presignedUrlDto;

    const uuid = v4().replace(/-/g, '_');
    const key = `${uuid}_${filename}`;
    const encodedKey = encodeURIComponent(key);

    const s3Client = createS3Client(this.configService);

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      ACL: 'public-read',
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
    const publicUrl = `https://${bucketName}.s3.ap-northeast-2.amazonaws.com/${encodedKey}`;

    return HttpResponse.created('요청 성공', { signedUrl, publicUrl });
  }

  @Delete('/')
  async deleteFiles(@Body() deleteFilesDto: DeleteFilesDto) {
    await deleteFiles(this.configService, deleteFilesDto.keys);
    return HttpResponse.success('파일이 삭제되었습니다.');
  }
}
