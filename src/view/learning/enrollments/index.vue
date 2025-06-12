<template>
  <div class="app-container">
    <!-- Filters -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="学员姓名/手机/邮箱"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.courseId" placeholder="课程" clearable filterable style="width: 200px" class="filter-item">
        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 290px"
        class="filter-item"
        value-format="yyyy-MM-dd"
        @change="handleDateRange"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        添加报名
      </el-button>
      <el-button
        class="filter-item"
        type="success"
        icon="el-icon-download"
        @click="handleExport"
      >
        导出
      </el-button>
    </div>

    <!-- Enrollment table -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="报名ID" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户ID" align="center" width="120">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewUserInfo(row.userId)">{{ row.userId }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="学员姓名" min-width="120">
        <template slot-scope="{row}">
          <span>{{ row.userName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="课程" min-width="180">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewCourse(row.courseId)">{{ row.courseName }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="报名时间" width="160" align="center">
        <template slot-scope="{row}">
          <span>{{ row.enrolledAt | parseTime }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="过期时间" width="160" align="center">
        <template slot-scope="{row}">
          <span v-if="row.expiredAt">{{ row.expiredAt | parseTime }}</span>
          <span v-else>永久有效</span>
        </template>
      </el-table-column>

      <el-table-column label="进度" width="120" align="center">
        <template slot-scope="{row}">
          <el-progress :percentage="row.progress || 0" :format="percentageFormat"></el-progress>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="250"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="success" @click="viewProgress(row)">
            学习进度
          </el-button>
          <el-button
            v-if="row.status === 'active'"
            size="mini"
            type="warning"
            @click="handleStatus(row, 'suspended')"
          >
            暂停
          </el-button>
          <el-button
            v-if="row.status === 'suspended'"
            size="mini"
            type="success"
            @click="handleStatus(row, 'active')"
          >
            激活
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- Create/Update Dialog -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="用户" prop="userId">
          <el-select v-model="temp.userId" filterable remote placeholder="请输入用户信息搜索" :remote-method="searchUsers" :loading="userSearchLoading">
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="temp.courseId" filterable placeholder="请选择课程">
            <el-option
              v-for="item in courseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道" prop="channel">
          <el-select v-model="temp.channel" placeholder="请选择渠道">
            <el-option label="网站" value="web" />
            <el-option label="APP" value="app" />
            <el-option label="微信" value="wechat" />
            <el-option label="后台" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期" prop="expirationType">
          <el-radio-group v-model="temp.expirationType">
            <el-radio label="permanent">永久有效</el-radio>
            <el-radio label="limited">限时有效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="temp.expirationType === 'limited'" label="过期时间" prop="expiredAt">
          <el-date-picker v-model="temp.expiredAt" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- Delete confirmation dialog -->
    <el-dialog
      :visible.sync="dialogDeleteVisible"
      title="确认删除"
      width="30%"
    >
      <span>确定要删除此报名记录吗？此操作不可逆。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDeleteVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { 
  listEnrollments, 
  getEnrollment, 
  createEnrollment, 
  updateEnrollment, 
  deleteEnrollment,
  updateEnrollmentStatus,
  exportEnrollments
} from '@/api/admin/learning/enrollments'
import { listCourses } from '@/api/admin/learning/courses'
import { searchUsers } from '@/api/admin/user'

export default {
  name: 'EnrollmentsList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        active: 'success',
        completed: 'primary',
        suspended: 'warning',
        expired: 'info',
        cancelled: 'danger'
      }
      return statusMap[status] || 'info'
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        status: '',
        courseId: null,
        startDate: undefined,
        endDate: undefined,
        sort: '+id'
      },
      dateRange: [],
      statusOptions: [
        { label: '进行中', value: 'active' },
        { label: '已完成', value: 'completed' },
        { label: '已暂停', value: 'suspended' },
        { label: '已过期', value: 'expired' },
        { label: '已取消', value: 'cancelled' }
      ],
      courseOptions: [],
      userOptions: [],
      userSearchLoading: false,
      temp: {
        id: undefined,
        userId: undefined,
        courseId: undefined,
        channel: 'admin',
        expirationType: 'permanent',
        expiredAt: undefined,
        status: 'active',
        remark: ''
      },
      dialogFormVisible: false,
      dialogDeleteVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑报名信息',
        create: '添加报名'
      },
      rules: {
        userId: [{ required: true, message: '用户不能为空', trigger: 'change' }],
        courseId: [{ required: true, message: '课程不能为空', trigger: 'change' }],
        channel: [{ required: true, message: '渠道不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      },
      currentDeleteId: null
    }
  },
  created() {
    this.getList()
    this.getCourseOptions()
  },
  methods: {
    percentageFormat(percentage) {
      return percentage + '%'
    },
    statusText(status) {
      const statusTexts = {
        active: '进行中',
        completed: '已完成',
        suspended: '已暂停',
        expired: '已过期',
        cancelled: '已取消'
      }
      return statusTexts[status] || status
    },
    getList() {
      this.listLoading = true
      listEnrollments(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDateRange() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.listQuery.startDate = this.dateRange[0]
        this.listQuery.endDate = this.dateRange[1]
      } else {
        this.listQuery.startDate = undefined
        this.listQuery.endDate = undefined
      }
    },
    getCourseOptions() {
      listCourses({ limit: 100, status: 'active' }).then(response => {
        this.courseOptions = response.data.items.map(item => ({
          label: item.title,
          value: item.id
        }))
      })
    },
    searchUsers(query) {
      if (query !== '') {
        this.userSearchLoading = true
        searchUsers({ keyword: query, limit: 10 }).then(response => {
          this.userOptions = response.data.items.map(item => ({
            label: `${item.name} (${item.phone || item.email})`,
            value: item.id
          }))
          this.userSearchLoading = false
        }).catch(() => {
          this.userSearchLoading = false
        })
      } else {
        this.userOptions = []
      }
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        userId: undefined,
        courseId: undefined,
        channel: 'admin',
        expirationType: 'permanent',
        expiredAt: undefined,
        status: 'active',
        remark: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const data = { ...this.temp }
          if (data.expirationType === 'permanent') {
            data.expiredAt = null
          }
          delete data.expirationType
          
          createEnrollment(data).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建报名成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.temp.expirationType = this.temp.expiredAt ? 'limited' : 'permanent'
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const data = { ...this.temp }
          if (data.expirationType === 'permanent') {
            data.expiredAt = null
          }
          delete data.expirationType
          
          updateEnrollment(data.id, data).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新报名成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      this.currentDeleteId = row.id
      this.dialogDeleteVisible = true
    },
    confirmDelete() {
      deleteEnrollment(this.currentDeleteId).then(() => {
        this.dialogDeleteVisible = false
        this.$notify({
          title: '成功',
          message: '删除报名成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },
    handleStatus(row, status) {
      updateEnrollmentStatus(row.id, { status }).then(() => {
        this.$notify({
          title: '成功',
          message: status === 'active' ? '激活报名成功' : '暂停报名成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },
    handleExport() {
      this.$confirm('确认导出所有报名数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        exportEnrollments(this.listQuery).then(response => {
          const url = window.URL.createObjectURL(new Blob([response], { type: 'application/vnd.ms-excel' }))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', '报名数据.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      })
    },
    viewUserInfo(userId) {
      this.$router.push({ path: '/user/profile', query: { id: userId }})
    },
    viewCourse(courseId) {
      this.$router.push({ path: '/learning/courses/detail', query: { id: courseId }})
    },
    viewProgress(row) {
      this.$router.push({ path: '/learning/progress', query: { userId: row.userId, courseId: row.courseId }})
    }
  }
}
</script>
