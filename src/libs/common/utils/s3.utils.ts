import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '@/libs/common/config/s3.config';
import { ConfigService } from '@nestjs/config';

export async function deleteFiles(
  configService: ConfigService,
  keys: string[],
): Promise<void> {
  const s3Client = createS3Client(configService);
  const bucketName = configService.get('AWS_S3_BUCKET');
  const urlInFrontOfKey = `https://${bucketName}.s3.ap-northeast-2.amazonaws.com/`;

  const deletePromises = keys.map((key) => {
    const objectKey = decodeURIComponent(key.replace(urlInFrontOfKey, ''));
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    return s3Client.send(command);
  });

  await Promise.all(deletePromises);
}
