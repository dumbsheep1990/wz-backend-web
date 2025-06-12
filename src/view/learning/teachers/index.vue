<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="教师姓名/职称/专长"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
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
        添加教师
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        align="center"
        label="ID"
        width="80"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="头像"
        width="80"
      >
        <template slot-scope="{row}">
          <el-avatar :src="row.avatar" :size="40">
            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
          </el-avatar>
        </template>
      </el-table-column>

      <el-table-column
        label="姓名"
        width="120"
      >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="职称"
        width="120"
      >
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="专长"
        width="180"
      >
        <template slot-scope="{row}">
          <el-tag v-for="(specialty, index) in row.specialties" :key="index" size="mini" style="margin-right: 3px">
            {{ specialty }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="课程数"
        align="center"
        width="80"
      >
        <template slot-scope="{row}">
          <span>{{ row.coursesCount }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="学生数"
        align="center"
        width="80"
      >
        <template slot-scope="{row}">
          <span>{{ row.studentsCount }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="评分"
        align="center"
        width="100"
      >
        <template slot-scope="{row}">
          <el-rate
            v-model="row.rating"
            disabled
            text-color="#ff9900"
            score-template="{value} 分"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        align="center"
        width="100"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 'active' ? '在职' : row.status === 'inactive' ? '离职' : '待审核' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="创建时间"
        align="center"
        width="160"
      >
        <template slot-scope="{row}">
          <span>{{ row.createdAt | parseTime }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="250"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row, $index}">
          <el-button size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="primary" @click="handleViewCourses(row)">
            课程
          </el-button>
          <el-button
            v-if="row.status !== 'active'"
            size="mini"
            type="success"
            @click="handleModifyStatus(row, 'active')"
          >
            激活
          </el-button>
          <el-button
            v-if="row.status !== 'inactive'"
            size="mini"
            type="warning"
            @click="handleModifyStatus(row, 'inactive')"
          >
            禁用
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="dialogStatus === 'create' ? '添加教师' : '编辑教师'" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 90%; margin-left: 50px;"
      >
        <el-form-item label="教师姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item label="关联用户" prop="userId">
          <el-select v-model="temp.userId" placeholder="请选择关联用户">
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="头像">
          <el-upload
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            class="avatar-uploader"
            action="/admin/api/v1/upload"
          >
            <img v-if="temp.avatar" :src="temp.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>

        <el-form-item label="职称" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>

        <el-form-item label="专长">
          <el-tag
            v-for="(specialty, index) in temp.specialties"
            :key="index"
            closable
            :disable-transitions="false"
            @close="removeSpecialty(specialty)"
          >
            {{ specialty }}
          </el-tag>
          <el-input
            v-if="specialtyInputVisible"
            ref="specialtyInput"
            v-model="specialtyValue"
            class="input-new-tag"
            size="small"
            @keyup.enter.native="addSpecialty"
            @blur="addSpecialty"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showSpecialtyInput">
            + 添加专长
          </el-button>
        </el-form-item>

        <el-form-item label="自我介绍" prop="introduction">
          <el-input v-model="temp.introduction" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="联系邮箱">
          <el-input v-model="temp.contactEmail" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="temp.contactPhone" />
        </el-form-item>

        <el-form-item label="社交链接">
          <div v-for="(link, index) in temp.socialProfiles" :key="index" style="display: flex; margin-bottom: 5px;">
            <el-input v-model="temp.socialProfiles[index]" style="margin-right: 5px;" />
            <el-button type="danger" icon="el-icon-delete" circle @click="removeSocial(index)" />
          </div>
          <el-button type="primary" icon="el-icon-plus" @click="addSocial">添加链接</el-button>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import teachersApi from '@/api/admin/learning/teachers'

export default {
  name: 'TeachersList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        active: 'success',
        inactive: 'info',
        pending: 'warning'
      }
      return statusMap[status]
    },
    parseTime
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: undefined,
        status: undefined,
        sort: '+id'
      },
      specialtyInputVisible: false,
      specialtyValue: '',
      statusOptions: [
        { label: '在职', value: 'active' },
        { label: '离职', value: 'inactive' },
        { label: '待审核', value: 'pending' }
      ],
      userOptions: [], // 这里应该从用户API获取
      temp: {
        id: undefined,
        userId: '',
        name: '',
        avatar: '',
        title: '',
        introduction: '',
        specialties: [],
        status: 'active',
        coursesCount: 0,
        studentsCount: 0,
        rating: 0,
        ratingCount: 0,
        contactEmail: '',
        contactPhone: '',
        socialProfiles: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        name: [{ required: true, message: '教师姓名不能为空', trigger: 'blur' }],
        userId: [{ required: true, message: '请选择关联用户', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getUserOptions() // 获取用户选项
  },
  methods: {
    getList() {
      this.listLoading = true
      teachersApi.getTeachers(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取教师列表失败')
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getUserOptions() {
      // 这里应该调用用户API获取用户列表作为选项
      // 暂时使用模拟数据
      this.userOptions = [
        { label: '用户1', value: 'user_1' },
        { label: '用户2', value: 'user_2' },
        { label: '用户3', value: 'user_3' }
      ]
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        userId: '',
        name: '',
        avatar: '',
        title: '',
        introduction: '',
        specialties: [],
        status: 'active',
        coursesCount: 0,
        studentsCount: 0,
        rating: 0,
        ratingCount: 0,
        contactEmail: '',
        contactPhone: '',
        socialProfiles: []
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
          teachersApi.createTeacher(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建教师成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(() => {
            this.$message.error('创建教师失败')
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // 复制一份防止修改
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          teachersApi.updateTeacher(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新教师成功',
              type: 'success',
              duration: 2000
            })
            // 更新列表中对应的项
            for (const idx in this.list) {
              if (this.list[idx].id === tempData.id) {
                this.list[idx] = tempData
                break
              }
            }
          }).catch(() => {
            this.$message.error('更新教师失败')
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该教师吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        teachersApi.deleteTeacher(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除教师成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
          this.total -= 1
        }).catch(() => {
          this.$message.error('删除教师失败')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleModifyStatus(row, status) {
      const tempData = Object.assign({}, row)
      tempData.status = status
      teachersApi.updateTeacher(tempData.id, tempData).then(() => {
        this.$message({
          message: '状态更新成功',
          type: 'success'
        })
        row.status = status
      }).catch(() => {
        this.$message.error('状态更新失败')
      })
    },
    handleViewCourses(row) {
      this.$router.push({ path: `/learning/courses?teacherId=${row.id}` })
    },
    showSpecialtyInput() {
      this.specialtyInputVisible = true
      this.$nextTick(_ => {
        this.$refs.specialtyInput.$refs.input.focus()
      })
    },
    addSpecialty() {
      const value = this.specialtyValue
      if (value) {
        this.temp.specialties.push(value)
      }
      this.specialtyInputVisible = false
      this.specialtyValue = ''
    },
    removeSpecialty(specialty) {
      const index = this.temp.specialties.indexOf(specialty)
      this.temp.specialties.splice(index, 1)
    },
    addSocial() {
      this.temp.socialProfiles.push('')
    },
    removeSocial(index) {
      this.temp.socialProfiles.splice(index, 1)
    },
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.temp.avatar = res.data.url
      } else {
        this.$message.error('上传头像失败')
      }
    },
    beforeAvatarUpload(file) {
      const isImage = file.type.indexOf('image/') === 0
      const isLessThan2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('上传头像图片只能是图片格式!')
      }
      if (!isLessThan2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isImage && isLessThan2M
    }
  }
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.button-new-tag {
  margin-left: 10px;
}
</style>
