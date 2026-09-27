import type { Deliverable } from '../data/mock'

function toDownload(d: Deliverable): { text: string; name: string; mime: string } {
  const p = d.preview
  switch (p.type) {
    case 'sheet': {
      const csv = [p.columns, ...p.rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      return { text: csv, name: d.name.replace(/\.xlsx$/, '.csv'), mime: 'text/csv' }
    }
    case 'code':
      return { text: p.code, name: d.name, mime: 'text/x-python' }
    case 'doc':
      return {
        text: `# ${p.title}\n\n_${p.meta}_\n\n` + p.sections.map((s) => `## ${s.h}\n\n${s.p.join('\n\n')}`).join('\n\n'),
        name: d.name.replace(/\.(docx|pdf)$/, '.md'),
        mime: 'text/markdown',
      }
    case 'slides':
      return {
        text: p.slides.map((s, i) => `## Slide ${i + 1}: ${s.title}\n` + s.bullets.map((b) => `- ${b}`).join('\n')).join('\n\n'),
        name: d.name.replace(/\.pptx$/, '.md'),
        mime: 'text/markdown',
      }
  }
}

export function download(d: Deliverable) {
  const { text, name, mime } = toDownload(d)
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
