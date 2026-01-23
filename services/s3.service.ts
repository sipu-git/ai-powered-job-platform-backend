import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createS3, streamToBuffer } from "../configs/s3.config";

const BUCKET = process.env.AWS_BUCKET_NAME!;

export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  const key = `documents/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType
  });

  await createS3.send(command);

  return key; 
}
export async function downloadFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  });

  const response = await createS3.send(command);

  if (!response.Body) {
    throw new Error("S3 file body is empty");
  }

  return streamToBuffer(response.Body as any);
}
