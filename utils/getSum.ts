/**
 * Утилиты для подсчета сумм
 */

export interface ProductItem {
  totalDiscountPrice?: string | number
  totalPrice?: string | number
  discountPrice?: string | number
  price?: string | number
  amount?: string | number
}

/**
 * Подсчет общей суммы товаров в корзине (из старого проекта)
 */
export function getSum(arr: ProductItem[]): number {
  if (!Array.isArray(arr)) {
    return 0
  }

  return arr.reduce((acc, item) => {
    // Проверяем существование totalDiscountPrice
    if (item.totalDiscountPrice) {
      return acc + parseFloat(String(item.totalDiscountPrice))
    }
    
    // Проверяем существование totalPrice
    if (item.totalPrice) {
      return acc + parseFloat(String(item.totalPrice))
    }
    
    // Проверяем существование discountPrice и умножаем на amount
    if (item.discountPrice) {
      const price = parseFloat(String(item.discountPrice))
      const amount = parseFloat(String(item.amount || 1))
      return acc + Math.floor(price * amount)
    }
    
    // Если ни totalDiscountPrice, ни totalPrice, ни discountPrice нет, используем price * amount
    if (item.price) {
      const price = parseFloat(String(item.price))
      const amount = parseFloat(String(item.amount || 1))
      return acc + Math.floor(price * amount)
    }
    
    return acc // Если ничего из вышеперечисленного не подходит, просто возвращаем текущую сумму
  }, 0)
}
