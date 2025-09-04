import { defineStore } from 'pinia'

const getDefaultState = () => ({
  clientAdress: [],
  clientSingle: {},
  clientOrders: [],
  tokenInfo: null,
  isLoggin: false
})

export const usePersonalStore = defineStore('personal', () => {
  // State
  const clientAdress = ref<any[]>([])
  const clientSingle = ref<any>({})
  const clientOrders = ref<any[]>([])
  const tokenInfo = ref<any>(null)
  const isLoggin = ref(false)

  // Getters
  const addresses = computed(() => clientAdress.value)
  const client = computed(() => clientSingle.value)
  const orders = computed(() => clientOrders.value)
  const token = computed(() => tokenInfo.value)
  const loggedIn = computed(() => isLoggin.value)

  // Actions
  const getClientAdress = async (id: string) => {
    try {
      // const data = await this.$axios.$get(`${API}client/${id}/address`, {
      //   headers: {
      //     TOKEN: this.app.$cookies.get('TOKEN')
      //   }
      // })
      // if (data.type === 'success') {
      //   clientAdress.value = data.data
      // }
      console.warn('getClientAdress не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения адресов клиента:', error)
      return { type: 'error' }
    }
  }

  const addClientAdress = async (input: any) => {
    try {
      // return await this.$axios.$post(`${API}client/address/${input.clientId}/add`, input.input, {
      //   headers: {
      //     TOKEN: this.app.$cookies.get('TOKEN')
      //   }
      // })
      console.warn('addClientAdress не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка добавления адреса клиента:', error)
      return { type: 'error' }
    }
  }

  const deleteClientAdress = async (addressId: string) => {
    try {
      // return await this.$axios.$delete(`${API}client/address/delete/${addressId}`, {
      //   headers: {
      //     TOKEN: this.app.$cookies.get('TOKEN')
      //   }
      // })
      console.warn('deleteClientAdress не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка удаления адреса клиента:', error)
      return { type: 'error' }
    }
  }

  const editClient = async (input: any) => {
    try {
      // const headers = {
      //   TOKEN: this.app.$cookies.get('TOKEN'),
      //   'device-type': this.app.$cookies.get('device-type') || '',
      //   'device-uuid': this.app.$cookies.get('device-uuid') || ''
      // }
      // const response = await this.$axios.$put(`${API}client/update`, input, { headers })
      // await getClient(input.id)
      // return response
      console.warn('editClient не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка редактирования клиента:', error)
      return {
        data: error.response?.data?.data,
        type: 'error'
      }
    }
  }

  const getClient = async (input: string) => {
    try {
      // const data = await this.$axios.$get(`${API}web/client/${input}`, {
      //   headers: {
      //     TOKEN: this.app.$cookies.get('TOKEN')
      //   }
      // })
      // if (data.type !== 'error') {
      //   clientSingle.value = data
      // }
      console.warn('getClient не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения клиента:', error)
      return { type: 'error' }
    }
  }

  const getClientOrders = async () => {
    try {
      // const data = await this.$api.Personal.getClientOrders(this.app.$cookies.get('TOKEN'))
      // clientOrders.value = data
      console.warn('getClientOrders не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения заказов клиента:', error)
      return []
    }
  }

  const orderProducts = async (id: { order: string; department: string }) => {
    try {
      // return await this.$axios.$get(`${API}site/product/order/${id.order}/department/${id.department}`, {
      //   headers: {
      //     TOKEN: this.app.$cookies.get('TOKEN')
      //   }
      // })
      console.warn('orderProducts не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения товаров заказа:', error)
      return { type: 'error' }
    }
  }

  const getTokenInfo = async () => {
    try {
      // const data = await this.$axios.$get(`${API}admin/auth/token`, {
      //   headers: {
      //     TOKEN: 'Bearer ' + this.app.$cookies.get('TOKEN')
      //   }
      // })
      // Vue.prototype.$Ecomerce.authorization(data)
      // Vue.prototype.$Ecomerce.authorizationComplete()
      // tokenInfo.value = data
      console.warn('getTokenInfo не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения информации токена:', error)
      return { type: 'error' }
    }
  }

  const logInOut = (input: boolean) => {
    isLoggin.value = input
  }

  const logOutPurge = async () => {
    try {
      // this.app.$cookies.remove('TOKEN')
      // this.app.$cookies.remove('clientId')
      // if (process.client) {
      //   try {
      //     for (let i = localStorage.length - 1; i >= 0; i--) {
      //       const key = localStorage.key(i)
      //       if (!key) { continue }
      //       if (key.startsWith('vuex-secure-persist') || key === 'vuex-persist' || key === 'refToken') {
      //         localStorage.removeItem(key)
      //       }
      //     }
      //   } catch (e) {}
      // }
      // isLoggin.value = false
      // Object.assign(state, getDefaultState())
      // // Очистка других store
      console.warn('logOutPurge не реализован в новом API')
    } catch (error) {
      console.error('Ошибка выхода из системы:', error)
    }
  }

  const purgeAllState = async () => {
    try {
      // if (process.client) {
      //   try {
      //     for (let i = localStorage.length - 1; i >= 0; i--) {
      //       const key = localStorage.key(i)
      //       if (!key) { continue }
      //       if (key.startsWith('vuex-secure-persist') || key === 'vuex-persist' || key === 'refToken') {
      //         localStorage.removeItem(key)
      //       }
      //     }
      //   } catch (e) {}
      // }
      // Object.assign(state, getDefaultState())
      // const token = this.app.$cookies.get('TOKEN')
      // if (token) {
      //   isLoggin.value = true
      // }
      // // Очистка других store
      console.warn('purgeAllState не реализован в новом API')
    } catch (error) {
      console.error('Ошибка очистки состояния:', error)
    }
  }

  return {
    // State
    clientAdress: readonly(clientAdress),
    clientSingle: readonly(clientSingle),
    clientOrders: readonly(clientOrders),
    tokenInfo: readonly(tokenInfo),
    isLoggin: readonly(isLoggin),
    
    // Getters
    addresses,
    client,
    orders,
    token,
    loggedIn,
    
    // Actions
    getClientAdress,
    addClientAdress,
    deleteClientAdress,
    editClient,
    getClient,
    getClientOrders,
    orderProducts,
    getTokenInfo,
    logInOut,
    logOutPurge,
    purgeAllState
  }
})