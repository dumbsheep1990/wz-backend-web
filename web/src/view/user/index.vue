<template>
  <div class="user-list-container">
    <el-card class="table-card">
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="活跃" value="active"></el-option>
              <el-option label="禁用" value="disabled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="operation-area">
        <el-button type="primary" @click="handleCreate">创建用户</el-button>
      </div>

      <el-table
        :data="userList"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userName" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180"></el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140"></el-table-column>
        <el-table-column prop="role" label="角色" min-width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="160"></el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              size="small"
              type="danger"
              link
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          :current-page="page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      :title="dialogType === 'create' ? '创建用户' : '编辑用户'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        :model="userForm"
        label-width="100px"
        :rules="rules"
        ref="userFormRef"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="userForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'create'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 初始数据
const loading = ref(false)
const userList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchForm = reactive({
  userName: '',
  email: '',
  status: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('create') // create or edit
const userFormRef = ref(null)
const userForm = reactive({
  id: '',
  userName: '',
  password: '',
  email: '',
  phone: '',
  role: '',
  status: 'active'
})

// 表单验证规则
const rules = reactive({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 方法
const handleSearch = () => {
  page.value = 1
  fetchUserList()
}

const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

const fetchUserList = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的 API 获取用户列表
    // const response = await getUserList({ ...searchForm, page: page.value, pageSize: pageSize.value })
    // 模拟数据
    const mockData = Array.from({ length: 10 }, (_, index) => ({
      id: page.value * 10 + index,
      userName: `user${page.value * 10 + index}`,
      email: `user${page.value * 10 + index}@example.com`,
      phone: `1380000${(page.value * 10 + index).toString().padStart(4, '0')}`,
      role: index % 3 === 0 ? 'admin' : 'user',
      status: index % 5 === 0 ? 'disabled' : 'active',
      createTime: '2025-05-01 12:00:00',
      updateTime: '2025-05-01 12:00:00'
    }))
    userList.value = mockData
    total.value = 100 // 模拟总数
  } catch (error) {
    console.error('获取用户列表失败', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchUserList()
}

const handleCreate = () => {
  dialogType.value = 'create'
  resetUserForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  resetUserForm()
  Object.keys(userForm).forEach(key => {
    if (key in row) {
      userForm[key] = row[key]
    }
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.userName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用实际的 API 删除用户
      // await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    } catch (error) {
      console.error('删除用户失败', error)
      ElMessage.error('删除用户失败')
    }
  }).catch(() => {
    // 取消删除操作
  })
}

const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  userForm.id = ''
  userForm.userName = ''
  userForm.password = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.role = ''
  userForm.status = 'active'
}

const submitForm = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    if (dialogType.value === 'create') {
      // 这里应该调用实际的 API 创建用户
      // await createUser(userForm)
      ElMessage.success('创建成功')
    } else {
      // 这里应该调用实际的 API 更新用户
      // await updateUser(userForm.id, userForm)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 生命周期
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.operation-area {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
