<template>
  <div>
    <div class="gva-form-box">
      <el-card class="box-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-button link type="primary" @click="goBack">返回</el-button>
          </div>
        </template>
        <div class="user-info" v-loading="loading">
          <div class="user-info-header">
            <el-avatar :size="80" :src="userInfo.headerImg"></el-avatar>
            <div class="user-info-title">
              <h2>{{ userInfo.nickName }}</h2>
              <p>{{ userInfo.userName }}</p>
            </div>
          </div>
          <el-divider />
          <el-descriptions title="详细信息" :column="2" border>
            <el-descriptions-item label="用户ID">{{ userInfo.ID }}</el-descriptions-item>
            <el-descriptions-item label="UUID">{{ userInfo.uuid }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ userInfo.userName }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userInfo.nickName }}</el-descriptions-item>
            <el-descriptions-item label="电子邮箱">{{ userInfo.email || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="手机号码">{{ userInfo.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="用户状态">
              <el-tag :type="userInfo.enable === 1 ? 'success' : 'danger'">
                {{ userInfo.enable === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(userInfo.CreatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ formatDate(userInfo.LastLoginAt) }}</el-descriptions-item>
            <el-descriptions-item label="主题设置">
              <div class="theme-info">
                <div class="theme-item">
                  <span>侧边栏模式: </span>
                  <span>{{ userInfo.sideMode }}</span>
                </div>
                <div class="theme-item">
                  <span>主题颜色: </span>
                  <div class="color-block" :style="{ backgroundColor: userInfo.activeColor }"></div>
                </div>
                <div class="theme-item">
                  <span>基础颜色: </span>
                  <div class="color-block" :style="{ backgroundColor: userInfo.baseColor }"></div>
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <el-card class="box-card" shadow="hover" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <span>权限信息</span>
          </div>
        </template>
        <div class="authority-info" v-loading="authLoading">
          <el-descriptions title="角色权限" :column="1" border>
            <el-descriptions-item label="当前角色">
              <el-tag v-for="auth in userInfo.authorities" :key="auth.authorityId" style="margin-right: 10px;">
                {{ auth.authorityName }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="默认路由">
              <span v-if="userInfo.authorities && userInfo.authorities.length">
                {{ userInfo.authorities[0].defaultRouter }}
              </span>
            </el-descriptions-item>
          </el-descriptions>

          <div class="authority-menus" v-if="menus.length">
            <h3>菜单权限</h3>
            <el-tree
              :data="menus"
              :props="{ label: 'title', children: 'children' }"
              default-expand-all
              node-key="ID"
              show-checkbox
              :default-checked-keys="checkedMenus"
              :check-strictly="true"
              disabled
            ></el-tree>
          </div>
        </div>
      </el-card>

      <el-card class="box-card" shadow="hover" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <span>操作记录</span>
          </div>
        </template>
        <div class="operation-logs" v-loading="logLoading">
          <el-table :data="logs" style="width: 100%">
            <el-table-column prop="method" label="请求方法" width="100"></el-table-column>
            <el-table-column prop="path" label="请求路径" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态码" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status >= 200 && scope.row.status < 300 ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
            <el-table-column prop="latency" label="响应时间" width="100">
              <template #default="scope">
                {{ Math.floor(scope.row.latency / 1000000) }}ms
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="操作时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="logPage"
              v-model:page-size="logPageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="logTotal"
              @size-change="getOperationLogs"
              @current-change="getOperationLogs"
            />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '@/api/user'
import { getMenuAuthority } from '@/api/menu'
import { getOperationRecordList } from '@/api/sysOperationRecord'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const authLoading = ref(false)
const logLoading = ref(false)
const userInfo = ref({})
const menus = ref([])
const checkedMenus = ref([])
const logs = ref([])
const logPage = ref(1)
const logPageSize = ref(10)
const logTotal = ref(0)

// 获取用户详情
const getUserDetail = async () => {
  loading.value = true
  try {
    const userId = route.query.id
    const res = await getUserInfo({ id: userId })
    if (res.code === 0) {
      userInfo.value = res.data
      // 获取菜单权限
      if (userInfo.value.authorities && userInfo.value.authorities.length > 0) {
        getAuthorityMenu(userInfo.value.authorities[0].authorityId)
      }
      // 获取操作记录
      getOperationLogs()
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 获取角色的菜单权限
const getAuthorityMenu = async (authorityId) => {
  authLoading.value = true
  try {
    const res = await getMenuAuthority({ authorityId })
    if (res.code === 0) {
      menus.value = res.data.menus
      // 提取菜单ID作为选中节点
      checkedMenus.value = extractMenuIds(menus.value)
    }
  } catch (error) {
    console.error('获取菜单权限失败:', error)
    ElMessage.error('获取菜单权限失败')
  } finally {
    authLoading.value = false
  }
}

// 提取菜单ID
const extractMenuIds = (menuItems) => {
  let ids = []
  const extract = (items) => {
    items.forEach(item => {
      ids.push(item.ID)
      if (item.children && item.children.length > 0) {
        extract(item.children)
      }
    })
  }
  extract(menuItems)
  return ids
}

// 获取操作记录
const getOperationLogs = async () => {
  logLoading.value = true
  try {
    const userId = route.query.id
    const res = await getOperationRecordList({
      page: logPage.value,
      pageSize: logPageSize.value,
      userId
    })
    if (res.code === 0) {
      logs.value = res.data.list
      logTotal.value = res.data.total
    }
  } catch (error) {
    console.error('获取操作记录失败:', error)
    ElMessage.error('获取操作记录失败')
  } finally {
    logLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '暂无数据'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  getUserDetail()
})
</script>

<style scoped>
.gva-form-box {
  padding: 24px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.user-info-title {
  margin-left: 20px;
}
.user-info-title h2 {
  margin: 0 0 5px 0;
}
.user-info-title p {
  margin: 0;
  color: #909399;
}
.theme-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.theme-item {
  display: flex;
  align-items: center;
}
.color-block {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-left: 5px;
}
.authority-menus {
  margin-top: 20px;
}
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style> 