import type { Block } from 'payload'

export const OneCikanSoz: Block = {
  slug: 'oneCikanSoz',
  labels: { singular: 'Öne çıkan söz', plural: 'Öne çıkan sözler' },
  fields: [{ name: 'metin', label: 'Metin', type: 'textarea', required: true }],
}
