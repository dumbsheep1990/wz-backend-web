<template>
  <div>
    <h2>链接管理</h2>
    <div class="content-box">
      <div class="operation-header">
        <el-button type="primary" @click="openLinkDialog()">添加链接</el-button>
        <el-button type="warning" @click="batchVerify">批量检测</el-button>
        <el-select v-model="categoryFilter" placeholder="分类筛选" style="width: 150px; margin-left: 20px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="友情链接" value="friendship"></el-option>
          <el-option label="合作伙伴" value="partner"></el-option>
          <el-option label="资源链接" value="resources"></el-option>
          <el-option label="社交媒体" value="social"></el-option>
        </el-select>
      </div>

      <el-table 
        :data="filteredLinks" 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="链接名称" width="180"></el-table-column>
        <el-table-column prop="url" label="URL" width="220">
          <template #default="scope">
            <el-link :href="scope.row.url" target="_blank" type="primary">{{ scope.row.url }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryStyle(scope.row.category)">{{ getCategoryName(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '有效' : '失效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button link type="primary" @click="editLink(scope.row)">编辑</el-button>
            <el-button link type="success" @click="verifyLink(scope.row)">检测</el-button>
            <el-button link type="danger" @click="deleteLink(scope.row)">删除</el-button>
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

      <!-- 链接编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑链接' : '添加链接'"
        width="50%"
      >
        <el-form :model="linkForm" :rules="linkRules" ref="linkFormRef" label-width="100px">
          <el-form-item label="链接名称" prop="name">
            <el-input v-model="linkForm.name" placeholder="请输入链接名称"></el-input>
          </el-form-item>
          <el-form-item label="链接URL" prop="url">
            <el-input v-model="linkForm.url" placeholder="请输入链接URL"></el-input>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="linkForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option label="友情链接" value="friendship"></el-option>
              <el-option label="合作伙伴" value="partner"></el-option>
              <el-option label="资源链接" value="resources"></el-option>
              <el-option label="社交媒体" value="social"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="图标" prop="icon">
            <el-input v-model="linkForm.icon" placeholder="请输入图标URL或者Font Awesome类名"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input type="textarea" v-model="linkForm.description" :rows="3" placeholder="请输入链接描述"></el-input>
          </el-form-item>
          <el-form-item label="排序值" prop="sort">
            <el-input-number v-model="linkForm.sort" :min="0" :max="999" style="width: 180px;"></el-input-number>
            <div class="form-tip">数值越小，排序越靠前</div>
          </el-form-item>
          <el-form-item label="在新窗口打开">
            <el-switch v-model="linkForm.newWindow"></el-switch>
          </el-form-item>
          <el-form-item label="启用">
            <el-switch v-model="linkForm.isActive"></el-switch>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveLink">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SiteLinks',
  data() {
    return {
      loading: false,
      links: [
        {
          id: 1,
          name: '官方博客',
          url: 'https://blog.example.com',
          category: 'resources',
          icon: 'fa-blog',
          description: '公司官方博客，分享最新动态和技术文章',
          sort: 10,
          newWindow: true,
          isActive: true,
          status: 'active',
          updatedAt: '2025-05-30 15:30:22'
        },
        {
          id: 2,
          name: '合作伙伴A公司',
          url: 'https://partner-a.com',
          category: 'partner',
          icon: 'fa-handshake',
          description: '战略合作伙伴A公司官网',
          sort: 20,
          newWindow: true,
          isActive: true,
          status: 'active',
          updatedAt: '2025-05-28 10:12:05'
        },
        {
          id: 3,
          name: 'GitHub',
          url: 'https://github.com/example',
          category: 'social',
          icon: 'fa-github',
          description: '公司开源项目GitHub页面',
          sort: 30,
          newWindow: true,
          isActive: true,
          status: 'active',
          updatedAt: '2025-06-01 16:20:10'
        },
        {
          id: 4,
          name: '友情链接B站点',
          url: 'https://site-b.org',
          category: 'friendship',
          icon: 'fa-link',
          description: '友情链接B站点',
          sort: 40,
          newWindow: true,
          isActive: false,
          status: 'invalid',
          updatedAt: '2025-05-25 09:45:33'
        },
        {
          id: 5,
          name: 'LinkedIn',
          url: 'https://linkedin.com/company/example',
          category: 'social',
          icon: 'fa-linkedin',
          description: '公司LinkedIn主页',
          sort: 50,
          newWindow: true,
          isActive: true,
          status: 'active',
          updatedAt: '2025-06-02 11:22:18'
        }
      ],
      categoryFilter: '',
      selectedLinks: [],
      currentPage: 1,
      pageSize: 10,
      totalItems: 5,
      dialogVisible: false,
      isEdit: false,
      linkForm: {
        id: null,
        name: '',
        url: '',
        category: '',
        icon: '',
        description: '',
        sort: 0,
        newWindow: true,
        isActive: true
      },
      linkRules: {
        name: [
          { required: true, message: '请输入链接名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入链接URL', trigger: 'blur' },
          { pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, message: '请输入有效的URL', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    filteredLinks() {
      if (!this.categoryFilter) {
        return this.links;
      }
      return this.links.filter(item => item.category === this.categoryFilter);
    }
  },
  methods: {
    // 打开链接编辑对话框
    openLinkDialog(link) {
      this.isEdit = !!link;
      if (link) {
        this.linkForm = JSON.parse(JSON.stringify(link));
      } else {
        this.linkForm = {
          id: null,
          name: '',
          url: 'https://',
          category: '',
          icon: '',
          description: '',
          sort: 0,
          newWindow: true,
          isActive: true
        };
      }
      this.dialogVisible = true;
    },

    // 编辑链接
    editLink(link) {
      this.openLinkDialog(link);
    },

    // 检测链接是否有效
    verifyLink(link) {
      this.loading = true;
      // 模拟异步检测
      setTimeout(() => {
        this.loading = false;

        // 随机模拟检测结果
        const isValid = Math.random() > 0.2;
        const index = this.links.findIndex(item => item.id === link.id);
        
        if (index !== -1) {
          this.links[index].status = isValid ? 'active' : 'invalid';
          this.links[index].updatedAt = new Date().toLocaleString();
        }
        
        this.$message({
          type: isValid ? 'success' : 'error',
          message: isValid ? '链接检测正常' : '链接检测失败，请检查URL是否有效'
        });
      }, 1000);
    },

    // 批量检测链接
    batchVerify() {
      if (this.selectedLinks.length === 0) {
        this.$message.warning('请先选择要检测的链接');
        return;
      }

      this.loading = true;
      // 模拟异步批量检测
      setTimeout(() => {
        this.loading = false;

        let successCount = 0;
        let failCount = 0;

        this.selectedLinks.forEach(link => {
          const isValid = Math.random() > 0.2;
          const index = this.links.findIndex(item => item.id === link.id);
          
          if (index !== -1) {
            this.links[index].status = isValid ? 'active' : 'invalid';
            this.links[index].updatedAt = new Date().toLocaleString();
          }

          if (isValid) {
            successCount++;
          } else {
            failCount++;
          }
        });

        this.$message({
          type: 'info',
          message: `链接检测完成：${successCount} 个有效，${failCount} 个失效`
        });
      }, 1500);
    },

    // 删除链接
    deleteLink(link) {
      this.$confirm('确定要删除此链接吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除
        const index = this.links.findIndex(item => item.id === link.id);
        if (index !== -1) {
          this.links.splice(index, 1);
          this.totalItems--;
        }
        this.$message.success('链接删除成功');
      }).catch(() => {
        // 取消操作
      });
    },

    // 保存链接
    saveLink() {
      this.$refs.linkFormRef.validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            // 更新现有链接
            const index = this.links.findIndex(item => item.id === this.linkForm.id);
            if (index !== -1) {
              this.links[index] = {
                ...this.linkForm,
                status: this.linkForm.isActive ? 'active' : 'invalid',
                updatedAt: new Date().toLocaleString()
              };
            }
            this.$message.success('链接更新成功');
          } else {
            // 添加新链接
            this.links.push({
              id: Date.now(),
              ...this.linkForm,
              status: this.linkForm.isActive ? 'active' : 'invalid',
              updatedAt: new Date().toLocaleString()
            });
            this.totalItems++;
            this.$message.success('链接添加成功');
          }
          this.dialogVisible = false;
        }
      });
    },

    // 获取分类样式
    getCategoryStyle(category) {
      const styleMap = {
        'friendship': 'info',
        'partner': 'success',
        'resources': 'warning',
        'social': 'primary'
      };
      return styleMap[category] || '';
    },

    // 获取分类名称
    getCategoryName(category) {
      const nameMap = {
        'friendship': '友情链接',
        'partner': '合作伙伴',
        'resources': '资源链接',
        'social': '社交媒体'
      };
      return nameMap[category] || category;
    },

    // 表格多选变化事件
    handleSelectionChange(selection) {
      this.selectedLinks = selection;
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadLinks();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadLinks();
    },

    // 加载链接列表
    loadLinks() {
      this.loading = true;
      // 模拟异步加载
      setTimeout(() => {
        this.loading = false;
      }, 300);
    }
  },
  mounted() {
    this.loadLinks();
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
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
