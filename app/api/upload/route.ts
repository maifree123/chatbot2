import { NextResponse } from 'next/server';
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { Md5 } from 'ts-md5';
import { insertFile } from '@/db';
import { Pinecone } from '@pinecone-database/pinecone';
import { pc } from '@/lib/pinecone';

export async function POST(req: Request) {
  try {
    console.log('Start file upload...');
    // 1. 获取文件
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ message: 'No file uploaded' });
    }

    console.log(`Received file: ${file.name} (size: ${file.size} bytes)`);

    // 2. 加载和分割 PDF 文档
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: "application/pdf" });

    console.log('Loading PDF document...');
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from PDF`);

    // 2. 分割文档内容
    console.log('Splitting document content...');
    const splitDocs = await Promise.all(docs.map(doc => splitDoc(doc)));
    console.log('Document split into chunks');

    // 3. 获取嵌入向量并生成记录
    console.log('Generating embeddings for document chunks...');
    const records = await Promise.all(splitDocs.map(embedChunks));
    console.log(`Generated embeddings for ${records.length} chunks`);

    // 4. 将每个文件的向量数据存储在以其MD5哈希命名的独立命名空间中
    const fileHash = Md5.hashStr(file.name);
    const namespace = pc.index("chatbot").namespace(fileHash);
    console.log(`Uploading data to Pinecone with namespace: ${fileHash}`);

    for (const batch of records) {
      console.log(`Uploading batch of ${batch.length} records to Pinecone...`);
      await namespace.upsert(batch);
    }

    // 5. 保存文件信息到数据库
    console.log('Saving file information to database...');
    await insertFile(file.name, fileHash);

    console.log('File uploaded and processed successfully');
    return NextResponse.json({ message: 'File uploaded successfully' });

  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json({ message: 'File upload failed' });
  }
}

// 文档分割
const splitDoc = async (doc: Document) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512, 
    chunkOverlap: 70,
  });
  const texts = await textSplitter.splitText(doc.pageContent);
  return texts;
};

// 嵌入并生成记录
const embedChunks = async (chunks: string[]) => {
  const model = 'multilingual-e5-large';

  // 获取嵌入向量
  const embeddings = await pc.inference.embed(
    model,
    chunks,
    { inputType: 'passage', truncate: 'END' }
  );

  // 将文本、向量和元数据组合成记录
  const records = chunks.map((chunk, i) => ({
    id: Md5.hashStr(chunk), // 使用 MD5 生成唯一 ID
    values: embeddings[i].values!, // 向量值
    metadata: { text: chunk }, // 附加的元数据
  }));

  return records;
};
