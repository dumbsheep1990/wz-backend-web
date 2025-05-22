<template>
  <div>
    <div class="circle-info">
      <h4>圈子：{{ circleName }}</h4>
    </div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="角色">
          <el-select v-model="searchInfo.role" clearable placeholder="请选择">
            <el-option label="管理员" value="admin" />
            <el-option label="成员" value="member" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" clearable placeholder="请选择">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchInfo.keyword" placeholder="搜索关键词" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" @click="refreshTable">刷新</el-button>
        <el-button type="primary" @click="goBack">返回圈子列表</el-button>
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        row-key="ID"
        @sort-change="sortChange"
      >
        <el-table-column label="ID" min-width="180" prop="ID" />
        <el-table-column label="用户ID" min-width="180" prop="userID" />
        <el-table-column label="用户名" min-width="120">
          <template #default="scope">
            {{ scope.row.user?.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="昵称" min-width="120">
          <template #default="scope">
            {{ scope.row.user?.nickName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'">
              {{ scope.row.role === 'admin' ? '管理员' : '成员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后活跃时间" min-width="160" prop="lastActiveAt" sortable="custom" />
        <el-table-column label="加入时间" min-width="160" prop="joinedAt" sortable="custom" />
        <el-table-column label="操作" min-width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.role !== 'admin'"
              type="success"
              link
              @click="updateMemberRole(scope.row.ID, 'admin')"
            >
              设为管理员
            </el-button>
            <el-button
              v-else
              type="info"
              link
              @click="updateMemberRole(scope.row.ID, 'member')"
            >
              设为普通成员
            </el-button>
            <el-button
              v-if="scope.row.status === 'active'"
              type="danger"
              link
              @click="updateMemberStatus(scope.row.ID, 'banned')"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              link
              @click="updateMemberStatus(scope.row.ID, 'active')"
            >
              启用
            </el-button>
            <el-button
              type="danger"
              link
              @click="removeMember(scope.row.ID)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="成员详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ detailData.userID }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailData.user?.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detailData.user?.nickName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="detailData.role === 'admin' ? 'danger' : 'info'">
            {{ detailData.role === 'admin' ? '管理员' : '成员' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 'active' ? 'success' : 'danger'">
            {{ detailData.status === 'active' ? '活跃' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="加入时间">{{ detailData.joinedAt }}</el-descriptions-item>
        <el-descriptions-item label="最后活跃时间">{{ detailData.lastActiveAt }}</el-descriptions-item>
        <el-descriptions-item v-if="detailData.application" label="申请类型">
          {{ detailData.application.applicationType }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.application" label="姓名">
          {{ detailData.application.name }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.application" label="联系方式" :span="2">
          {{ detailData.application.contactType }}: {{ detailData.application.contactValue }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SimilarCircleMembers',
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import {
  getSimilarCircleMembers,
  updateMemberRole,
  updateMemberStatus,
  removeMember,
} from '@/api/community/similar'

const router = useRouter()
const route = useRoute()

// 圈子信息
const circleId = ref('')
const circleName = ref('')

// 表格数据
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchInfo = reactive({
  circleID: '',
  role: '',
  status: '',
  keyword: '',
  sort: '',
  order: '',
})

// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = ref({})

// 获取圈子成员列表
const getTableData = async () => {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    circleID: circleId.value,
    ...searchInfo,
  }
  try {
    const res = await getSimilarCircleMembers(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    console.error('获取圈子成员列表失败', err)
  }
}

// 查询
const onSubmit = () => {
  page.value = 1
  getTableData()
}

// 重置搜索表单
const resetSearchForm = () => {
  Object.keys(searchInfo).forEach(key => {
    if (key !== 'circleID') {
      searchInfo[key] = ''
    }
  })
  getTableData()
}

// 刷新表格
const refreshTable = () => {
  getTableData()
}

// 返回圈子列表
const goBack = () => {
  router.push({ name: 'similarCircleList' })
}

// 查看详情
const viewDetail = (row) => {
  detailData.value = row
  detailDialogVisible.value = true
}

// 更新角色
const updateMemberRole = async (id, role) => {
  try {
    const res = await updateMemberRole({ id, role })
    if (res.code === 0) {
      ElMessage.success('角色更新成功')
      getTableData()
    }
  } catch (err) {
    console.error('更新角色失败', err)
    ElMessage.error('更新角色失败')
  }
}

// 更新状态
const updateMemberStatus = async (id, status) => {
  try {
    const res = await updateMemberStatus({ id, status })
    if (res.code === 0) {
      ElMessage.success('状态更新成功')
      getTableData()
    }
  } catch (err) {
    console.error('更新状态失败', err)
    ElMessage.error('更新状态失败')
  }
}

// 移除成员
const removeMember = (id) => {
  ElMessageBox.confirm('确定要移除该成员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await removeMember({ id })
        if (res.code === 0) {
          ElMessage.success('移除成员成功')
          getTableData()
        }
      } catch (err) {
        console.error('移除成员失败', err)
        ElMessage.error('移除成员失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 处理排序
const sortChange = ({ prop, order }) => {
  if (prop) {
    searchInfo.sort = prop
    searchInfo.order = order === 'ascending' ? 'asc' : 'desc'
  } else {
    searchInfo.sort = ''
    searchInfo.order = ''
  }
  getTableData()
}

onMounted(() => {
  // 获取路由参数
  circleId.value = route.query.circleId
  circleName.value = route.query.circleName
  
  if (!circleId.value) {
    ElMessage.error('缺少圈子ID参数')
    router.push({ name: 'similarCircleList' })
    return
  }
  
  searchInfo.circleID = circleId.value
  getTableData()
})
</script>

<style scoped>
.circle-info {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 4px solid #67c23a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
