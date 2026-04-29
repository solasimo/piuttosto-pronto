import { useState, useRef } from 'react'
import { supabase } from './supabase'

// Compressione immagine via Canvas — target ~250KB, qualità WhatsApp
async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_W = 1200
      const MAX_H = 1200
      let { width, height } = img
      if (width > MAX_W || height > MAX_H) {
        const ratio = Math.min(MAX_W / width, MAX_H / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.72)
    }
    img.src = url
  })
}

// Upload su Supabase Storage, restituisce URL pubblico
export async function uploadImage(file, folder = 'vini') {
  const compressed = await compressImage(file)
  const ext = 'jpg'
  const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('wine-images').upload(name, compressed, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('wine-images').getPublicUrl(name)
  return data.publicUrl
}

// Componente bottone upload con preview
export default function ImageUpload({ value, onChange, label = 'Foto', folder = 'vini' }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (err) {
      console.error('Upload error:', err)
      alert('Errore nel caricamento. Riprova.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ gridColumn: '1/-1' }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7A6E65', marginBottom: 8 }}>{label}</span>

      {/* Preview immagine */}
      {value && (
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <img
            src={value}
            alt="Foto vino"
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, border: '1px solid #E2DDD6', display: 'block' }}
          />
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(28,20,16,0.7)', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>
      )}

      {/* Bottone carica */}
      {!value && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ width: '100%', padding: '14px', border: '1.5px dashed #D6D0C8', borderRadius: 12, background: uploading ? '#F4F1EC' : '#FDFBF8', color: uploading ? '#B0A89E' : '#7A6E65', fontSize: 14, fontWeight: 500, cursor: uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {uploading
            ? <><span style={{ fontSize: 18 }}>⏳</span> Caricamento...</>
            : <><span style={{ fontSize: 18 }}>📷</span> Scatta o scegli dalla libreria</>
          }
        </button>
      )}

      {/* Bottone cambia (se già c'è una foto) */}
      {value && !uploading && (
        <button
          onClick={() => inputRef.current?.click()}
          style={{ width: '100%', padding: '10px', border: '1px solid #E2DDD6', borderRadius: 10, background: '#fff', color: '#7A6E65', fontSize: 13, fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
          📷 Cambia foto
        </button>
      )}

      {/* Input file nascosto — accept include camera su mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  )
}
