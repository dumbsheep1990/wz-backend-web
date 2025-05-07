<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container" style="margin-bottom: 20px;">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px; margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.email" placeholder="邮箱" style="width: 200px; margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px; margin-right: 10px;" class="filter-item">
        <el-option label="正常" :value="1" /> <!-- 假设 1 为正常 -->
        <el-option label="禁用" :value="2" /> <!-- 假设 2 为禁用 -->
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增用户
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.ID }}
        </template>
      </el-table-column>
      <el-table-column label="用户名">
        <template slot-scope="scope">
          {{ scope.row.Username }}
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.Email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center">
        <template slot-scope="scope">
          {{ scope.row.Phone }}
        </template>
      </el-table-column>
      <el-table-column label="角色" align="center">
        <template slot-scope="scope">
          {{ scope.row.Role }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.Status | statusFilter">{{ scope.row.Status === 1 ? '正常' : '禁用' }}</el-tag> <!-- 简单示例 -->
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.CreatedAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <!-- 新增/编辑用户的弹窗 -->
    <el-dialog :title="dialogStatus==='create'?'新增用户':'编辑用户'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="tempUser" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名" prop="Username">
          <el-input v-model="tempUser.Username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="Email">
          <el-input v-model="tempUser.Email" />
        </el-form-item>
        <el-form-item label="手机号" prop="Phone">
          <el-input v-model="tempUser.Phone" />
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" label="密码" prop="Password">
          <el-input v-model="tempUser.Password" type="password" />
        </el-form-item>
        <el-form-item label="角色" prop="Role">
           <el-select v-model="tempUser.Role" placeholder="请选择角色" style="width:100%;">
            <el-option label="平台管理员" value="platform_admin" />
            <el-option label="租户管理员" value="tenant_admin" />
            <el-option label="租户普通用户" value="tenant_user" />
            <el-option label="个人用户" value="personal_user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="Status">
          <el-radio-group v-model="tempUser.Status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getUserList, createUser, updateUser, deleteUser, getUserInfo } from '@/api/user'
import Pagination from '@/components/Pagination' // 假设分页组件路径
import { parseTime } from '@/utils' // 假设时间格式化工具

export default {
  name: 'UserManagement',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        2: 'danger'
      }
      return statusMap[status] || 'info'
    },
    parseTime // 引入时间格式化
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        username: undefined,
        email: undefined,
        status: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      tempUser: { // 临时存储用户数据，用于表单
        ID: undefined,
        Username: '',
        Email: '',
        Phone: '',
        Password: '', // 只在创建时需要
        Role: '',
        Status: 1 // 默认为正常
      },
      rules: { // 表单校验规则
        Username: [{ required: true, message: '用户名为必填项', trigger: 'blur' }],
        Email: [
          { required: true, message: '邮箱为必填项', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        Phone: [{ required: true, message: '手机号为必填项', trigger: 'blur' }],
        Password: [{ required: true, message: '密码为必填项', trigger: 'blur' }],
        Role: [{ required: true, message: '角色为必选项', trigger: 'change' }],
        Status: [{ required: true, message: '状态为必选项', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    parseTime, // 在模板中使用
    fetchData() {
      this.listLoading = true
      getUserList(this.listQuery).then(response => {
        // 注意：这里假设后端返回的数据结构是 { data: { list: [], total: 0 } }
        // 您需要根据后端实际返回的结构进行调整
        this.list = response.data.list 
        this.total = response.data.total
        this.listLoading = false
      }).catch(err => {
        this.listLoading = false
        console.error("Failed to fetch user list:", err)
        this.$message({ message: '获取用户列表失败', type: 'error' })
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetTempUser() {
      this.tempUser = {
        ID: undefined,
        Username: '',
        Email: '',
        Phone: '',
        Password: '',
        Role: '',
        Status: 1
      }
    },
    handleCreate() {
      this.resetTempUser()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 从tempUser中移除ID，因为创建时不需要传ID
          const userData = { ...this.tempUser }
          delete userData.ID
          createUser(userData).then(() => {
            this.fetchData() // 重新获取列表
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '用户创建成功',
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
             console.error("Failed to create user:", err)
             this.$message({ message: '创建用户失败', type: 'error' })
          })
        }
      })
    },
    handleUpdate(row) {
      // 为了避免直接修改表格中的数据，复制一份
      this.tempUser = Object.assign({}, row) 
      // 编辑时密码字段通常不直接显示或修改，除非有特定"修改密码"功能
      this.tempUser.Password = '' // 清空密码，不在此表单修改
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.tempUser)
          updateUser(tempData.ID, tempData).then(() => {
            this.fetchData() // 重新获取列表
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '用户信息更新成功',
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
             console.error("Failed to update user:", err)
             this.$message({ message: '更新用户信息失败', type: 'error' })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.ID).then(() => {
          this.fetchData() // 重新获取列表
          this.$notify({
            title: '成功',
            message: '用户删除成功',
            type: 'success',
            duration: 2000
          })
        }).catch(err => {
            console.error("Failed to delete user:", err)
            this.$message({ message: '删除用户失败', type: 'error' })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  margin-right: 10px;
}
</style> 