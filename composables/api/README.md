# API Layer Documentation

Новый API слой для проекта Ayan Market, построенный на современных технологиях с улучшенной архитектурой.

## Архитектура

API слой построен по принципу Layered Architecture с четким разделением ответственности:

```
composables/api/
├── core/                    # Базовая инфраструктура
│   ├── types.ts            # TypeScript типы
│   ├── client.ts           # HTTP клиент с interceptors
│   ├── cache.ts            # Система кэширования
│   └── retry.ts            # Логика повторных попыток
├── services/               # Бизнес-логика API
│   ├── auth.service.ts     # Авторизация
│   ├── products.service.ts # Продукты
│   ├── cart.service.ts     # Корзина
│   ├── geo.service.ts      # Геолокация
│   ├── categories.service.ts # Категории
│   └── orders.service.ts   # Заказы
├── composables/            # Vue 3 Composables
│   ├── useAuth.ts         # Авторизация
│   ├── useProducts.ts     # Продукты
│   ├── useCart.ts         # Корзина
│   ├── useGeo.ts          # Геолокация
│   └── useOrders.ts       # Заказы
├── index.ts               # Главный файл экспорта
└── plugin.ts              # Nuxt plugin
```

## Основные улучшения

### 1. Type Safety
- Полная типизация с TypeScript
- Автокомплит и проверка типов
- Интерфейсы для всех API ответов

### 2. Централизованная обработка ошибок
- Единый механизм обработки ошибок
- Автоматическое перенаправление при 401
- Показ уведомлений об ошибках

### 3. Кэширование
- Умное кэширование запросов
- TTL для разных типов данных
- Автоматическая очистка устаревших данных

### 4. Retry логика
- Экспоненциальный backoff
- Настраиваемые параметры повторов
- Обработка временных ошибок

### 5. Реактивность
- Vue 3 Composition API
- Реактивные состояния
- Автоматическое обновление UI

## Использование

### Базовое использование

```typescript
// В компоненте Vue
<script setup>
import { useAuth, useProducts, useCart } from '~/composables/api'

// Авторизация
const { signIn, signOut, isAuthenticated, loading, error } = useAuth()

// Продукты
const { 
  products, 
  fetchProductsByCategory, 
  searchProducts,
  loading: productsLoading 
} = useProducts()

// Корзина
const { 
  items, 
  addToCart, 
  removeFromCart, 
  totalPrice,
  loading: cartLoading 
} = useCart()

// Инициализация
onMounted(async () => {
  await fetchProductsByCategory({
    categoryId: '123',
    departmentIds: [1, 2, 3]
  })
})
</script>
```

### Работа с авторизацией

```typescript
const { signIn, signOut, isAuthenticated, user } = useAuth()

// Авторизация
const handleLogin = async (credentials) => {
  const result = await signIn(credentials)
  if (result) {
    // Успешная авторизация
    navigateTo('/')
  }
}

// Выход
const handleLogout = async () => {
  await signOut()
  navigateTo('/auth')
}
```

### Работа с продуктами

```typescript
const { 
  products, 
  currentProduct,
  fetchProductById,
  searchProducts,
  loading,
  error 
} = useProducts()

// Загрузка продукта
const loadProduct = async (productId) => {
  const product = await fetchProductById(productId)
  if (product) {
    // Продукт загружен
  }
}

// Поиск продуктов
const search = async (query) => {
  const results = await searchProducts({
    name: query,
    departmentId: 1,
    page: 0,
    pageSize: 20
  })
}
```

### Работа с корзиной

```typescript
const { 
  items, 
  addToCart, 
  updateItem,
  removeFromCart,
  totalPrice,
  isEmpty 
} = useCart()

// Добавление в корзину
const addProduct = async (product) => {
  const success = await addToCart({
    productId: product.id,
    providerId: product.providerId,
    departmentId: product.departmentId,
    amount: 1,
    price: product.price,
    totalPrice: product.price,
    productName: product.name,
    measureType: product.measureType
  })
}

// Обновление количества
const updateQuantity = async (productId, newAmount) => {
  await updateItem({
    productId,
    providerId: '123',
    departmentId: '1',
    amount: newAmount
  })
}
```

### Работа с геолокацией

```typescript
const { 
  cities,
  selectedCity,
  departments,
  currentAddress,
  selectCity,
  findDepartmentsByAddress 
} = useGeo()

// Выбор города
const changeCity = async (cityId) => {
  await selectCity(cityId)
}

// Поиск департаментов по адресу
const findDepartments = async (address) => {
  const result = await findDepartmentsByAddress({
    lat: address.lat,
    lng: address.lng,
    street: address.street,
    house: address.house
  })
}
```

## Конфигурация

### Настройка API URL

В `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://213.139.208.142:8083/api/'
    }
  }
})
```

### Настройка кэширования

```typescript
import { getApiCache } from '~/composables/api'

const cache = getApiCache()
cache.setDefaultTTL(10 * 60 * 1000) // 10 минут
```

### Настройка retry логики

```typescript
import { RetryHandler, retryUtils } from '~/composables/api'

// Использование с кастомной конфигурацией
const result = await RetryHandler.withRetry(
  () => apiCall(),
  retryUtils.critical() // 5 попыток, до 30 секунд
)
```

## Миграция с старого API

### Старый способ:
```javascript
// old/api/modules/Products.js
const data = await this.$api.Products.getProductsByCategory(params)
```

### Новый способ:
```typescript
// composables/api/composables/useProducts.ts
const { fetchProductsByCategory } = useProducts()
const data = await fetchProductsByCategory(params)
```

## Преимущества новой архитектуры

1. **Type Safety** - полная типизация
2. **Reusability** - переиспользуемые composables
3. **Testability** - легко тестировать
4. **Maintainability** - четкое разделение ответственности
5. **Performance** - кэширование и оптимизация
6. **Developer Experience** - автокомплит и IntelliSense
7. **Error Handling** - централизованная обработка ошибок
8. **Caching** - умное кэширование запросов
9. **Retry Logic** - автоматические повторы
10. **Reactivity** - реактивные состояния Vue 3

## Дальнейшее развитие

- [ ] Добавить WebSocket поддержку
- [ ] Реализовать offline режим
- [ ] Добавить метрики и мониторинг
- [ ] Создать автоматические тесты
- [ ] Добавить документацию API
