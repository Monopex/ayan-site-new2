/**
 * Утилиты для работы с остатками товаров
 */
export interface BalanceItem {
  id: number
  color: string
}

export interface BalanceResult {
  status: string
  content: BalanceItem[]
  val: string
}

/**
 * Округление остатка товара (из старого проекта)
 */
function getRoundedBalance(balance: number): number {
  if (!balance) return 0
  const bal = balance.toFixed(1)
  return bal < 1 ? parseFloat(bal) : Math.trunc(parseFloat(bal))
}

/**
 * Получение статуса остатка товара (из старого проекта)
 */
export function getBalance(provider: { balance: number }, measureType: string): BalanceResult {
  const balance: BalanceResult = {
    status: '',
    content: [],
    val: `${getRoundedBalance(provider.balance)} ${measureType}`
  }

  // Создаем 3 индикатора (зеленые по умолчанию)
  for (let i = 0; i <= 2; i++) {
    balance.content.push({ id: i, color: '#8CCD28' })
  }

  // Определяем цвет индикаторов в зависимости от остатка
  switch (true) {
    case provider.balance === 0:
      balance.content[0].color = 'gray'
      balance.content[1].color = 'gray'
      balance.content[2].color = 'gray'
      break
    case provider.balance > 0 && provider.balance <= 5:
      balance.content[1].color = 'gray'
      balance.content[2].color = 'gray'
      break
    case provider.balance >= 6 && provider.balance <= 10:
      balance.content[2].color = 'gray'
      break
  }

  // Подсчитываем количество зеленых индикаторов
  const success = balance.content.filter((x) => x.color === '#8CCD28').length

  // Определяем статус в зависимости от количества зеленых индикаторов
  switch (success) {
    case 1:
      balance.status = 'Мало товара'
      break
    case 2:
      balance.status = 'Ограниченное количество'
      break
    case 3:
      balance.status = 'Много товара'
      break
  }

  return balance
}
