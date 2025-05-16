<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" @click="clearExpiredJwt">清理过期JWT</el-button>
        <el-button type="danger" @click="handleDeleteSelected" :disabled="!multipleSelection.length">删除选中</el-button>
      </div>
      <el-table
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="jwt" label="JWT令牌" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-popconfirm title="确定要删除此JWT记录吗?" @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button link type="primary" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJwtBlacklist, deleteJwt, deleteJwtsByIds, cleanupExpiredJwt } from '@/api/jwt'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref([])

// 获取JWT黑名单数据
const getTableData = async () => {
  loading.value = true
  try {
    const res = await getJwtBlacklist({
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取JWT黑名单失败:', error)
    ElMessage.error('获取JWT黑名单失败')
  } finally {
    loading.value = false
  }
}

// 清理过期JWT
const clearExpiredJwt = async () => {
  ElMessageBox.confirm('确定要清理所有过期的JWT令牌吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      const res = await cleanupExpiredJwt()
      if (res.code === 0) {
        ElMessage.success('清理成功')
        getTableData()
      } else {
        ElMessage.error(res.message || '清理失败')
      }
    } catch (error) {
      console.error('清理过期JWT失败:', error)
      ElMessage.error('清理过期JWT失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消操作
  })
}

// 删除单个JWT
const handleDelete = async (row) => {
  loading.value = true
  try {
    const res = await deleteJwt({ id: row.id })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      if (tableData.value.length === 1 && page.value > 1) {
        page.value--
      }
      getTableData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除JWT失败:', error)
    ElMessage.error('删除JWT失败')
  } finally {
    loading.value = false
  }
}

// 处理多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 删除选中JWT
const handleDeleteSelected = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的${multipleSelection.value.length}条记录吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      const ids = multipleSelection.value.map(item => item.id)
      const res = await deleteJwtsByIds({ ids })
      if (res.code === 0) {
        ElMessage.success('批量删除成功')
        if (tableData.value.length === ids.length && page.value > 1) {
          page.value--
        }
        getTableData()
      } else {
        ElMessage.error(res.message || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除JWT失败:', error)
      ElMessage.error('批量删除JWT失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消操作
  })
}

// 翻页
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 修改每页数量
const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  getTableData()
}

onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.gva-table-box {
  padding: 24px;
  background-color: #fff;
  border-radius: 2px;
}
.gva-btn-list {
  margin-bottom: 12px;
}
.gva-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style> 