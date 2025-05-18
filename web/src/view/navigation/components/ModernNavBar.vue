<template>
  <div class="modern-nav-container">
    <!-- 主导航区域 -->
    <div class="main-nav-area" :class="{ 'collapsed': isCollapsed }">
      <!-- Logo和系统名称 -->
      <div class="logo-area" @click="goHome">
        <img :src="$GIN_VUE_ADMIN.appLogo" alt="系统Logo" class="logo" />
        <span v-if="!isCollapsed && !isMobile" class="app-name">{{ $GIN_VUE_ADMIN.appName }}</span>
      </div>
      
      <!-- 菜单项区域 -->
      <div class="menu-area">
        <el-scrollbar>
          <el-menu
            :collapse="isCollapsed"
            :default-active="activeMenu"
            :collapse-transition="false"
            class="modern-menu"
            :mode="menuMode"
            unique-opened
            @select="handleMenuSelect"
          >
            <template v-for="item in menuItems" :key="item.name">
              <modern-menu-item
                v-if="!item.hidden"
                :item="item"
                :base-path="item.path"
              />
            </template>
          </el-menu>
        </el-scrollbar>
      </div>
      
      <!-- 底部导航收起按钮 - 仅适用于侧边栏模式 -->
      <div v-if="showCollapseButton" class="collapse-button" @click="toggleCollapse">
        <el-icon v-if="!isCollapsed"><DArrowLeft /></el-icon>
        <el-icon v-else><DArrowRight /></el-icon>
      </div>
    </div>
    
    <!-- 头部工具栏区域 -->
    <div class="top-toolbar" v-if="showTopBar">
      <div class="left-area">
        <!-- 面包屑导航 -->
        <el-breadcrumb v-if="showBreadcrumb" separator="/">
          <el-breadcrumb-item
            v-for="item in breadcrumbItems"
            :key="item.path"
          >
            {{ fmtTitle(item.meta.title, route) }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <!-- 右侧工具和用户信息 -->
      <div class="right-area">
        <slot name="tools"></slot>
        
        <!-- 用户信息和下拉菜单 -->
        <el-dropdown class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span v-if="!isMobile" class="user-name">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="role-text">
                <span>当前角色：{{ userRole }}</span>
              </el-dropdown-item>
              
              <!-- 角色切换选项 -->
              <template v-if="userAuthorities && userAuthorities.length > 0">
                <el-dropdown-item
                  v-for="item in userAuthorities"
                  :key="item.authorityId"
                  @click="switchRole(item.authorityId)"
                >
                  <span>切换为：{{ item.authorityName }}</span>
                </el-dropdown-item>
              </template>
              
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRouterStore } from '@/pinia/modules/router'
import { useUserStore } from '@/pinia/modules/user'
import { useAppStore } from '@/pinia'
import { storeToRefs } from 'pinia'
import { fmtTitle } from '@/utils/fmtRouterTitle'
import { setUserAuthority } from '@/api/user'
import ModernMenuItem from './ModernMenuItem.vue'

// 定义组件接收的属性
const props = defineProps({
  // 导航模式: 'vertical', 'horizontal', 'combined'
  mode: {
    type: String,
    default: 'vertical'
  },
  // 是否固定顶部
  fixedHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示面包屑
  showBreadcrumb: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['collapse-change'])

// 获取路由和store
const route = useRoute()
const router = useRouter()
const routerStore = useRouterStore()
const userStore = useUserStore()
const appStore = useAppStore()
const { device, config } = storeToRefs(appStore)

// 响应式状态
const isCollapsed = ref(false)
const activeMenu = ref('')

// 计算属性
const isMobile = computed(() => device.value === 'mobile')
const menuMode = computed(() => props.mode === 'horizontal' ? 'horizontal' : 'vertical')
const menuItems = computed(() => routerStore.asyncRouters[0]?.children || [])

const showCollapseButton = computed(() => {
  return props.mode === 'vertical' && !isMobile.value
})

const showTopBar = computed(() => {
  return props.fixedHeader || props.mode === 'horizontal' || props.mode === 'combined'
})

// 用户相关信息
const userName = computed(() => userStore.userInfo.nickName || '用户')
const userRole = computed(() => userStore.userInfo.authority?.authorityName || '普通用户')
const userAvatar = computed(() => userStore.userInfo.headerImg || '')
const userAuthorities = computed(() => {
  return userStore.userInfo.authorities?.filter(
    auth => auth.authorityId !== userStore.userInfo.authorityId
  ) || []
})

// 面包屑导航项
const breadcrumbItems = computed(() => route.matched?.slice(1) || [])

// 监听路由变化，更新激活的菜单项
watch(() => route.name, (newVal) => {
  if (route.name === 'Iframe') {
    activeMenu.value = decodeURIComponent(route.query.url)
  } else {
    activeMenu.value = route.meta.activeName || route.name
  }
})

// 监听设备变化，在移动设备上自动折叠菜单
watch(() => device.value, (newVal) => {
  isCollapsed.value = newVal === 'mobile'
  emit('collapse-change', isCollapsed.value)
})

// 方法
const goHome = () => {
  router.push({ path: '/dashboard' })
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  emit('collapse-change', isCollapsed.value)
}

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

// 生命周期钩子
onMounted(() => {
  // 初始化激活菜单
  if (route.name === 'Iframe') {
    activeMenu.value = decodeURIComponent(route.query.url)
  } else {
    activeMenu.value = route.meta.activeName || route.name
  }
})
</script>

<style lang="scss" scoped>
.modern-nav-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .main-nav-area {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    height: 100%;
    transition: width 0.3s;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    width: v-bind("isCollapsed ? '64px' : '240px'");
    overflow: hidden;
    
    &.collapsed {
      width: 64px;
    }
    
    .logo-area {
      display: flex;
      align-items: center;
      padding: 16px;
      cursor: pointer;
      height: 64px;
      
      .logo {
        width: 32px;
        height: 32px;
        border-radius: 4px;
      }
      
      .app-name {
        margin-left: 12px;
        font-size: 18px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .menu-area {
      flex: 1;
      overflow: hidden;
      
      .modern-menu {
        border-right: none;
      }
    }
    
    .collapse-button {
      position: absolute;
      bottom: 20px;
      right: 15px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background-color: var(--el-color-primary-light-8);
      }
    }
  }
  
  .top-toolbar {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
    
    .left-area, .right-area {
      display: flex;
      align-items: center;
    }
    
    .right-area {
      gap: 16px;
    }
    
    .user-dropdown {
      cursor: pointer;
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .user-name {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

// 暗黑模式支持
:deep(.dark) {
  .modern-nav-container {
    .main-nav-area {
      background-color: var(--el-bg-color);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }
    
    .top-toolbar {
      background-color: var(--el-bg-color);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }
    
    .collapse-button {
      background-color: var(--el-color-primary-bg);
    }
  }
}
</style>
