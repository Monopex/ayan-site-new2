/**
 * Утилиты для построения структуры магазинов
 */

export interface ShopItem {
  id: string | number
  name: string
  children: ShopItem[]
  isShopsRoot?: boolean
  isShopGroup?: boolean
  isShop?: boolean
  img?: string
}

export interface DepartmentEntity {
  id: string | number
  name: string
  img?: string
  departmentGroup?: {
    id: string | number
    name: string
  }
}

/**
 * Построение структуры магазинов из списка филиалов (из старого проекта)
 */
export function buildShopsItem(depEntities: DepartmentEntity[]): ShopItem {
  const root: ShopItem = {
    id: 'shops',
    name: 'Магазины',
    children: [],
    isShopsRoot: true
  }

  // Если филиалов нет или это не массив
  if (!depEntities || !Array.isArray(depEntities) || !depEntities.length) {
    return root
  }

  const groupMap: Record<string | number, ShopItem> = {}

  depEntities.forEach((dep) => {
    let grpId = 0
    let grpName = 'Без группы'

    if (dep.departmentGroup && dep.departmentGroup.id) {
      grpId = dep.departmentGroup.id
      grpName = dep.departmentGroup.name
        ? dep.departmentGroup.name.trim()
        : 'Без группы'
    }

    // Если в groupMap ещё нет такой группы — создаём
    if (!groupMap[grpId]) {
      groupMap[grpId] = {
        id: grpId,
        name: grpName,
        children: [],
        isShopGroup: true
      }
    }

    // Внутрь найденной/созданной группы пушим филиал
    groupMap[grpId].children.push({
      id: dep.id,
      name: dep.name,
      children: [],
      isShop: true,
      img: dep.img
    })
  })

  // Формируем массив групп
  root.children = Object.values(groupMap)

  return root
}
