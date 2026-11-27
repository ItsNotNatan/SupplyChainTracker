import { CheckCircle2, AlertCircle, Circle, Minus } from 'lucide-react'

export function excelToJSDate(value) {
  if (value === undefined || value === null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())) {
    const serial = Number(value)
    if (!Number.isFinite(serial) || serial <= 0) return null
    return new Date(Date.UTC(1899, 11, 30) + Math.round(serial * 86400000))
  }

  const text = String(value).trim()
  const brDate = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (brDate) {
    const [, day, month, year] = brDate
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  }

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(date) {
  if (!date) return '-'
  const parsed = date instanceof Date ? date : excelToJSDate(date)
  if (!parsed || Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export function formatCur(value) {
  if (value === undefined || value === null || value === '' || Number.isNaN(Number(value))) return 'R$ 0,00'
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function cleanTr(value) {
  return String(value || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

export function getTheme(status) {
  switch (status) {
    case 'Complete':
      return { b: 'border-complete', bg: 'bg-complete', Icon: CheckCircle2, t: 'Concluído no prazo', c: 'complete' }
    case 'Complete late':
      return { b: 'border-complete-late', bg: 'bg-complete-late', Icon: CheckCircle2, t: 'Concluído após o prazo', c: 'complete-late' }
    case 'On delayed':
      return { b: 'border-delayed', bg: 'bg-delayed', Icon: AlertCircle, t: 'Atraso/Risco', c: 'delayed' }
    case 'Ongoing':
      return { b: 'border-ongoing', bg: 'bg-ongoing', Icon: Circle, t: 'Em andamento', c: 'ongoing' }
    default:
      return { b: '', bg: '', Icon: Minus, t: 'Sem informação', c: 'empty' }
  }
}

export { PenTool, Cpu, ShoppingCart, DollarSign, Wrench, Factory, Truck } from 'lucide-react'
