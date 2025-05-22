<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="申请类型">
          <el-select v-model="searchInfo.applicationType" clearable placeholder="请选择">
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
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchInfo.name" placeholder="请输入姓名" />
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
        <el-table-column label="申请类型" min-width="120" prop="applicationType" />
        <el-table-column label="姓名" min-width="120" prop="name" />
        <el-table-column label="性别" min-width="80" prop="gender" />
        <el-table-column label="学历" min-width="100" prop="education" />
        <el-table-column label="职业" min-width="120" prop="occupation" />
        <el-table-column label="申请状态" min-width="100">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'approved'
                  ? 'success'
                  : scope.row.status === 'rejected'
                  ? 'danger'
                  : 'warning'
              "
            >
              {{ 
                scope.row.status === 'approved' 
                  ? '已通过' 
                  : scope.row.status === 'rejected' 
                  ? '已拒绝' 
                  : '待审核' 
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" min-width="160" prop="CreatedAt" sortable="custom" />
        <el-table-column label="操作" min-width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              link
              @click="updateStatus(scope.row.ID, 'approved')"
            >
              通过
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="danger"
              link
              @click="updateStatus(scope.row.ID, 'rejected')"
            >
              拒绝
            </el-button>
            <el-button type="danger" link @click="deleteRow(scope.row)">删除</el-button>
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
    <el-dialog v-model="detailDialogVisible" title="申请详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请类型">{{ detailData.applicationType }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag
            :type="
              detailData.status === 'approved'
                ? 'success'
                : detailData.status === 'rejected'
                ? 'danger'
                : 'warning'
            "
          >
            {{ 
              detailData.status === 'approved' 
                ? '已通过' 
                : detailData.status === 'rejected' 
                ? '已拒绝' 
                : '待审核' 
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ detailData.gender }}</el-descriptions-item>
        <el-descriptions-item label="出生地点">{{ detailData.birthplace }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ detailData.education }}</el-descriptions-item>
        <el-descriptions-item label="职业">{{ detailData.occupation }}</el-descriptions-item>
        <el-descriptions-item label="工作岗位">{{ detailData.workPosition }}</el-descriptions-item>
        <el-descriptions-item label="工作地点">{{ detailData.workPlace }}</el-descriptions-item>
        <el-descriptions-item label="爱好">{{ detailData.hobby }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ detailData.address }}</el-descriptions-item>
        <el-descriptions-item label="联系方式" :span="2">
          {{ detailData.contactType }}: {{ detailData.contactValue }}
        </el-descriptions-item>
        <el-descriptions-item label="个人简介" :span="2">
          {{ detailData.description }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">
          {{ detailData.CreatedAt }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.status === 'approved'" label="审批时间" :span="2">
          {{ detailData.approvedAt }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="detailData.status === 'pending'"
            type="success"
            @click="updateStatus(detailData.ID, 'approved', true)"
          >
            通过
          </el-button>
          <el-button
            v-if="detailData.status === 'pending'"
            type="danger"
            @click="updateStatus(detailData.ID, 'rejected', true)"
          >
            拒绝
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SimilarApplicationList',
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSimilarApplicationList,
  getSimilarApplication,
  deleteSimilarApplication,
  updateSimilarApplicationStatus,
  getSimilarCategories,
} from '@/api/community/similar'

// 表格数据
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchInfo = reactive({
  applicationType: '',
  status: '',
  name: '',
  keyword: '',
  startTime: '',
  endTime: '',
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

// 获取申请列表
const getTableData = async () => {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo,
  }
  try {
    const res = await getSimilarApplicationList(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    console.error('获取申请列表失败', err)
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
const viewDetail = async (row) => {
  try {
    const res = await getSimilarApplication({ id: row.ID })
    if (res.code === 0) {
      detailData.value = res.data
      detailDialogVisible.value = true
    }
  } catch (err) {
    console.error('获取申请详情失败', err)
  }
}

// 更新状态
const updateStatus = async (id, status, closeDialog = false) => {
  try {
    const res = await updateSimilarApplicationStatus({ id, status })
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

// 删除行
const deleteRow = (row) => {
  ElMessageBox.confirm('确定要删除这条申请记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteSimilarApplication({ id: row.ID })
        if (res.code === 0) {
          ElMessage.success('删除成功')
          if (tableData.value.length === 1 && page.value > 1) {
            page.value--
          }
          getTableData()
        }
      } catch (err) {
        console.error('删除失败', err)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
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
