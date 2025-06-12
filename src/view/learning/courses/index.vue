<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="课程名称/简介"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.status" placeholder="课程状态" clearable style="width: 130px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.categoryId" placeholder="课程分类" clearable style="width: 130px" class="filter-item">
        <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        添加课程
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
        label="封面"
        width="100"
      >
        <template slot-scope="{row}">
          <el-image 
            style="width: 80px; height: 45px" 
            :src="row.coverImage" 
            fit="cover"
            :preview-src-list="[row.coverImage]">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>

      <el-table-column
        label="课程名称"
        min-width="150"
      >
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
          <el-tag v-if="row.featured" size="mini" type="success" style="margin-left: 5px">精选</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column
        label="教师"
        width="120"
      >
        <template slot-scope="{row}">
          <span>{{ row.teacherName }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="分类"
        width="120"
      >
        <template slot-scope="{row}">
          <el-tag size="small">{{ row.categoryName }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="价格"
        align="center"
        width="100"
      >
        <template slot-scope="{row}">
          <span>{{ row.price === 0 ? '免费' : `¥${row.price.toFixed(2)}` }}</span>
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
        label="章节数"
        align="center"
        width="80"
      >
        <template slot-scope="{row}">
          <span>{{ row.chaptersCount }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="评分"
        align="center"
        width="120"
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
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="300"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="success" @click="handleChapters(row)">
            章节管理
          </el-button>
          <el-button size="mini" type="info" @click="handleEnrollments(row)">
            报名管理
          </el-button>
          <el-button
            v-if="row.status !== 'published'"
            size="mini"
            type="primary"
            @click="handleModifyStatus(row, 'published')"
          >
            发布
          </el-button>
          <el-button
            v-if="row.status !== 'draft'"
            size="mini"
            type="warning"
            @click="handleModifyStatus(row, 'draft')"
          >
            下架
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

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="dialogStatus === 'create' ? '创建课程' : '编辑课程'" :visible.sync="dialogFormVisible" width="60%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
      >
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="temp.title" placeholder="请输入课程名称" />
        </el-form-item>
        
        <el-form-item label="教师" prop="teacherId">
          <el-select v-model="temp.teacherId" filterable placeholder="请选择教师">
            <el-option
              v-for="item in teacherOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课程分类" prop="categoryId">
          <el-cascader
            v-model="temp.categoryId"
            :options="categoryTreeOptions"
            :props="{ checkStrictly: true }"
            clearable
            placeholder="请选择课程分类"
          />
        </el-form-item>

        <el-form-item label="课程封面">
          <el-upload
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            class="cover-uploader"
            action="/admin/api/v1/upload"
          >
            <img v-if="temp.coverImage" :src="temp.coverImage" class="cover">
            <i v-else class="el-icon-plus cover-uploader-icon" />
          </el-upload>
        </el-form-item>

        <el-form-item label="课程简介" prop="summary">
          <el-input v-model="temp.summary" type="textarea" :rows="2" placeholder="请输入课程简介" />
        </el-form-item>

        <el-form-item label="课程详情描述">
          <el-input v-model="temp.description" type="textarea" :rows="5" placeholder="请输入课程详情描述，支持Markdown格式" />
        </el-form-item>

        <el-form-item label="标签">
          <el-tag
            v-for="tag in temp.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleRemoveTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            class="input-new-tag"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加标签</el-button>
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number v-model="temp.price" :min="0" :precision="2" :step="10" />
        </el-form-item>

        <el-form-item label="精选课程">
          <el-switch v-model="temp.featured" />
        </el-form-item>

        <el-form-item label="难度等级" prop="level">
          <el-radio-group v-model="temp.level">
            <el-radio label="beginner">入门</el-radio>
            <el-radio label="intermediate">中级</el-radio>
            <el-radio label="advanced">高级</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="适合人群">
          <el-input v-model="temp.targetAudience" type="textarea" :rows="2" placeholder="请描述适合学习这门课程的人群" />
        </el-form-item>

        <el-form-item label="学习目标">
          <el-input v-model="temp.learningGoals" type="textarea" :rows="2" placeholder="完成课程后学员将掌握的技能" />
        </el-form-item>
        
        <el-form-item label="预计学习时长">
          <el-input-number v-model="temp.estimatedHours" :min="1" :precision="1" :step="0.5" /> 小时
        </el-form-item>

        <el-form-item label="课程状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
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

    <!-- 章节管理弹窗将在独立组件中实现 -->
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import coursesApi from '@/api/admin/learning/courses'
import teachersApi from '@/api/admin/learning/teachers'
import categoriesApi from '@/api/admin/learning/categories'

export default {
  name: 'CoursesList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        reviewing: 'warning',
        rejected: 'danger'
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
        categoryId: undefined,
        teacherId: undefined,
        sort: '+id'
      },
      inputVisible: false,
      inputValue: '',
      statusOptions: [
        { label: '已发布', value: 'published' },
        { label: '草稿', value: 'draft' },
        { label: '审核中', value: 'reviewing' },
        { label: '已拒绝', value: 'rejected' }
      ],
      teacherOptions: [],
      categoryOptions: [],
      categoryTreeOptions: [],
      temp: {
        id: undefined,
        title: '',
        teacherId: '',
        teacherName: '',
        categoryId: '',
        categoryName: '',
        coverImage: '',
        summary: '',
        description: '',
        tags: [],
        price: 0,
        featured: false,
        level: 'beginner',
        targetAudience: '',
        learningGoals: '',
        estimatedHours: 1,
        status: 'draft',
        studentsCount: 0,
        chaptersCount: 0,
        rating: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        title: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
        teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
        categoryId: [{ required: true, message: '请选择课程分类', trigger: 'change' }],
        summary: [{ required: true, message: '课程简介不能为空', trigger: 'blur' }],
        level: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
        status: [{ required: true, message: '请选择课程状态', trigger: 'change' }]
      }
    }
  },
  created() {
    const teacherId = this.$route.query.teacherId
    if (teacherId) {
      this.listQuery.teacherId = teacherId
    }
    this.getList()
    this.getTeacherOptions()
    this.getCategoryOptions()
  },
  methods: {
    getList() {
      this.listLoading = true
      coursesApi.getCourses(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取课程列表失败')
      })
    },
    getTeacherOptions() {
      teachersApi.getTeachers({ limit: 100, status: 'active' }).then(response => {
        this.teacherOptions = response.data.items.map(item => {
          return { label: item.name, value: item.id }
        })
      }).catch(() => {
        this.$message.error('获取教师选项失败')
      })
    },
    getCategoryOptions() {
      categoriesApi.getCategories({ limit: 100 }).then(response => {
        this.categoryOptions = response.data.items.map(item => {
          return { label: item.name, value: item.id }
        })
      }).catch(() => {
        this.$message.error('获取分类选项失败')
      })
      
      // 获取分类树
      categoriesApi.getCategoryTree().then(response => {
        this.categoryTreeOptions = response.data
      }).catch(() => {
        this.$message.error('获取分类树失败')
      })
    },
    statusLabel(status) {
      const map = {
        published: '已发布',
        draft: '草稿',
        reviewing: '审核中',
        rejected: '已拒绝'
      }
      return map[status] || status
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: '',
        teacherId: '',
        teacherName: '',
        categoryId: '',
        categoryName: '',
        coverImage: '',
        summary: '',
        description: '',
        tags: [],
        price: 0,
        featured: false,
        level: 'beginner',
        targetAudience: '',
        learningGoals: '',
        estimatedHours: 1,
        status: 'draft',
        studentsCount: 0,
        chaptersCount: 0,
        rating: 0
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
          coursesApi.createCourse(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建课程成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch(() => {
            this.$message.error('创建课程失败')
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
          coursesApi.updateCourse(tempData.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新课程成功',
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
            this.$message.error('更新课程失败')
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该课程, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        coursesApi.deleteCourse(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除课程成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        }).catch(() => {
          this.$message.error('删除课程失败')
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
      coursesApi.updateCourse(tempData.id, tempData).then(() => {
        this.$message({
          message: '状态更新成功',
          type: 'success'
        })
        row.status = status
      }).catch(() => {
        this.$message.error('状态更新失败')
      })
    },
    handleChapters(row) {
      this.$router.push({ path: `/learning/courses/${row.id}/chapters` })
    },
    handleEnrollments(row) {
      this.$router.push({ path: '/learning/enrollments', query: { courseId: row.id } })
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue && this.temp.tags.indexOf(inputValue) === -1) {
        this.temp.tags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    handleRemoveTag(tag) {
      this.temp.tags.splice(this.temp.tags.indexOf(tag), 1)
    },
    handleCoverSuccess(res, file) {
      if (res.code === 200) {
        this.temp.coverImage = res.data.url
      } else {
        this.$message.error('上传封面失败')
      }
    },
    beforeCoverUpload(file) {
      const isImage = file.type.indexOf('image/') === 0
      const isLessThan2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('上传封面图片只能是图片格式!')
      }
      if (!isLessThan2M) {
        this.$message.error('上传封面图片大小不能超过 2MB!')
      }
      return isImage && isLessThan2M
    }
  }
}
</script>

<style>
.cover-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.cover-uploader .el-upload:hover {
  border-color: #409EFF;
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.cover {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
