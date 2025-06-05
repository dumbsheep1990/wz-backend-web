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
export default {
  name: 'SitePages',
  data() {
    return {
      loading: false,
      pageList: [
        {
          id: 1,
          title: '首页',
          path: '/',
          type: '首页',
          updatedAt: '2025-05-30 15:30:22',
          status: '已发布'
        },
        {
          id: 2,
          title: '关于我们',
          path: '/about',
          type: '内容页',
          updatedAt: '2025-05-28 10:12:05',
          status: '已发布'
        },
        {
          id: 3,
          title: '服务项目',
          path: '/services',
          type: '列表页',
          updatedAt: '2025-05-25 09:45:33',
          status: '已发布'
        },
        {
          id: 4,
          title: '联系我们',
          path: '/contact',
          type: '表单页',
          updatedAt: '2025-06-01 16:20:10',
          status: '草稿'
        }
      ],
      selectedPages: [],
      currentPage: 1,
      pageSize: 10,
      totalItems: 4,
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
    savePage() {
      this.$refs.pageFormRef.validate((valid) => {
        if (valid) {
          this.loading = true;
          setTimeout(() => {
            if (this.isEdit) {
              // 模拟编辑页面
              const index = this.pageList.findIndex(item => item.id === this.pageForm.id);
              if (index !== -1) {
                this.pageList[index] = {
                  ...this.pageForm,
                  updatedAt: new Date().toLocaleString()
                };
              }
              this.$message.success('页面编辑成功');
            } else {
              // 模拟添加页面
              this.pageList.push({
                id: Date.now(),
                ...this.pageForm,
                updatedAt: new Date().toLocaleString()
              });
              this.totalItems++;
              this.$message.success('页面创建成功');
            }
            this.dialogVisible = false;
            this.loading = false;
          }, 500);
        }
      });
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
    previewPage(row) {
      // 在新窗口预览页面
      this.$message.info('页面预览功能待实现');
    },

    // 切换页面状态
    toggleStatus(row) {
      const newStatus = row.status === '已发布' ? '草稿' : '已发布';
      const actionText = newStatus === '已发布' ? '发布' : '下线';
      
      this.$confirm(`确认要${actionText}该页面吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟更新状态
        const index = this.pageList.findIndex(item => item.id === row.id);
        if (index !== -1) {
          this.pageList[index].status = newStatus;
          this.pageList[index].updatedAt = new Date().toLocaleString();
        }
        this.$message.success(`页面${actionText}成功`);
      }).catch(() => {
        // 取消操作
      });
    },

    // 删除页面
    deletePage(row) {
      this.$confirm('确认要删除该页面吗? 删除后不可恢复!', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        // 模拟删除
        const index = this.pageList.findIndex(item => item.id === row.id);
        if (index !== -1) {
          this.pageList.splice(index, 1);
          this.totalItems--;
        }
        this.$message.success('页面删除成功');
      }).catch(() => {
        // 取消操作
      });
    },

    // 批量编辑
    batchEdit() {
      if (this.selectedPages.length === 0) {
        this.$message.warning('请至少选择一个页面');
        return;
      }
      this.$message.info('批量编辑功能待实现');
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
    loadPages() {
      this.loading = true;
      // 模拟异步加载
      setTimeout(() => {
        this.loading = false;
      }, 500);
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
