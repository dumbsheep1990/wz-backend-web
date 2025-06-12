<template>
  <div class="app-container">
    <!-- Filters -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="学员姓名/课程名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.courseId" placeholder="课程" clearable filterable style="width: 200px" class="filter-item">
        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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

    <!-- Progress table -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户" width="150">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewUserInfo(row.userId)">{{ row.userName }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="课程" min-width="180">
        <template slot-scope="{row}">
          <el-link type="primary" @click="viewCourse(row.courseId)">{{ row.courseName }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="总进度" width="180" align="center">
        <template slot-scope="{row}">
          <el-progress :percentage="row.progressPercent || 0" :format="percentageFormat"></el-progress>
          <div>{{ row.completedLessons || 0 }}/{{ row.totalLessons || 0 }}课时</div>
        </template>
      </el-table-column>

      <el-table-column label="最近学习" width="180" align="center">
        <template slot-scope="{row}">
          <div>{{ row.lastLessonTitle || '无学习记录' }}</div>
          <div v-if="row.lastAccessedAt">{{ row.lastAccessedAt | parseTime }}</div>
        </template>
      </el-table-column>

      <el-table-column label="学习时长(分钟)" width="120" align="center">
        <template slot-scope="{row}">
          <span>{{ row.totalTimeSpent ? Math.round(row.totalTimeSpent / 60) : 0 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="240">
        <template slot-scope="{row}">
          <el-button size="mini" type="primary" @click="viewDetail(row)">
            详情
          </el-button>
          <el-button size="mini" type="warning" @click="handleReset(row)">
            重置进度
          </el-button>
          <el-button
            v-if="row.status !== 'completed'"
            size="mini"
            type="success"
            @click="handleMarkComplete(row)"
          >
            标记完成
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

    <!-- Progress Detail Dialog -->
    <el-dialog title="学习进度详情" :visible.sync="dialogDetailVisible" width="70%">
      <div v-if="progressDetail">
        <div class="detail-header">
          <div>
            <h4>{{ progressDetail.userName }} - {{ progressDetail.courseName }}</h4>
            <p>总进度: {{ progressDetail.progressPercent }}% ({{ progressDetail.completedLessons }}/{{ progressDetail.totalLessons }}课时)</p>
          </div>
          <div>
            <el-button type="primary" size="small" @click="handleGenerateCertificate(progressDetail)" :disabled="progressDetail.progressPercent < 100">
              生成证书
            </el-button>
          </div>
        </div>
        
        <el-collapse v-model="activeChapters">
          <el-collapse-item v-for="chapter in progressDetail.chapters" :key="chapter.id" :title="`${chapter.title} (${chapter.completedLessons}/${chapter.totalLessons})`" :name="chapter.id">
            <el-table :data="chapter.lessons" border style="width: 100%">
              <el-table-column prop="title" label="课时名称" min-width="200" />
              <el-table-column prop="duration" label="时长(分钟)" width="120" align="center">
                <template slot-scope="{row}">
                  {{ Math.round(row.duration / 60) }}
                </template>
              </el-table-column>
              <el-table-column prop="completionStatus" label="完成状态" width="120" align="center">
                <template slot-scope="{row}">
                  <el-tag :type="row.completed ? 'success' : 'info'">
                    {{ row.completed ? '已完成' : '未完成' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="timeSpent" label="学习时长(分钟)" width="130" align="center">
                <template slot-scope="{row}">
                  {{ Math.round(row.timeSpent / 60) }}
                </template>
              </el-table-column>
              <el-table-column prop="lastAccessedAt" label="最近学习时间" width="180" align="center">
                <template slot-scope="{row}">
                  {{ row.lastAccessedAt ? parseTime(row.lastAccessedAt) : '-' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" align="center">
                <template slot-scope="{row}">
                  <el-button
                    size="mini"
                    :type="row.completed ? 'warning' : 'success'"
                    @click="toggleLessonCompletion(row)"
                  >
                    {{ row.completed ? '标记未完成' : '标记完成' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-dialog>

    <!-- Reset Confirmation Dialog -->
    <el-dialog
      :visible.sync="dialogResetVisible"
      title="确认重置学习进度"
      width="30%"
    >
      <span>确定要重置该用户的此课程学习进度吗？此操作不可恢复。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogResetVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReset">确认重置</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import {
  listProgress,
  getProgressDetail,
  resetProgress,
  markLessonComplete,
  markLessonIncomplete,
  markProgressComplete,
  exportProgress
} from '@/api/admin/learning/progress'
import { listCourses } from '@/api/admin/learning/courses'
import { generateCertificate } from '@/api/admin/learning/certificates'

export default {
  name: 'ProgressList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        'in_progress': 'primary',
        'completed': 'success',
        'not_started': 'info'
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
        courseId: null,
        status: null,
        sort: '-lastAccessedAt'
      },
      statusOptions: [
        { label: '进行中', value: 'in_progress' },
        { label: '已完成', value: 'completed' },
        { label: '未开始', value: 'not_started' }
      ],
      courseOptions: [],
      dialogDetailVisible: false,
      dialogResetVisible: false,
      progressDetail: null,
      activeChapters: [],
      currentResetId: null,
      parseTime
    }
  },
  created() {
    this.getList()
    this.getCourseOptions()

    // Handle direct navigation with query params
    if (this.$route.query.userId && this.$route.query.courseId) {
      this.fetchProgressDetail({
        userId: this.$route.query.userId,
        courseId: this.$route.query.courseId
      })
    }
  },
  methods: {
    percentageFormat(percentage) {
      return percentage + '%'
    },
    statusText(status) {
      const statusTexts = {
        'in_progress': '进行中',
        'completed': '已完成',
        'not_started': '未开始'
      }
      return statusTexts[status] || status
    },
    getList() {
      this.listLoading = true
      listProgress(this.listQuery).then(response => {
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
    getCourseOptions() {
      listCourses({ limit: 100 }).then(response => {
        this.courseOptions = response.data.items.map(item => ({
          label: item.title,
          value: item.id
        }))
      })
    },
    viewDetail(row) {
      this.fetchProgressDetail(row)
    },
    fetchProgressDetail(row) {
      getProgressDetail(row.id || { userId: row.userId, courseId: row.courseId }).then(response => {
        this.progressDetail = response.data
        this.activeChapters = [this.progressDetail.chapters[0]?.id]
        this.dialogDetailVisible = true
      })
    },
    handleReset(row) {
      this.currentResetId = row.id
      this.dialogResetVisible = true
    },
    confirmReset() {
      resetProgress(this.currentResetId).then(() => {
        this.dialogResetVisible = false
        this.$notify({
          title: '成功',
          message: '学习进度已重置',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },
    handleMarkComplete(row) {
      this.$confirm('确认将该用户的此课程学习进度标记为已完成?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        markProgressComplete(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '已将进度标记为完成',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    },
    toggleLessonCompletion(lesson) {
      const progressId = this.progressDetail.id
      const lessonId = lesson.id
      
      if (lesson.completed) {
        markLessonIncomplete(progressId, lessonId).then(() => {
          lesson.completed = false
          this.updateProgressStats()
          this.$notify({
            title: '成功',
            message: '已将课时标记为未完成',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        markLessonComplete(progressId, lessonId).then(() => {
          lesson.completed = true
          this.updateProgressStats()
          this.$notify({
            title: '成功',
            message: '已将课时标记为完成',
            type: 'success',
            duration: 2000
          })
        })
      }
    },
    updateProgressStats() {
      // Update the chapter and course progress stats after toggling a lesson
      if (this.progressDetail) {
        let totalCompleted = 0
        let totalLessons = 0
        
        this.progressDetail.chapters.forEach(chapter => {
          const completedInChapter = chapter.lessons.filter(l => l.completed).length
          chapter.completedLessons = completedInChapter
          totalCompleted += completedInChapter
          totalLessons += chapter.lessons.length
        })
        
        this.progressDetail.completedLessons = totalCompleted
        this.progressDetail.totalLessons = totalLessons
        this.progressDetail.progressPercent = Math.round((totalCompleted / totalLessons) * 100)
      }
    },
    handleGenerateCertificate(progress) {
      this.$confirm('确认为该学员生成课程完成证书?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        generateCertificate({
          userId: progress.userId,
          courseId: progress.courseId,
          autoSend: false
        }).then(response => {
          this.$notify({
            title: '成功',
            message: '证书已生成',
            type: 'success',
            duration: 2000
          })
          
          // Navigate to the certificate view
          this.$router.push({
            path: '/learning/certificates',
            query: { id: response.data.id }
          })
        })
      })
    },
    handleExport() {
      this.$confirm('确认导出学习进度数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        exportProgress(this.listQuery).then(response => {
          const url = window.URL.createObjectURL(new Blob([response], { type: 'application/vnd.ms-excel' }))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', '学习进度数据.xlsx')
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
    }
  }
}
</script>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.el-collapse-item {
  margin-bottom: 10px;
}
</style>
