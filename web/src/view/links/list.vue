<template>
  <div>
    <div class="gva-search-box">
      <el-form :inline="true" :model="searchInfo">
        <el-form-item>
          <el-input v-model="searchInfo.name" placeholder="链接名称" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchInfo.status" placeholder="状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getTableData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openAddDialog">新增友情链接</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="链接名称" min-width="120" />
      <el-table-column prop="url" label="链接URL" min-width="200" />
      <el-table-column label="Logo" width="120">
        <template #default="scope">
          <div v-if="scope.row.logo" class="link-logo">
            <el-image :src="scope.row.logo" :preview-src-list="[scope.row.logo]" fit="cover" style="width:60px;height:30px" />
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150" />
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" icon="edit" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" icon="delete" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增友情链接' : '编辑友情链接'" width="600px">
      <el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules">
        <el-form-item label="链接名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入链接名称" />
        </el-form-item>
        <el-form-item label="链接URL" prop="url">
          <el-input v-model="formData.url" placeholder="请输入链接URL" />
        </el-form-item>
        <el-form-item label="Logo">
          <upload-image v-model:imageUrl="formData.logo" :fileSize="512" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UploadImage from '@/components/upload/image.vue'
import { getLinks, createLink, updateLink, deleteLink } from '@/api/links' // 需要创建这些API函数

const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchInfo = reactive({
  name: '',
  status: ''
})

const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formData = reactive({
  id: 0,
  name: '',
  url: '',
  logo: '',
  sort: 0,
  status: 1,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入链接名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入链接URL', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const ruleForm = ref(null)

// 获取表格数据
const getTableData = async () => {
  try {
    const res = await getLinks({
      page: page.value,
      pageSize: pageSize.value,
      name: searchInfo.name,
      status: searchInfo.status === '' ? undefined : searchInfo.status
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (err) {
    console.error(err)
  }
}

// 重置搜索条件
const resetSearch = () => {
  searchInfo.name = ''
  searchInfo.status = ''
  getTableData()
}

// 打开新增对话框
const openAddDialog = () => {
  dialogType.value = 'add'
  formData.id = 0
  formData.name = ''
  formData.url = ''
  formData.logo = ''
  formData.sort = 0
  formData.status = 1
  formData.description = ''
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  formData.id = row.id
  formData.name = row.name
  formData.url = row.url
  formData.logo = row.logo
  formData.sort = row.sort
  formData.status = row.status
  formData.description = row.description
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该友情链接吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteLink(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getTableData()
      }
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

// 提交表单
const submitForm = () => {
  ruleForm.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (dialogType.value === 'add') {
          res = await createLink(formData)
        } else {
          res = await updateLink(formData.id, formData)
        }
        
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
          dialogVisible.value = false
          getTableData()
        }
      } catch (err) {
        console.error(err)
      }
    }
  })
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.gva-search-box {
  padding: 24px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.link-logo {
  display: flex;
  justify-content: center;
}
</style> 