/**
 * Плагин для системы уведомлений (замена vue-notifications)
 */
export default defineNuxtPlugin(() => {
  // Простая система уведомлений
  const notify = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    if (process.client) {
      // Создаем элемент уведомления
      const notification = document.createElement('div')
      notification.className = `notification notification-${type}`
      notification.textContent = message
      
      // Стили
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      `
      
      // Цвета по типам
      const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
      }
      notification.style.backgroundColor = colors[type]
      
      // Добавляем в DOM
      document.body.appendChild(notification)
      
      // Анимация появления
      setTimeout(() => {
        notification.style.opacity = '1'
        notification.style.transform = 'translateX(0)'
      }, 100)
      
      // Автоматическое удаление
      setTimeout(() => {
        notification.style.opacity = '0'
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 300)
      }, 5000)
    }
  }

  // Инжектим в приложение
  return {
    provide: {
      notify
    }
  }
})
