// app/api/delete-file/route.ts
import { NextResponse } from 'next/server';
import { deleteFileById, getFileKeyById } from '@/db/index';
import { Pinecone } from '@pinecone-database/pinecone';

export async function DELETE(req: Request) {
  try {
    // 解析请求参数
    const { fileId } = await req.json();

    // 参数验证
    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId parameter' },
        { status: 400 }
      );
    }

    const numericFileId = Number(fileId);
    if (isNaN(numericFileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID format' },
        { status: 400 }
      );
    }

    // 获取文件对应的 namespace（file_key）
    const fileKey = await getFileKeyById(numericFileId);
    if (!fileKey) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 初始化 Pinecone 客户端
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

    // 获取索引（根据你的实际情况替换索引名称）
    const index = pc.Index('chatbot');

    // 删除 Pinecone 中的 namespace
    try {
      console.log('要删除的namespace', fileKey);
      await index.namespace(fileKey).deleteAll();
      console.log(`Successfully deleted Pinecone namespace: ${fileKey}`);
    } catch (pineconeError) {
      console.error('Pinecone deletion failed:', pineconeError);
      // 根据需求决定是否继续删除数据库记录
      // 如果要保证原子性，可以在这里 return 错误
    }

    // 删除数据库记录
    await deleteFileById(numericFileId);

    return NextResponse.json(
      { success: true, message: 'File and namespace deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}