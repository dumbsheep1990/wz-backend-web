<template>
  <div class="modern-layout" :class="[`mode-${layoutMode}`, {'dark': isDark}]">
    <!-- 顶部模式：导航在顶部 -->
    <template v-if="layoutMode === 'horizontal'">
      <div class="fixed-header w-full">
        <modern-nav-bar 
          mode="horizontal" 
          :fixed-header="true"
          @collapse-change="handleCollapseChange"
        >
          <template #tools>
            <nav-tools />
          </template>
        </modern-nav-bar>
      </div>
      <div class="main-content pt-16">
        <gva-tabs v-if="config.showTabs" />
        <div class="page-container" :class="config.showTabs ? 'with-tabs' : ''">
          <component :is="routerViewContainer" />
        </div>
      </div>
    </template>
    
    <!-- 侧边栏模式：导航在左侧 -->
    <template v-else-if="layoutMode === 'vertical'">
      <modern-nav-bar 
        mode="vertical" 
        :fixed-header="true"
        @collapse-change="handleCollapseChange"
      >
        <template #tools>
          <nav-tools />
        </template>
      </modern-nav-bar>
      <div class="main-content" :style="{ marginLeft: sidebarWidth + 'px' }">
        <gva-tabs v-if="config.showTabs" />
        <div class="page-container" :class="config.showTabs ? 'with-tabs' : ''">
          <component :is="routerViewContainer" />
        </div>
      </div>
    </template>
    
    <!-- 组合模式：主导航在顶部，子导航在左侧 -->
    <template v-else-if="layoutMode === 'combined'">
      <div class="combined-layout">
        <div class="top-section fixed-header w-full">
          <!-- 顶部主导航 -->
          <modern-nav-bar 
            mode="horizontal" 
            :fixed-header="true"
            :show-breadcrumb="false"
            @collapse-change="handleCollapseChange"
          >
            <template #tools>
              <nav-tools />
            </template>
          </modern-nav-bar>
        </div>
        
        <!-- 侧边栏子导航 -->
        <div class="side-section" :style="{ width: isCollapsed ? '64px' : '240px' }">
          <component 
            :is="sideNavMenu" 
            :is-collapsed="isCollapsed"
            @collapse-change="handleCollapseChange"
          />
        </div>
        
        <!-- 主内容区域 -->
        <div class="main-content-combined" :style="{ 
          marginLeft: isCollapsed ? '64px' : '240px',
          marginTop: '64px' 
        }">
          <gva-tabs v-if="config.showTabs" />
          <div class="page-container" :class="config.showTabs ? 'with-tabs' : ''">
            <component :is="routerViewContainer" />
          </div>
        </div>
      </div>
    </template>
    
    <!-- 迷你侧边模式：侧边导航收起为图标 -->
    <template v-else-if="layoutMode === 'compact'">
      <div class="compact-layout">
        <div class="mini-sidebar" :class="{ 'expanded': !isCollapsed }">
          <div class="logo-container">
            <img :src="$GIN_VUE_ADMIN.appLogo" alt="Logo" class="logo" @click="goHome" />
          </div>
          <div class="menu-icons">
            <template v-for="(item, index) in menuItems" :key="index">
              <div 
                v-if="!item.hidden" 
                class="menu-icon-item" 
                :class="{ 'active': isActiveMenu(item) }"
                @click="handleMenuClick(item)"
              >
                <el-tooltip 
                  :content="item.meta?.title || item.name" 
                  placement="right"
                  :disabled="!isCollapsed"
                >
                  <div class="icon-wrapper">
                    <el-icon v-if="item.meta && item.meta.icon">
                      <component :is="item.meta.icon" />
                    </el-icon>
                    <icon-svg v-else-if="item.meta && item.meta.svgIcon" :name="item.meta.svgIcon" />
                    <el-icon v-else><Document /></el-icon>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </div>
          <div class="toggle-button" @click="toggleCollapse">
            <el-icon v-if="isCollapsed"><DArrowRight /></el-icon>
            <el-icon v-else><DArrowLeft /></el-icon>
          </div>
        </div>
        
        <!-- 展开的子菜单 -->
        <div 
          v-if="!isCollapsed" 
          class="expanded-submenu"
          :style="{ left: '64px' }"
        >
          <div class="submenu-header">
            <span>{{ activeParentMenu?.meta?.title || activeParentMenu?.name }}</span>
          </div>
          <el-scrollbar>
            <el-menu
              :default-active="activeSubMenu"
              class="submenu-list"
              @select="handleSubMenuSelect"
            >
              <template v-for="child in visibleChildren" :key="child.name">
                <modern-menu-item :item="child" :base-path="activeParentMenu?.path" />
              </template>
            </el-menu>
          </el-scrollbar>
        </div>
        
        <!-- 顶部工具栏 -->
        <div class="top-toolbar">
          <div class="breadcrumb-section">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item
                v-for="item in breadcrumbItems"
                :key="item.path"
              >
                {{ fmtTitle(item.meta.title, route) }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="tools-section">
            <nav-tools />
            <component :is="userDropdown" />
          </div>
        </div>
        
        <!-- 主内容区域 -->
        <div class="main-content-compact">
          <gva-tabs v-if="config.showTabs" />
          <div class="page-container" :class="config.showTabs ? 'with-tabs' : ''">
            <component :is="routerViewContainer" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRouterStore } from '@/pinia/modules/router'
import { useUserStore } from '@/pinia/modules/user'
import { useAppStore } from '@/pinia'
import { storeToRefs } from 'pinia'
import { fmtTitle } from '@/utils/fmtRouterTitle'
import { setUserAuthority } from '@/api/user'
import ModernNavBar from './components/ModernNavBar.vue'
import ModernMenuItem from './components/ModernMenuItem.vue'
import GvaTabs from '@/view/layout/tabs/index.vue'
import NavTools from '@/view/layout/header/tools.vue'
import IconSvg from '@/components/svgIcon/svgIcon.vue'
import { DArrowLeft, DArrowRight, ArrowDown, User, SwitchButton, Document } from '@element-plus/icons-vue'

// 路由视图容器组件
const RouterViewContainer = defineComponent({
  name: 'RouterViewContainer',
  setup() {
    const routerStore = useRouterStore()
    const reloadFlag = ref(true)
    const appStore = useAppStore()
    const { config } = storeToRefs(appStore)
    
    return {
      reloadFlag,
      routerStore,
      config
    }
  },
  template: `
    <div class="router-view-container">
      <router-view v-if="reloadFlag" v-slot="{ Component, route }">
        <transition 
          mode="out-in" 
          :name="route.meta.transitionType || config.value.transition_type"
        >
          <keep-alive :include="routerStore.keepAliveRouters">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  `
})

// 用户下拉菜单组件
const UserDropdown = defineComponent({
  name: 'UserDropdown',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    
    const goToPersonal = () => {
      router.push({ name: 'person' })
    }
    
    const logout = () => {
      userStore.LoginOut()
    }
    
    const switchRole = async (authorityId) => {
      const res = await setUserAuthority({
        authorityId: authorityId
      })
      
      if (res.code === 0) {
        window.sessionStorage.setItem('needCloseAll', 'true')
        window.sessionStorage.setItem('needToHome', 'true')
        window.location.reload()
      }
    }
    
    return {
      userStore,
      goToPersonal,
      logout,
      switchRole
    }
  },
  template: `
    <el-dropdown class="user-dropdown">
      <div class="user-info">
        <el-avatar :size="32" :src="userStore.userInfo.headerImg" />
        <span class="user-name">{{ userStore.userInfo.nickName }}</span>
        <el-icon><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <span>当前角色：{{ userStore.userInfo.authority?.authorityName }}</span>
          </el-dropdown-item>
          <el-dropdown-item 
            v-for="item in userStore.userInfo.authorities?.filter(auth => auth.authorityId !== userStore.userInfo.authorityId)" 
            :key="item.authorityId" 
            @click="switchRole(item.authorityId)"
          >
            <span>切换为：{{ item.authorityName }}</span>
          </el-dropdown-item>
          <el-dropdown-item @click="goToPersonal">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-dropdown-item>
          <el-dropdown-item @click="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  `
})

// 侧边栏导航菜单组件
const SideNavMenu = defineComponent({
  name: 'SideNavMenu',
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['collapse-change'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    const routerStore = useRouterStore()
    const activeMenu = ref('')
    
    const menuItems = computed(() => 
      routerStore.asyncRouters[0]?.children?.filter(item => !item.hidden) || []
    )
    
    watch(() => route.name, (newVal) => {
      if (route.name === 'Iframe') {
        activeMenu.value = decodeURIComponent(route.query.url)
      } else {
        activeMenu.value = route.meta.activeName || route.name
      }
    }, { immediate: true })
    
    const handleMenuSelect = (index) => {
      if (index === route.name) return
      
      const query = {}
      const params = {}
      
      if (routerStore.routeMap[index]?.parameters) {
        routerStore.routeMap[index].parameters.forEach((item) => {
          if (item.type === 'query') {
            query[item.key] = item.value
          } else {
            params[item.key] = item.value
          }
        })
      }
      
      if (index.indexOf('http://') > -1 || index.indexOf('https://') > -1) {
        if (index === 'Iframe') {
          query.url = decodeURIComponent(index)
          router.push({
            name: 'Iframe',
            query,
            params
          })
        } else {
          window.open(index, '_blank')
        }
      } else {
        router.push({ name: index, query, params })
      }
    }
    
    const toggleCollapse = () => {
      emit('collapse-change', !props.isCollapsed)
    }
    
    return {
      activeMenu,
      menuItems,
      handleMenuSelect,
      toggleCollapse,
      props
    }
  },
  template: `
    <div class="side-nav-menu">
      <div class="side-header">
        <span>导航菜单</span>
      </div>
      <el-scrollbar>
        <el-menu
          :collapse="isCollapsed"
          :default-active="activeMenu"
          :collapse-transition="false"
          class="side-menu"
          unique-opened
          @select="handleMenuSelect"
        >
          <modern-menu-item
            v-for="item in menuItems"
            :key="item.name"
            :item="item"
            :base-path="item.path"
          />
        </el-menu>
      </el-scrollbar>
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon>
          <d-arrow-right v-if="isCollapsed" />
          <d-arrow-left v-else />
        </el-icon>
      </div>
    </div>
  `
})

// 使用组件
const routerViewContainer = RouterViewContainer
const userDropdown = UserDropdown
const sideNavMenu = SideNavMenu

// 主脚本
const route = useRoute()
const router = useRouter()
const routerStore = useRouterStore()
const appStore = useAppStore()
const userStore = useUserStore()
const { config, isDark } = storeToRefs(appStore)

// 响应式状态
const isCollapsed = ref(false)
const activeParentMenu = ref(null)
const activeSubMenu = ref('')
const reloadFlag = ref(true)

// 计算属性
const layoutMode = computed(() => {
  const sideMode = config.value.side_mode
  switch(sideMode) {
    case 'head':
      return 'horizontal'
    case 'normal':
      return 'vertical'
    case 'combination':
      return 'combined'
    case 'sidebar':
      return 'compact'
    default:
      return 'vertical'
  }
})

const sidebarWidth = computed(() => {
  return isCollapsed.value ? 64 : 240
})

const menuItems = computed(() => 
  routerStore.asyncRouters[0]?.children?.filter(item => !item.hidden) || []
)

const visibleChildren = computed(() => {
  if (!activeParentMenu.value || !activeParentMenu.value.children) return []
  return activeParentMenu.value.children.filter(item => !item.hidden)
})

const breadcrumbItems = computed(() => route.matched?.slice(1) || [])

// 方法
const handleCollapseChange = (collapsed) => {
  isCollapsed.value = collapsed
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const goHome = () => {
  router.push({ path: '/dashboard' })
}

const isActiveMenu = (menu) => {
  if (!route.name) return false
  
  // 检查当前路由是否是这个菜单或其子菜单
  if (route.name === menu.name) {
    activeParentMenu.value = menu
    return true
  }
  
  // 检查子菜单
  if (menu.children) {
    const isChildActive = menu.children.some(child => {
      if (child.name === route.name) {
        activeParentMenu.value = menu
        activeSubMenu.value = child.name
        return true
      }
      return false
    })
    
    if (isChildActive) return true
  }
  
  return false
}

const handleMenuClick = (menu) => {
  // 如果没有子菜单，直接导航
  if (!menu.children || menu.children.length === 0 || menu.children.every(child => child.hidden)) {
    router.push({ name: menu.name })
    return
  }
  
  // 否则设置当前活动的父菜单，并确保侧边栏展开
  activeParentMenu.value = menu
  isCollapsed.value = false
  
  // 如果有子菜单，默认导航到第一个可见的子菜单
  const firstVisibleChild = menu.children.find(child => !child.hidden)
  if (firstVisibleChild) {
    activeSubMenu.value = firstVisibleChild.name
    router.push({ name: firstVisibleChild.name })
  }
}

const handleSubMenuSelect = (index) => {
  if (index === route.name) return
  
  const query = {}
  const params = {}
  
  if (routerStore.routeMap[index]?.parameters) {
    routerStore.routeMap[index].parameters.forEach((item) => {
      if (item.type === 'query') {
        query[item.key] = item.value
      } else {
        params[item.key] = item.value
      }
    })
  }
  
  router.push({ name: index, query, params })
}

// 生命周期钩子
onMounted(() => {
  // 初始化活动菜单
  for (const menu of menuItems.value) {
    if (isActiveMenu(menu)) break
  }
})

// 监听路由变化
watch(() => route.name, () => {
  for (const menu of menuItems.value) {
    if (isActiveMenu(menu)) break
  }
})
</script>

<style lang="scss" scoped>
.modern-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f5f7fa;
  
  // 顶部模式
  &.mode-horizontal {
    flex-direction: column;
    
    .fixed-header {
      position: fixed;
      top: 0;
      z-index: 100;
    }
    
    .main-content {
      flex: 1;
      overflow: hidden;
      
      .page-container {
        padding: 16px;
        height: calc(100vh - 64px);
        overflow: auto;
        
        &.with-tabs {
          height: calc(100vh - 104px);
        }
      }
    }
  }
  
  // 侧边栏模式
  &.mode-vertical {
    .main-content {
      margin-left: v-bind(sidebarWidth + 'px');
      width: calc(100vw - v-bind(sidebarWidth + 'px'));
      transition: margin-left 0.3s;
      
      .page-container {
        padding: 16px;
        height: 100vh;
        overflow: auto;
        
        &.with-tabs {
          height: calc(100vh - 40px);
        }
      }
    }
  }
  
  // 组合模式
  &.mode-combined {
    .combined-layout {
      width: 100vw;
      height: 100vh;
      
      .top-section {
        position: fixed;
        top: 0;
        z-index: 100;
      }
      
      .side-section {
        position: fixed;
        top: 64px;
        left: 0;
        height: calc(100vh - 64px);
        z-index: 90;
        transition: width 0.3s;
        background-color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .main-content-combined {
        transition: margin 0.3s;
        
        .page-container {
          padding: 16px;
          height: calc(100vh - 64px);
          overflow: auto;
          
          &.with-tabs {
            height: calc(100vh - 104px);
          }
        }
      }
    }
  }
  
  // 迷你侧边模式
  &.mode-compact {
    .compact-layout {
      width: 100vw;
      height: 100vh;
      
      .mini-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 64px;
        height: 100vh;
        background-color: #001529;
        z-index: 100;
        transition: width 0.3s;
        display: flex;
        flex-direction: column;
        
        &.expanded {
          width: 64px;
        }
        
        .logo-container {
          height: 64px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          
          .logo {
            width: 32px;
            height: 32px;
            cursor: pointer;
          }
        }
        
        .menu-icons {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
          
          .menu-icon-item {
            height: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.65);
            transition: all 0.3s;
            
            &:hover {
              color: #fff;
              background-color: rgba(255, 255, 255, 0.1);
            }
            
            &.active {
              color: #fff;
              background-color: var(--el-color-primary);
            }
            
            .icon-wrapper {
              font-size: 18px;
            }
          }
        }
        
        .toggle-button {
          height: 48px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          
          &:hover {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
      }
      
      .expanded-submenu {
        position: fixed;
        top: 0;
        height: 100vh;
        width: 240px;
        background-color: #fff;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        z-index: 90;
        transition: left 0.3s;
        
        .submenu-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          font-size: 16px;
          font-weight: 500;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .submenu-list {
          border-right: none;
        }
      }
      
      .top-toolbar {
        position: fixed;
        top: 0;
        left: 304px;
        right: 0;
        height: 64px;
        background-color: #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        z-index: 80;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;
        
        .breadcrumb-section, .tools-section {
          display: flex;
          align-items: center;
        }
        
        .tools-section {
          gap: 16px;
        }
      }
      
      .main-content-compact {
        padding-top: 64px;
        margin-left: 304px;
        
        .page-container {
          padding: 16px;
          height: calc(100vh - 64px);
          overflow: auto;
          
          &.with-tabs {
            height: calc(100vh - 104px);
          }
        }
      }
    }
  }
}

// 暗黑模式支持
.dark {
  .modern-layout {
    background-color: #1f1f1f;
    
    .side-section, 
    .expanded-submenu, 
    .top-toolbar {
      background-color: #262626;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .mini-sidebar {
      background-color: #141414;
      
      .menu-icon-item {
        &:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
      }
    }
    
    .expanded-submenu {
      .submenu-header {
        border-bottom-color: #303030;
      }
    }
  }
}
</style>
