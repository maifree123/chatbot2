import { getFiles } from "@/db";
import { NextResponse } from "next/server";

export async function  POST(req:Request){
    const files = await getFiles()
    return NextResponse.json(files)
}