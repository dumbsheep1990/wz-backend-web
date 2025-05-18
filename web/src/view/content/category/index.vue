<template>
  <div class="category-management-container">
    <el-card class="table-card">
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="分类名称">
            <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="action-area">
        <el-button type="primary" @click="openAddDialog">新增分类</el-button>
      </div>

      <el-table 
        :data="tableData" 
        v-loading="loading" 
        border 
        style="width: 100%"
        :header-cell-style="{ background: '#f8f8f9', color: '#606266' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="article_count" label="文章数量" width="100" align="center" />
        <el-table-column prop="parent_name" label="父级分类" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
              :disabled="scope.row.article_count > 0"
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

    <!-- 新增/编辑分类对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑分类' : '新增分类'" 
      width="500px"
      destroy-on-close
    >
      <el-form 
        ref="categoryFormRef" 
        :model="categoryForm" 
        :rules="categoryRules" 
        label-width="100px"
      >
        <el-form-item label="父级分类">
          <el-cascader
            v-model="categoryForm.parent_id"
            :options="categoryOptions"
            :props="{
              value: 'id',
              label: 'name',
              emitPath: false,
              checkStrictly: true
            }"
            placeholder="请选择父级分类，顶级分类不选"
            clearable
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            rows="3"
            placeholder="请输入分类描述" 
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="categoryForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const categoryFormRef = ref(null)
const categoryForm = reactive({
  id: null,
  parent_id: null,
  name: '',
  description: '',
  sort: 0,
  status: 'active'
})
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 分类选项
const categoryOptions = ref([])

// 加载分类数据
const loadCategories = async () => {
  loading.value = true
  try {
    // 实际项目中应调用API获取分类列表
    // const res = await getCategoryList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   ...searchForm
    // })
    
    // 模拟数据
    setTimeout(() => {
      const mockData = Array.from({ length: 10 }, (_, index) => ({
        id: 100 + index,
        name: `分类${index + 1}`,
        description: `这是分类${index + 1}的描述文本`,
        sort: index * 10,
        article_count: Math.floor(Math.random() * 20),
        parent_id: index > 3 ? 100 + Math.floor(Math.random() * 3) : null,
        parent_name: index > 3 ? `分类${Math.floor(Math.random() * 3) + 1}` : null,
        status: index % 3 === 0 ? 'inactive' : 'active',
        created_at: '2023-05-18 12:00:00'
      }))
      
      tableData.value = mockData
      total.value = 100
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取分类列表失败', error)
    ElMessage.error('获取分类列表失败')
    loading.value = false
  }
}

// 加载分类选项（用于级联选择器）
const loadCategoryOptions = async () => {
  try {
    // 实际项目中应调用API获取所有分类
    // const res = await getAllCategories()
    
    // 模拟数据
    const mockOptions = Array.from({ length: 5 }, (_, index) => ({
      id: 100 + index,
      name: `分类${index + 1}`,
      children: Array.from({ length: 3 }, (_, subIndex) => ({
        id: 200 + index * 10 + subIndex,
        name: `子分类${index + 1}-${subIndex + 1}`
      }))
    }))
    
    categoryOptions.value = mockOptions
  } catch (error) {
    console.error('获取分类选项失败', error)
    ElMessage.error('获取分类选项失败')
  }
}

// 表单操作
const handleSearch = () => {
  currentPage.value = 1
  loadCategories()
}

const resetForm = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadCategories()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadCategories()
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(categoryForm, {
    id: null,
    parent_id: null,
    name: '',
    description: '',
    sort: 0,
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(categoryForm, {
    id: row.id,
    parent_id: row.parent_id,
    name: row.name,
    description: row.description,
    sort: row.sort,
    status: row.status
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!categoryFormRef.value) return
  
  try {
    await categoryFormRef.value.validate()
    
    // 实际项目中应调用API保存分类
    if (isEdit.value) {
      // await updateCategory(categoryForm)
      ElMessage.success('更新分类成功')
    } else {
      // await createCategory(categoryForm)
      ElMessage.success('创建分类成功')
    }
    
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const toggleStatus = async (row) => {
  try {
    const action = row.status === 'active' ? '禁用' : '启用'
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    
    await ElMessageBox.confirm(`确定要${action}该分类吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中应调用API更新状态
    // await updateCategoryStatus(row.id, newStatus)
    
    // 模拟更新
    row.status = newStatus
    ElMessage.success(`${action}分类成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新分类状态失败', error)
      ElMessage.error('更新分类状态失败')
    }
  }
}

const handleDelete = async (row) => {
  if (row.article_count > 0) {
    ElMessage.warning('该分类下有文章，无法删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中应调用API删除分类
    // await deleteCategory(row.id)
    
    ElMessage.success('删除分类成功')
    loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败', error)
      ElMessage.error('删除分类失败')
    }
  }
}

// 生命周期钩子
onMounted(() => {
  loadCategories()
  loadCategoryOptions()
})
</script>

<style scoped>
.category-management-container {
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
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
