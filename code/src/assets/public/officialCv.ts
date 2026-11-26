import { publicAssetCatalog } from './publicAssetCatalog'

// Versioned approved PDF; no runtime metadata lookup.
const asset = publicAssetCatalog['cv/1792380202950-206c2842-6852-4d61-90c1-b24ce1ab5bd2-LeonardoRossato_CV_2026-pdf.pdf']
export const officialCvUrl = import.meta.env.BASE_URL.replace(/\/?$/, '/') + asset.original
