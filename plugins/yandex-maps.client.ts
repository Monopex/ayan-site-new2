/**
 * Плагин для работы с Yandex Maps (замена ymapPlugin)
 */
export default defineNuxtPlugin(() => {
  // Конфигурация карт (из старого проекта)
  const config = {
    lang: 'ru_RU',
    version: '2.1',
    apiKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY || ''
  }

  // Инициализация Yandex Maps
  const initYandexMaps = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (process.client) {
        // Проверяем, не загружены ли карты уже
        if (window.ymaps) {
          resolve(window.ymaps)
          return
        }

        // Создаем скрипт для загрузки API
        const script = document.createElement('script')
        script.src = `https://api-maps.yandex.ru/${config.version}/?lang=${config.lang}&apikey=${config.apiKey}`
        script.async = true

        script.onload = () => {
          if (window.ymaps) {
            window.ymaps.ready(() => {
              resolve(window.ymaps)
            })
          } else {
            reject(new Error('Yandex Maps API не загружен'))
          }
        }

        script.onerror = () => {
          reject(new Error('Ошибка загрузки Yandex Maps API'))
        }

        document.head.appendChild(script)
      } else {
        reject(new Error('Yandex Maps доступен только на клиенте'))
      }
    })
  }

  // Инжектим в приложение
  return {
    provide: {
      initYandexMaps,
      config
    }
  }
})
