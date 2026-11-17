import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { ImageUploader } from '../src/components/admin/ImageUploader'

function Harness() {
  const [saved, setSaved] = useState('')
  return (
    <div>
      <ImageUploader
        pngOnly
        label="Cover Image"
        onSave={async (file) => {
          setSaved(file.name + '|' + file.type)
        }}
      />
      <output id="saved" data-testid="saved">{saved}</output>
    </div>
  )
}
createRoot(document.getElementById('root')!).render(<Harness />)
