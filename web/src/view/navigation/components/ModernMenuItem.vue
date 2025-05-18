<template>
  <el-sub-menu v-if="hasChildren(item)" :index="resolvePath(item.name)">
    <template #title>
      <el-icon v-if="item.meta && item.meta.icon" class="menu-icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <icon-svg v-else-if="item.meta && item.meta.svgIcon" class="menu-icon" :name="item.meta.svgIcon" />
      <span>{{ generateTitle(item) }}</span>
    </template>
    
    <template v-for="child in visibleChildren" :key="child.name">
      <modern-menu-item
        v-if="hasChildren(child)"
        :item="child"
        :base-path="resolvePath(item.path)"
      />
      
      <el-menu-item v-else :index="child.name" >
        <el-icon v-if="child.meta && child.meta.icon" class="menu-icon">
          <component :is="child.meta.icon" />
        </el-icon>
        <icon-svg v-else-if="child.meta && child.meta.svgIcon" class="menu-icon" :name="child.meta.svgIcon" />
        <template #title>{{ generateTitle(child) }}</template>
      </el-menu-item>
    </template>
  </el-sub-menu>
  
  <el-menu-item v-else :index="item.name">
    <el-icon v-if="item.meta && item.meta.icon" class="menu-icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <icon-svg v-else-if="item.meta && item.meta.svgIcon" class="menu-icon" :name="item.meta.svgIcon" />
    <template #title>{{ generateTitle(item) }}</template>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IconSvg from '@/components/svgIcon/svgIcon.vue'

defineOptions({
  name: 'ModernMenuItem'
})

// 定义属性
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const { t } = useI18n()

// 获取可见子项
const visibleChildren = computed(() => {
  return props.item.children?.filter(item => !item.hidden) || []
})

// 检查是否有子菜单
const hasChildren = (item) => {
  return item.children && item.children.filter(child => !child.hidden).length > 0
}

// 解析路径
const resolvePath = (path) => {
  if (path.startsWith('/') || path.startsWith('http')) {
    return path
  }
  return props.basePath ? `${props.basePath}/${path}` : path
}

// 生成标题
const generateTitle = (item) => {
  if (!item.meta) return item.name || '未命名'
  
  const title = item.meta.title
  if (!title) return item.name || '未命名'
  
  // 直接返回标题，不处理国际化
  return title
}
</script>

<style lang="scss" scoped>
.menu-icon {
  margin-right: 8px;
  width: 1em;
  height: 1em;
}

:deep(.el-menu-item) {
  &.is-active {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 500;
    
    .menu-icon {
      color: var(--el-color-primary);
    }
  }
}

:deep(.dark) {
  .el-menu-item.is-active {
    background-color: var(--el-color-primary-bg);
  }
}
</style>
