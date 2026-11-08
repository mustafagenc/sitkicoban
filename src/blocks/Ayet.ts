import type { Block } from 'payload'

// Alanlar `localized` işaretlenmez: blok, zaten dile göre ayrı tutulan `govde` içinde yaşar.
export const Ayet: Block = {
  slug: 'ayet',
  labels: { singular: 'Âyet', plural: 'Âyetler' },
  fields: [
    { name: 'arapca', label: 'Arapça metin', type: 'textarea', required: true },
    { name: 'meal', label: 'Meal', type: 'textarea', required: true },
    { name: 'kaynak', label: 'Kaynak', type: 'text', admin: { description: 'Örn. İhlâs Sûresi · 1' } },
  ],
}
