<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="圈子类型">
          <el-select v-model="searchInfo.circleType" clearable placeholder="请选择">
            <el-option
              v-for="item in similarCategories"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" clearable placeholder="请选择">
            <el-option label="活跃" value="active" />
            <el-option label="关闭" value="closed" />
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
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        row-key="ID"
        @sort-change="sortChange"
      >
        <el-table-column label="ID" min-width="180" prop="ID" sortable="custom" />
        <el-table-column label="圈子类型" min-width="120" prop="circleType" />
        <el-table-column label="圈子名称" min-width="120" prop="name" />
        <el-table-column label="成员数量" min-width="100" prop="memberCount" sortable="custom" />
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '活跃' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160" prop="CreatedAt" sortable="custom" />
        <el-table-column label="操作" min-width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">查看</el-button>
            <el-button type="primary" link @click="viewMembers(scope.row)">成员</el-button>
            <el-button
              v-if="scope.row.status === 'active'"
              type="warning"
              link
              @click="updateStatus(scope.row, 'closed')"
            >
              关闭
            </el-button>
            <el-button
              v-else
              type="success"
              link
              @click="updateStatus(scope.row, 'active')"
            >
              开启
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
    <el-dialog v-model="detailDialogVisible" title="圈子详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="圈子类型">{{ detailData.circleType }}</el-descriptions-item>
        <el-descriptions-item label="圈子名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="成员数量">{{ detailData.memberCount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 'active' ? 'success' : 'danger'">
            {{ detailData.status === 'active' ? '活跃' : '关闭' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建者">{{ detailData.creator?.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.CreatedAt }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ detailData.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="detailData.status === 'active'"
            type="warning"
            @click="updateStatus(detailData, 'closed', true)"
          >
            关闭圈子
          </el-button>
          <el-button
            v-else
            type="success"
            @click="updateStatus(detailData, 'active', true)"
          >
            开启圈子
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SimilarCircleList',
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  getSimilarCircles,
  updateSimilarCircleStatus,
  getSimilarCategories,
} from '@/api/community/similar'

const router = useRouter()

// 表格数据
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchInfo = reactive({
  circleType: '',
  status: '',
  keyword: '',
  sort: '',
  order: '',
})
const similarCategories = ref([])

// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = ref({})

// 获取类别列表
const getSimilarCategoriesList = async () => {
  try {
    const res = await getSimilarCategories()
    if (res.code === 0) {
      similarCategories.value = res.data
    }
  } catch (err) {
    console.error('获取类别列表失败', err)
  }
}

// 获取圈子列表
const getTableData = async () => {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo,
  }
  try {
    const res = await getSimilarCircles(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    console.error('获取圈子列表失败', err)
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
    searchInfo[key] = ''
  })
  getTableData()
}

// 刷新表格
const refreshTable = () => {
  getTableData()
}

// 查看详情
const viewDetail = (row) => {
  detailData.value = row
  detailDialogVisible.value = true
}

// 查看成员
const viewMembers = (row) => {
  router.push({
    name: 'similarCircleMembers',
    query: { circleId: row.ID, circleName: row.name }
  })
}

// 更新状态
const updateStatus = async (row, status, closeDialog = false) => {
  try {
    const res = await updateSimilarCircleStatus({ id: row.ID, status })
    if (res.code === 0) {
      ElMessage.success('状态更新成功')
      if (closeDialog) {
        detailDialogVisible.value = false
      }
      getTableData()
    }
  } catch (err) {
    console.error('更新状态失败', err)
    ElMessage.error('更新状态失败')
  }
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
  getSimilarCategoriesList()
  getTableData()
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
