import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // 解析PDF内容
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: "application/pdf" });
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();
    
    // 内容处理
    const content = docs
      .map(doc => doc.pageContent)
      .join('\n')
      .replace(/\s{2,}/g, ' ')    // 清理多余空格
      .slice(0, 3000);           // 限制长度

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: '文件处理失败' },
      { status: 500 }
    );
  }
}