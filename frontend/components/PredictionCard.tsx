type Props = {
  disease: string
  confidence: number
}

export default function PredictionCard({ disease, confidence }: Props) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-semibold">{disease}</h3>
      <p className="text-sm text-gray-600">Confidence: <strong>{confidence}%</strong></p>
    </div>
  )
}
