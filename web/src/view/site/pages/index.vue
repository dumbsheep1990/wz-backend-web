<template>
  <div>
    <h2>页面管理</h2>
    <div class="content-box">
      <div class="operation-header">
        <el-button type="primary" @click="openPageDialog()">新建页面</el-button>
        <el-button type="warning" @click="batchEdit">批量编辑</el-button>
      </div>

      <el-table 
        :data="pageList" 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="title" label="页面标题" width="200"></el-table-column>
        <el-table-column prop="path" label="路径" width="180"></el-table-column>
        <el-table-column prop="type" label="页面类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeStyle(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已发布' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button link type="primary" @click="editPage(scope.row)">编辑</el-button>
            <el-button link type="success" @click="previewPage(scope.row)">预览</el-button>
            <el-button 
              link 
              :type="scope.row.status === '已发布' ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)">
              {{ scope.row.status === '已发布' ? '下线' : '发布' }}
            </el-button>
            <el-button link type="danger" @click="deletePage(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>

      <!-- 页面编辑对话框 -->
      <el-dialog 
        v-model="dialogVisible" 
        :title="isEdit ? '编辑页面' : '新建页面'" 
        width="70%" 
        :before-close="handleDialogClose">
        <el-form :model="pageForm" :rules="pageRules" ref="pageFormRef" label-width="120px">
          <el-form-item label="页面标题" prop="title">
            <el-input v-model="pageForm.title" placeholder="请输入页面标题"></el-input>
          </el-form-item>
          <el-form-item label="页面路径" prop="path">
            <el-input v-model="pageForm.path" placeholder="请输入页面路径"></el-input>
            <div class="input-tip">例如：/about, /services/web-design</div>
          </el-form-item>
          <el-form-item label="页面类型" prop="type">
            <el-select v-model="pageForm.type" placeholder="选择页面类型" style="width: 100%">
              <el-option label="内容页" value="内容页"></el-option>
              <el-option label="列表页" value="列表页"></el-option>
              <el-option label="首页" value="首页"></el-option>
              <el-option label="表单页" value="表单页"></el-option>
              <el-option label="登录页" value="登录页"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="页面内容" prop="content">
            <div class="editor-container">
              <!-- 这里可以集成富文本编辑器组件 -->
              <el-input type="textarea" v-model="pageForm.content" :rows="10" placeholder="页面内容"></el-input>
            </div>
          </el-form-item>
          <el-form-item label="SEO标题" prop="seoTitle">
            <el-input v-model="pageForm.seoTitle" placeholder="SEO标题"></el-input>
          </el-form-item>
          <el-form-item label="SEO描述" prop="seoDesc">
            <el-input type="textarea" v-model="pageForm.seoDesc" :rows="3" placeholder="SEO描述"></el-input>
          </el-form-item>
          <el-form-item label="SEO关键词" prop="seoKeywords">
            <el-input v-model="pageForm.seoKeywords" placeholder="SEO关键词，多个关键词用英文逗号分隔"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="savePage">保存</el-button>
            <el-button v-if="!isEdit" type="success" @click="saveAndPublish">保存并发布</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { 
  getPageList, 
  createPage, 
  updatePage, 
  deletePage, 
  togglePageStatus, 
  previewPage, 
  batchUpdatePages 
} from '@/api/admin/pages'

export default {
  name: 'SitePages',
  data() {
    return {
      loading: false,
      pageList: [],
      selectedPages: [],
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      dialogVisible: false,
      isEdit: false,
      pageForm: {
        id: null,
        title: '',
        path: '',
        type: '',
        content: '',
        seoTitle: '',
        seoDesc: '',
        seoKeywords: '',
        status: '草稿'
      },
      pageRules: {
        title: [
          { required: true, message: '请输入页面标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入页面路径', trigger: 'blur' },
          { pattern: /^\/.*/, message: '路径必须以 / 开头', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择页面类型', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    // 打开页面编辑弹窗
    openPageDialog(row) {
      this.isEdit = !!row;
      if (row) {
        this.pageForm = JSON.parse(JSON.stringify(row));
      } else {
        this.pageForm = {
          id: null,
          title: '',
          path: '',
          type: '',
          content: '',
          seoTitle: '',
          seoDesc: '',
          seoKeywords: '',
          status: '草稿'
        };
      }
      this.dialogVisible = true;
    },

    // 编辑页面
    editPage(row) {
      this.openPageDialog(row);
    },

    // 保存页面
    async savePage() {
      try {
        const valid = await this.$refs.pageFormRef.validate()
        if (valid) {
          this.loading = true
          try {
            if (this.isEdit) {
              await updatePage(this.pageForm.id, this.pageForm)
              this.$message.success('页面编辑成功')
            } else {
              await createPage(this.pageForm)
              this.$message.success('页面创建成功')
            }
            this.dialogVisible = false
            this.loadPages()
          } catch (error) {
            this.$message.error(error.message || '操作失败')
          } finally {
            this.loading = false
          }
        }
      } catch (error) {
        // 表单验证失败
      }
    },

    // 保存并发布
    saveAndPublish() {
      this.$refs.pageFormRef.validate((valid) => {
        if (valid) {
          this.pageForm.status = '已发布';
          this.savePage();
        }
      });
    },

    // 预览页面
    async previewPage(row) {
      try {
        const response = await previewPage(row.id)
        // 在新窗口预览页面
        const previewWindow = window.open('', '_blank')
        previewWindow.document.write(response.data.html || '<div>预览内容</div>')
      } catch (error) {
        this.$message.error('预览失败：' + (error.message || '未知错误'))
      }
    },

    // 切换页面状态
    async toggleStatus(row) {
      const newStatus = row.status === '已发布' ? '草稿' : '已发布'
      const actionText = newStatus === '已发布' ? '发布' : '下线'
      
      try {
        await this.$confirm(`确认要${actionText}该页面吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.loading = true
        try {
          await togglePageStatus(row.id, { status: newStatus })
          this.$message.success(`页面${actionText}成功`)
          this.loadPages()
        } catch (error) {
          this.$message.error(error.message || '操作失败')
        } finally {
          this.loading = false
        }
      } catch {
        // 用户取消操作
      }
    },

    // 删除页面
    async deletePage(row) {
      try {
        await this.$confirm('确认要删除该页面吗? 删除后不可恢复!', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })
        
        this.loading = true
        try {
          await deletePage(row.id)
          this.$message.success('页面删除成功')
          this.loadPages()
        } catch (error) {
          this.$message.error(error.message || '删除失败')
        } finally {
          this.loading = false
        }
      } catch {
        // 用户取消操作
      }
    },

    // 批量编辑
    async batchEdit() {
      if (this.selectedPages.length === 0) {
        this.$message.warning('请至少选择一个页面')
        return
      }
      
      try {
        await this.$confirm('确认要批量更新选中的页面吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.loading = true
        try {
          const ids = this.selectedPages.map(page => page.id)
          await batchUpdatePages({ ids, status: '已发布' })
          this.$message.success('批量更新成功')
          this.loadPages()
        } catch (error) {
          this.$message.error(error.message || '批量更新失败')
        } finally {
          this.loading = false
        }
      } catch {
        // 用户取消操作
      }
    },

    // 根据类型获取标签样式
    getTypeStyle(type) {
      const styleMap = {
        '首页': 'danger',
        '内容页': 'success',
        '列表页': 'primary',
        '表单页': 'warning',
        '登录页': 'info'
      };
      return styleMap[type] || '';
    },

    // 表格多选变化事件
    handleSelectionChange(selection) {
      this.selectedPages = selection;
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadPages();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadPages();
    },

    // 加载页面列表
    async loadPages() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }
        const response = await getPageList(params)
        if (response.code === 200) {
          this.pageList = response.data.list || []
          this.totalItems = response.data.total || 0
        } else {
          this.$message.error(response.message || '获取页面列表失败')
        }
      } catch (error) {
        this.$message.error(error.message || '网络错误')
        this.pageList = []
        this.totalItems = 0
      } finally {
        this.loading = false
      }
    },

    // 关闭对话框前的回调
    handleDialogClose(done) {
      this.$confirm('确认关闭？未保存的内容将会丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done();
      }).catch(() => {});
    }
  },
  mounted() {
    this.loadPages();
  }
}
</script>

<style scoped>
.content-box {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.operation-header {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 300px;
}
.input-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
