// Базовые типы для API
export interface ApiResponse<T = any> {
  data: T
  status: 'success' | 'error'
  message?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

// Типы для авторизации
export interface AuthRequest {
  phone: string
  password?: string
  code?: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  tokenExpirationDate: string
  refreshTokenExpirationDate: string
  clientId: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// Типы для продуктов
export interface Product {
  providerProductId: string
  productId?: string
  name: string
  nameKz: string
  price: number
  discountPrice?: number
  totalPrice?: number
  totalDiscountPrice?: number
  images: string[]
  categoryId: string
  categoryIds?: string[]
  providerId: string
  departmentId: string
  departmentName?: string
  departmentIsAyan?: boolean
  amount?: number
  amountStep?: number
  measureStep?: number
  measureType: string
  rating?: number
  reviewsCount?: number
  isFavorite?: boolean
  highlightInCategory?: boolean
  limit?: number
  balance?: number
  forPacket?: boolean
  packetStep?: number
  priceMap?: Record<string, { price: number }>
}

export interface ProductCategory {
  categoryId: string
  categoryName: string
  categoryNameKz: string
  displayName?: string
  displayNameKz?: string
  topLevelTitle?: string
  topLevelTitleKz?: string
  bgImg?: string
  type?: 'common' | 'background' | 'module' | 'promo' | 'carousel'
  orderOnPage?: number
  linkType?: string
  parentDepartment?: any
  categories?: ProductCategory[]
}

// Типы для корзины
export interface CartItem {
  productId: string
  providerId: string
  departmentId: string
  amount: number
  price: number
  totalPrice: number
  discountPrice?: number
  totalDiscountPrice?: number
  productName: string
  productNameKz: string
  measureType: string
  amountStep?: number
  measureStep?: number
  departmentName?: string
  departmentIsAyan?: boolean
  categoryId?: string
  balance?: number
  forPacket?: boolean
  packetStep?: number
}

export interface CartDetails {
  totalAmount: number
  totalPrice: number
  totalLength: number
}

// Типы для геолокации
export interface City {
  id: number
  name: string
  nameKz?: string
}

export interface Department {
  id: number
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface Address {
  street: string
  house: string
  apartment?: string
  entrance?: string
  floor?: string
  comment?: string
  geo: {
    lat: number
    lng: number
  }
  save?: boolean
}

// Типы для заказов
export interface Order {
  orderId: string
  status: string
  totalPrice: number
  deliveryTime: string
  address: Address
  products: CartItem[]
  paymentType: string
  comment?: string
  createdAt: string
}

export interface CreateOrderRequest {
  phoneUser: string
  nameUser: string
  surnameUser: string
  departmentId: number
  products: Array<{
    productId: number
    amount: number
    providerId: number
  }>
  paymentTypeId: number
  address: Address
  deliveryTime?: string
  comment?: string
  device?: string
  promoCode?: string
}

// Типы для баннеров
export interface Banner {
  id: string
  title: string
  titleKz?: string
  imageUrl: string
  linkUrl?: string
  type: string
  order: number
}

// Типы для историй
export interface Story {
  id: string
  title: string
  titleKz?: string
  imageUrl: string
  videoUrl?: string
  duration: number
  order: number
}

// Типы для поиска
export interface SearchParams {
  name: string
  departmentId: number
  page?: number
  pageSize?: number
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  features?: string[]
}

export interface SearchResponse {
  searchResult: PaginatedResponse<Product>
  maxPrice: number
  providerIds: string[]
  categoryIdsForDiscount: string[]
  departmentIds: number[]
  features: string[]
}

// Типы для фильтров
export interface FilterParams {
  categoryId?: string
  departmentIds: number[]
  minPrice?: number
  maxPrice?: number
  features?: string[]
  page?: number
  size?: number
}

// Типы для отзывов
export interface Review {
  id: string
  rating: number
  comment: string
  userName: string
  createdAt: string
  likes: number
  dislikes: number
  images?: string[]
}

// Типы для клиента
export interface Client {
  id: string
  phone: string
  name: string
  surname: string
  email?: string
  addresses: Address[]
  orders: Order[]
}

// Типы для UTM параметров
export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

// Типы для витрин
export interface Showcase {
  id: string
  name: string
  nameKz: string
  title: string
  titleKz: string
  type: 'common' | 'background' | 'module' | 'promo' | 'carousel'
  orderOnPage: number
  parentCategory?: ProductCategory
  parentDepartment?: any
  products?: Product[]
  categories?: ProductCategory[]
  image?: string
  linkType?: string
}

// Типы для тегов
export interface HomepageTag {
  id: string
  name: string
  nameKz: string
  color: string
  order: number
  linkUrl?: string
}
