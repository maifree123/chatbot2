import { pc } from '@/lib/pinecone'



const indexList = await pc.listIndexes();

console.log(indexList);