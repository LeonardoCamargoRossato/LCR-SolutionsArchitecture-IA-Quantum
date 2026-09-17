export type MediaCategory = 'Projects' | 'About' | 'Icons' | 'Documents' | 'Other'
export type MediaAsset = { id:string; url:string; path:string; name:string; mimeType:string; category:MediaCategory; altText?:string; imageType?:'real-screenshot'|'illustrative-placeholder'; createdAt?:string }
