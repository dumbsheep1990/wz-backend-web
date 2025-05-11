<template>
  <div class="message-container">
    <div class="search-box">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="消息标题">
          <el-input v-model="searchForm.title" placeholder="请输入消息标题" clearable></el-input>
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="searchForm.type" placeholder="请选择消息类型" clearable>
            <el-option label="系统通知" :value="1"></el-option>
            <el-option label="活动消息" :value="2"></el-option>
            <el-option label="互动消息" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未读" :value="0"></el-option>
            <el-option label="已读" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-box">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">发送消息</el-button>
        <el-button type="warning" @click="handleMarkAllAsRead">全部标为已读</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          prop="id"
          label="ID"
          width="80">
        </el-table-column>
        <el-table-column
          prop="title"
          label="消息标题"
          width="200">
          <template slot-scope="scope">
            <el-badge v-if="scope.row.status === 0" is-dot>
              {{ scope.row.title }}
            </el-badge>
            <span v-else>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="消息内容"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="type"
          label="消息类型"
          width="120">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 1" type="primary">系统通知</el-tag>
            <el-tag v-else-if="scope.row.type === 2" type="success">活动消息</el-tag>
            <el-tag v-else-if="scope.row.type === 3" type="warning">互动消息</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'warning' : 'success'">
              {{ scope.row.status === 0 ? '未读' : '已读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_important"
          label="重要"
          width="80">
          <template slot-scope="scope">
            <i v-if="scope.row.is_important === 1" class="el-icon-star-on" style="color: #E6A23C;"></i>
            <i v-else class="el-icon-star-off"></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          label="发送时间"
          width="180">
        </el-table-column>
        <el-table-column
          label="操作"
          width="220">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleView(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.status === 0"
              size="mini"
              type="success"
              @click="handleMarkAsRead(scope.row)">标为已读</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

    <!-- 发送消息弹窗 -->
    <el-dialog :title="'发送消息'" :visible.sync="dialogVisible" width="600px">
      <el-form :model="formData" :rules="formRules" ref="messageForm" label-width="100px">
        <el-form-item label="接收用户" prop="user_id">
          <el-select v-model="formData.user_id" placeholder="请选择接收用户" style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入消息标题"></el-input>
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input type="textarea" v-model="formData.content" rows="5" placeholder="请输入消息内容"></el-input>
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择消息类型" style="width: 100%">
            <el-option label="系统通知" :value="1"></el-option>
            <el-option label="活动消息" :value="2"></el-option>
            <el-option label="互动消息" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="重要消息" prop="is_important">
          <el-switch
            v-model="formData.is_important"
            :active-value="1"
            :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">发送</el-button>
      </div>
    </el-dialog>

    <!-- 查看消息弹窗 -->
    <el-dialog :title="'查看消息'" :visible.sync="viewDialogVisible" width="600px">
      <div class="message-view" v-if="currentMessage">
        <div class="message-title">
          <h3>{{ currentMessage.title }}</h3>
          <div class="message-meta">
            <el-tag v-if="currentMessage.type === 1" type="primary" size="small">系统通知</el-tag>
            <el-tag v-else-if="currentMessage.type === 2" type="success" size="small">活动消息</el-tag>
            <el-tag v-else-if="currentMessage.type === 3" type="warning" size="small">互动消息</el-tag>
            <el-tag v-else type="info" size="small">其他</el-tag>
            <span class="message-time">{{ currentMessage.created_at }}</span>
          </div>
        </div>
        <div class="message-body">{{ currentMessage.content }}</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button 
          v-if="currentMessage && currentMessage.status === 0" 
          type="success" 
          @click="handleMarkCurrentAsRead">标为已读</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMessagesByUser, createMessage, getMessageById, markAsRead, markAllAsRead, deleteMessage } from '@/api/message'

export default {
  name: 'UserMessage',
  data() {
    return {
      // 搜索表单
      searchForm: {
        title: '',
        type: '',
        status: ''
      },
      // 表格数据
      tableData: [],
      loading: false,
      // 分页
      page: 1,
      pageSize: 10,
      total: 0,
      // 发送弹窗
      dialogVisible: false,
      formData: {
        user_id: '',
        title: '',
        content: '',
        type: 1,
        is_important: 0
      },
      // 表单验证规则
      formRules: {
        user_id: [
          { required: true, message: '请选择接收用户', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入消息标题', trigger: 'blur' },
          { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入消息内容', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择消息类型', trigger: 'change' }
        ]
      },
      // 用户选项（实际中需要从API获取）
      userOptions: [],
      // 查看消息
      viewDialogVisible: false,
      currentMessage: null
    }
  },
  created() {
    this.fetchData()
    this.fetchUsers()
  },
  methods: {
    // 获取用户列表（实际中需要调用用户列表API）
    fetchUsers() {
      // 模拟数据，实际项目中应该调用API获取
      this.userOptions = [
        { id: 1, username: '用户1' },
        { id: 2, username: '用户2' },
        { id: 3, username: '用户3' }
      ]
    },
    
    // 获取列表数据
    fetchData() {
      this.loading = true
      const params = {
        page: this.page,
        page_size: this.pageSize,
        ...this.searchForm
      }
      
      listMessagesByUser(params).then(response => {
        this.tableData = response.data.items
        this.total = response.data.total
      }).catch(error => {
        console.error('获取消息列表失败', error)
        this.$message.error('获取消息列表失败')
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 搜索
    handleSearch() {
      this.page = 1
      this.fetchData()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        title: '',
        type: '',
        status: ''
      }
      this.page = 1
      this.fetchData()
    },
    
    // 分页大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    
    // 页码变化
    handleCurrentChange(val) {
      this.page = val
      this.fetchData()
    },
    
    // 打开发送消息弹窗
    handleAdd() {
      this.formData = {
        user_id: '',
        title: '',
        content: '',
        type: 1,
        is_important: 0
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.messageForm && this.$refs.messageForm.clearValidate()
      })
    },
    
    // 查看消息
    handleView(row) {
      getMessageById(row.id).then(response => {
        this.currentMessage = response.data
        this.viewDialogVisible = true
        
        // 如果消息未读，自动标记为已读
        if (this.currentMessage.status === 0) {
          this.handleMarkAsRead(this.currentMessage, false)
        }
      }).catch(error => {
        console.error('获取消息详情失败', error)
        this.$message.error('获取消息详情失败')
      })
    },
    
    // 标记当前消息为已读
    handleMarkCurrentAsRead() {
      if (this.currentMessage) {
        this.handleMarkAsRead(this.currentMessage, true)
        this.viewDialogVisible = false
      }
    },
    
    // 标记为已读
    handleMarkAsRead(row, showMessage = true) {
      markAsRead(row.id).then(() => {
        if (showMessage) {
          this.$message.success('已标记为已读')
        }
        // 更新当前行状态
        row.status = 1
        // 刷新列表
        this.fetchData()
      }).catch(error => {
        console.error('标记已读失败', error)
        if (showMessage) {
          this.$message.error('标记已读失败')
        }
      })
    },
    
    // 全部标为已读
    handleMarkAllAsRead() {
      this.$confirm('确认将所有未读消息标记为已读?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        markAllAsRead().then(() => {
          this.$message.success('所有消息已标记为已读')
          this.fetchData()
        }).catch(error => {
          console.error('标记所有已读失败', error)
          this.$message.error('操作失败')
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 删除消息
    handleDelete(row) {
      this.$confirm('确认删除该消息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMessage(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        }).catch(error => {
          console.error('删除消息失败', error)
          this.$message.error('删除失败')
        })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 提交表单
    submitForm() {
      this.$refs.messageForm.validate(valid => {
        if (valid) {
          createMessage(this.formData).then(() => {
            this.$message.success('发送成功')
            this.dialogVisible = false
            this.fetchData()
          }).catch(error => {
            console.error('发送消息失败', error)
            this.$message.error('发送失败')
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.message-container {
  padding: 20px;
}
.search-box {
  margin-bottom: 20px;
}
.table-box {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.table-header {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.message-view {
  padding: 0 20px;
}
.message-title {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}
.message-title h3 {
  margin-top: 0;
  margin-bottom: 10px;
}
.message-meta {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #909399;
}
.message-time {
  margin-left: 10px;
}
.message-body {
  line-height: 1.6;
  font-size: 14px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 