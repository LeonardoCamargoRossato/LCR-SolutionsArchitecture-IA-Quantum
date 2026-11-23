/**
 * Minimal ZIP STORE writer for reviewed text sources and user-provided files.
 * No execution, decompression or third-party ZIP dependency.
 */
type ZipItem = { name: string; content: string | Blob | Uint8Array }
const enc = new TextEncoder()
const table = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let x=i
  for(let j=0;j<8;j++)x=x&1?0xedb88320^(x>>>1):x>>>1
  table[i]=x>>>0
}
function crc32(bytes:Uint8Array):number {
  let crc=0xffffffff
  for(let i=0;i<bytes.length;i++) crc=table[(crc^bytes[i])&255]^(crc>>>8)
  return (crc^0xffffffff)>>>0
}
const u16=(dv:DataView,off:number,v:number)=>dv.setUint16(off,v,true)
const u32=(dv:DataView,off:number,v:number)=>dv.setUint32(off,v,true)
async function toBytes(item:ZipItem['content']) {
  if(typeof item==='string')return enc.encode(item)
  if(item instanceof Blob)return new Uint8Array(await item.arrayBuffer())
  return item
}
export async function makeZip(items: ZipItem[]): Promise<Blob> {
  const locals:Uint8Array[]=[]
  const centrals:Uint8Array[]=[]
  let offset=0
  for(const item of items) {
    const name=item.name.replaceAll('\\','/')
    if(!name||name.startsWith('/')||name.includes('..')||!/^[-\w./]+$/.test(name))throw Error('Nome de arquivo ZIP inseguro.')
    const filename=enc.encode(name)
    const body=await toBytes(item.content)
    if(body.length>25_000_000)throw Error('Arquivo excede o limite seguro de exportação.')
    const crc=crc32(body)
    const local=new Uint8Array(30+filename.length+body.length)
    const ld=new DataView(local.buffer)
    u32(ld,0,0x04034b50);u16(ld,4,20);u16(ld,6,0x0800);u16(ld,8,0)
    u32(ld,14,crc);u32(ld,18,body.length);u32(ld,22,body.length)
    u16(ld,26,filename.length);local.set(filename,30);local.set(body,30+filename.length)
    const central=new Uint8Array(46+filename.length)
    const cd=new DataView(central.buffer)
    u32(cd,0,0x02014b50);u16(cd,4,20);u16(cd,6,20);u16(cd,8,0x0800)
    u16(cd,10,0);u32(cd,16,crc);u32(cd,20,body.length);u32(cd,24,body.length)
    u16(cd,28,filename.length);u32(cd,42,offset);central.set(filename,46)
    locals.push(local);centrals.push(central);offset+=local.length
  }
  const centralSize=centrals.reduce((a,v)=>a+v.length,0)
  const footer=new Uint8Array(22)
  const fd=new DataView(footer.buffer)
  u32(fd,0,0x06054b50);u16(fd,8,items.length);u16(fd,10,items.length)
  u32(fd,12,centralSize);u32(fd,16,offset)
  return new Blob([...locals,...centrals,footer],{type:'application/zip'})
}
export function download(blob:Blob,name:string) {
  const url=URL.createObjectURL(blob)
  const anchor=document.createElement('a')
  anchor.href=url;anchor.download=name
  anchor.style.display='none';document.body.append(anchor);anchor.click();anchor.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1500)
}
