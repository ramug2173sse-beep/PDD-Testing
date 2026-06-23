import { useState } from 'react'

type Props = {
  onChange?: (symptoms: string[]) => void
  initial?: string[]
}

export default function SymptomSelector({ onChange, initial = [] }: Props) {
  const [text, setText] = useState('')
  const [items, setItems] = useState<string[]>(initial)

  function add() {
    const t = text.trim()
    if (!t) return
    if (!items.includes(t)) {
      const next = [...items, t]
      setItems(next)
      onChange && onChange(next)
    }
    setText('')
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next)
    onChange && onChange(next)
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <label className="block text-sm font-medium text-gray-700">Symptoms</label>
      <div className="flex gap-2 mt-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} className="flex-1 border rounded px-3 py-2" placeholder="Type a symptom and press Enter" />
        <button onClick={add} className="bg-blue-600 text-white px-4 rounded">Add</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((s, idx) => (
          <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
            <span>{s}</span>
            <button onClick={() => remove(idx)} className="text-xs text-red-600">✕</button>
          </span>
        ))}
      </div>
    </div>
  )
}
