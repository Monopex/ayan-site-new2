/**
 * Плагин для масок ввода полей
 */
export default defineNuxtPlugin(() => {
  // Директива для маски ввода
  const vMask = {
    mounted(el: HTMLInputElement, binding: any) {
      const mask = binding.value
      if (!mask) return

      let isInput = false
      let cursorPosition = 0

      // Применение маски
      const applyMask = (value: string): string => {
        let result = ''
        let valueIndex = 0

        for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
          const maskChar = mask[i]
          const valueChar = value[valueIndex]

          if (maskChar === '#') {
            // Цифра
            if (/\d/.test(valueChar)) {
              result += valueChar
              valueIndex++
            } else {
              break
            }
          } else if (maskChar === 'A') {
            // Буква
            if (/[a-zA-Z]/.test(valueChar)) {
              result += valueChar
              valueIndex++
            } else {
              break
            }
          } else if (maskChar === 'a') {
            // Буква в нижнем регистре
            if (/[a-zA-Z]/.test(valueChar)) {
              result += valueChar.toLowerCase()
              valueIndex++
            } else {
              break
            }
          } else if (maskChar === 'N') {
            // Буква или цифра
            if (/[a-zA-Z0-9]/.test(valueChar)) {
              result += valueChar
              valueIndex++
            } else {
              break
            }
          } else {
            // Символ маски
            result += maskChar
          }
        }

        return result
      }

      // Обработчик ввода
      const handleInput = (event: Event) => {
        if (isInput) return
        
        isInput = true
        const target = event.target as HTMLInputElement
        const value = target.value
        const maskedValue = applyMask(value)
        
        target.value = maskedValue
        cursorPosition = maskedValue.length
        
        // Устанавливаем курсор в конец
        setTimeout(() => {
          target.setSelectionRange(cursorPosition, cursorPosition)
        }, 0)
        
        isInput = false
      }

      // Обработчик вставки
      const handlePaste = (event: ClipboardEvent) => {
        event.preventDefault()
        const pastedText = event.clipboardData?.getData('text') || ''
        const maskedValue = applyMask(pastedText)
        
        el.value = maskedValue
        cursorPosition = maskedValue.length
        
        // Устанавливаем курсор в конец
        setTimeout(() => {
          el.setSelectionRange(cursorPosition, cursorPosition)
        }, 0)
      }

      // Добавляем обработчики
      el.addEventListener('input', handleInput)
      el.addEventListener('paste', handlePaste)
      
      // Сохраняем ссылки для очистки
      el._maskHandlers = { handleInput, handlePaste }
    },

    unmounted(el: HTMLInputElement) {
      if (el._maskHandlers) {
        el.removeEventListener('input', el._maskHandlers.handleInput)
        el.removeEventListener('paste', el._maskHandlers.handlePaste)
        delete el._maskHandlers
      }
    }
  }

  // Предустановленные маски
  const masks = {
    phone: '+7 (###) ###-##-##',
    phoneKz: '+7 (###) ###-##-##',
    card: '#### #### #### ####',
    expiry: '##/##',
    cvv: '###',
    date: '##.##.####',
    time: '##:##',
    snils: '###-###-### ##',
    inn: '##########',
    kpp: '#########',
    bik: '#########',
    account: '##################',
    money: '# ### ###.##',
    postal: '######'
  }

  // Функция для получения маски по имени
  const getMask = (name: keyof typeof masks): string => {
    return masks[name] || ''
  }

  // Функция для валидации по маске
  const validateByMask = (value: string, mask: string): boolean => {
    if (value.length !== mask.length) return false
    
    for (let i = 0; i < mask.length; i++) {
      const maskChar = mask[i]
      const valueChar = value[i]
      
      if (maskChar === '#') {
        if (!/\d/.test(valueChar)) return false
      } else if (maskChar === 'A') {
        if (!/[a-zA-Z]/.test(valueChar)) return false
      } else if (maskChar === 'a') {
        if (!/[a-zA-Z]/.test(valueChar)) return false
      } else if (maskChar === 'N') {
        if (!/[a-zA-Z0-9]/.test(valueChar)) return false
      } else {
        if (maskChar !== valueChar) return false
      }
    }
    
    return true
  }

  // Инжектим в приложение
  return {
    provide: {
      vMask,
      masks,
      getMask,
      validateByMask
    }
  }
})
