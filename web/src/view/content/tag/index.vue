<template>
  <div class="tag-management-container">
    <el-card class="table-card">
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="标签名称">
            <el-input v-model="searchForm.name" placeholder="请输入标签名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="action-area">
        <el-button type="primary" @click="openAddDialog">新增标签</el-button>
        <el-button type="warning" @click="handleBatchDelete" :disabled="!hasSelection">批量删除</el-button>
      </div>

      <el-table 
        :data="tableData" 
        v-loading="loading" 
        border 
        style="width: 100%"
        :header-cell-style="{ background: '#f8f8f9', color: '#606266' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="标签名称" />
        <el-table-column label="标签颜色" width="120" align="center">
          <template #default="scope">
            <el-tag
              :color="scope.row.color"
              style="color: #ffffff; border: none; min-width: 60px; text-align: center;"
            >
              {{ scope.row.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="article_count" label="文章数量" width="100" align="center" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑标签对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑标签' : '新增标签'" 
      width="500px"
      destroy-on-close
    >
      <el-form 
        ref="tagFormRef" 
        :model="tagForm" 
        :rules="tagRules" 
        label-width="100px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="tagForm.color" />
          <span style="margin-left: 10px;">{{ tagForm.color }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref([])

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const tagFormRef = ref(null)
const tagForm = reactive({
  id: null,
  name: '',
  color: '#409EFF'
})
const tagRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择标签颜色', trigger: 'change' }
  ]
}

// 计算属性
const hasSelection = computed(() => multipleSelection.value.length > 0)

// 加载标签数据
const loadTags = async () => {
  loading.value = true
  try {
    // 实际项目中应调用API获取标签列表
    // const res = await getTagList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   ...searchForm
    // })
    
    // 模拟数据
    setTimeout(() => {
      // 常用颜色数组
      const colors = [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
        '#1E88E5', '#13CE66', '#FF9F00', '#FF5252', '#35495E',
        '#7367F0', '#32CCBC', '#F7B84B', '#F87B62', '#777777'
      ]
      
      const mockData = Array.from({ length: 10 }, (_, index) => ({
        id: 100 + index,
        name: `标签${index + 1}`,
        color: colors[index % colors.length],
        article_count: Math.floor(Math.random() * 30),
        created_at: '2023-05-18 12:00:00'
      }))
      
      tableData.value = mockData
      total.value = 100
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取标签列表失败', error)
    ElMessage.error('获取标签列表失败')
    loading.value = false
  }
}

// 表单操作
const handleSearch = () => {
  currentPage.value = 1
  loadTags()
}

const resetForm = () => {
  searchForm.name = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadTags()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadTags()
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(tagForm, {
    id: null,
    name: '',
    color: '#409EFF'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(tagForm, {
    id: row.id,
    name: row.name,
    color: row.color
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!tagFormRef.value) return
  
  try {
    await tagFormRef.value.validate()
    
    // 实际项目中应调用API保存标签
    if (isEdit.value) {
      // await updateTag(tagForm)
      ElMessage.success('更新标签成功')
    } else {
      // await createTag(tagForm)
      ElMessage.success('创建标签成功')
    }
    
    dialogVisible.value = false
    loadTags()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除标签"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中应调用API删除标签
    // await deleteTag(row.id)
    
    ElMessage.success('删除标签成功')
    loadTags()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败', error)
      ElMessage.error('删除标签失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${multipleSelection.value.length} 个标签吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 获取选中标签的ID
    const ids = multipleSelection.value.map(item => item.id)
    
    // 实际项目中应调用API批量删除标签
    // await batchDeleteTags(ids)
    
    ElMessage.success('批量删除标签成功')
    loadTags()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除标签失败', error)
      ElMessage.error('批量删除标签失败')
    }
  }
}

// 生命周期钩子
onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tag-management-container {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.action-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
