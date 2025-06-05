<template>
  <div>
    <h2>组件管理</h2>
    <div class="content-box">
      <div class="operation-header">
        <el-button type="primary" @click="openComponentDialog()">新增组件</el-button>
        <el-button type="warning" @click="importComponent">导入组件</el-button>
        <el-select v-model="typeFilter" placeholder="组件类型" style="width: 150px; margin-left: 20px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="轮播图" value="slider"></el-option>
          <el-option label="表单" value="form"></el-option>
          <el-option label="导航" value="nav"></el-option>
          <el-option label="内容区" value="content"></el-option>
          <el-option label="页脚" value="footer"></el-option>
        </el-select>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="(item, index) in filteredComponents" :key="item.id">
          <el-card class="component-card">
            <div class="component-preview">
              <img :src="item.thumbnail" class="component-thumbnail" />
              <div class="component-actions">
                <el-button size="small" type="primary" @click="editComponent(item)">编辑</el-button>
                <el-button size="small" type="success" @click="previewComponent(item)">预览</el-button>
                <el-button size="small" type="danger" @click="deleteComponent(item)">删除</el-button>
              </div>
            </div>
            <div class="component-info">
              <h3>{{ item.name }}</h3>
              <el-tag size="small" :type="getTypeStyle(item.type)">{{ item.type }}</el-tag>
              <p class="component-desc">{{ item.description }}</p>
              <div class="component-meta">
                <span>更新时间: {{ item.updatedAt }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="pagination-container" v-if="totalItems > 0">
        <el-pagination
          v-model:current-page="currentPage"
          :page-sizes="[6, 12, 24, 48]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>

      <!-- 组件编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑组件' : '新增组件'"
        width="70%"
        :before-close="handleDialogClose"
      >
        <el-form :model="componentForm" :rules="componentRules" ref="componentFormRef" label-width="100px">
          <el-form-item label="组件名称" prop="name">
            <el-input v-model="componentForm.name" placeholder="请输入组件名称"></el-input>
          </el-form-item>
          <el-form-item label="组件类型" prop="type">
            <el-select v-model="componentForm.type" placeholder="请选择组件类型" style="width: 100%">
              <el-option label="轮播图" value="slider"></el-option>
              <el-option label="表单" value="form"></el-option>
              <el-option label="导航" value="nav"></el-option>
              <el-option label="内容区" value="content"></el-option>
              <el-option label="页脚" value="footer"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="缩略图" prop="thumbnail">
            <el-upload
              class="component-thumbnail-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleThumbnailChange"
            >
              <img v-if="thumbnailUrl" :src="thumbnailUrl" class="uploaded-thumbnail" />
              <el-icon v-else class="component-thumbnail-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              type="textarea"
              v-model="componentForm.description"
              :rows="3"
              placeholder="请输入组件描述"
            ></el-input>
          </el-form-item>
          <el-form-item label="代码" prop="code">
            <div class="code-editor-container">
              <!-- 这里可以集成代码编辑器组件 -->
              <el-input
                type="textarea"
                v-model="componentForm.code"
                :rows="10"
                placeholder="请输入组件代码"
              ></el-input>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveComponent">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SiteComponents',
  data() {
    return {
      components: [
        {
          id: 1,
          name: '首页轮播图',
          type: 'slider',
          description: '网站首页顶部的图片轮播，可配置多张图片和链接',
          thumbnail: 'https://via.placeholder.com/300x200?text=Slider',
          code: '<div class="slider">...</div>',
          updatedAt: '2025-05-28 14:30:22'
        },
        {
          id: 2,
          name: '联系表单',
          type: 'form',
          description: '包含姓名、邮箱、电话和留言的联系我们表单',
          thumbnail: 'https://via.placeholder.com/300x200?text=Form',
          code: '<form class="contact-form">...</form>',
          updatedAt: '2025-06-01 09:15:40'
        },
        {
          id: 3,
          name: '页脚导航',
          type: 'footer',
          description: '网站底部的导航和版权信息',
          thumbnail: 'https://via.placeholder.com/300x200?text=Footer',
          code: '<footer class="site-footer">...</footer>',
          updatedAt: '2025-05-20 16:45:33'
        },
        {
          id: 4,
          name: '产品特性展示',
          type: 'content',
          description: '展示产品特性的图文内容区块',
          thumbnail: 'https://via.placeholder.com/300x200?text=Content',
          code: '<section class="features">...</section>',
          updatedAt: '2025-06-02 11:22:18'
        },
        {
          id: 5,
          name: '顶部导航',
          type: 'nav',
          description: '响应式的网站顶部主导航栏',
          thumbnail: 'https://via.placeholder.com/300x200?text=Navigation',
          code: '<nav class="main-nav">...</nav>',
          updatedAt: '2025-05-15 10:30:45'
        },
        {
          id: 6,
          name: '客户评价轮播',
          type: 'slider',
          description: '展示客户评价的滑动切换组件',
          thumbnail: 'https://via.placeholder.com/300x200?text=Testimonials',
          code: '<div class="testimonials-slider">...</div>',
          updatedAt: '2025-06-03 14:20:33'
        }
      ],
      typeFilter: '',
      currentPage: 1,
      pageSize: 6,
      totalItems: 6,
      dialogVisible: false,
      isEdit: false,
      componentForm: {
        id: null,
        name: '',
        type: '',
        description: '',
        thumbnail: '',
        code: ''
      },
      thumbnailUrl: '',
      componentRules: {
        name: [
          { required: true, message: '请输入组件名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择组件类型', trigger: 'change' }
        ],
        code: [
          { required: true, message: '请输入组件代码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    filteredComponents() {
      if (!this.typeFilter) {
        return this.components;
      }
      return this.components.filter(item => item.type === this.typeFilter);
    }
  },
  methods: {
    // 打开组件编辑对话框
    openComponentDialog(component) {
      this.isEdit = !!component;
      if (component) {
        this.componentForm = JSON.parse(JSON.stringify(component));
        this.thumbnailUrl = component.thumbnail;
      } else {
        this.componentForm = {
          id: null,
          name: '',
          type: '',
          description: '',
          thumbnail: '',
          code: ''
        };
        this.thumbnailUrl = '';
      }
      this.dialogVisible = true;
    },

    // 编辑组件
    editComponent(component) {
      this.openComponentDialog(component);
    },

    // 预览组件
    previewComponent(component) {
      // 在新窗口预览组件
      this.$message.info('组件预览功能待实现');
    },

    // 删除组件
    deleteComponent(component) {
      this.$confirm('确认要删除该组件吗？删除后不可恢复!', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除
        const index = this.components.findIndex(item => item.id === component.id);
        if (index !== -1) {
          this.components.splice(index, 1);
          this.totalItems--;
        }
        this.$message.success('组件已删除');
      }).catch(() => {
        // 取消操作
      });
    },

    // 导入组件
    importComponent() {
      this.$message.info('组件导入功能待实现');
    },

    // 保存组件
    saveComponent() {
      this.$refs.componentFormRef.validate((valid) => {
        if (valid) {
          if (this.thumbnailUrl) {
            this.componentForm.thumbnail = this.thumbnailUrl;
          }
          
          if (this.isEdit) {
            // 更新现有组件
            const index = this.components.findIndex(item => item.id === this.componentForm.id);
            if (index !== -1) {
              this.components[index] = {
                ...this.componentForm,
                updatedAt: new Date().toLocaleString()
              };
            }
            this.$message.success('组件更新成功');
          } else {
            // 添加新组件
            this.components.push({
              id: Date.now(),
              ...this.componentForm,
              updatedAt: new Date().toLocaleString()
            });
            this.totalItems++;
            this.$message.success('组件添加成功');
          }
          this.dialogVisible = false;
        }
      });
    },

    // 根据类型获取标签样式
    getTypeStyle(type) {
      const styleMap = {
        'slider': 'primary',
        'form': 'success',
        'nav': 'warning',
        'content': 'info',
        'footer': 'danger'
      };
      return styleMap[type] || '';
    },

    // 处理缩略图上传
    handleThumbnailChange(file) {
      // 这里可以处理实际的图片上传，现在只是模拟
      this.thumbnailUrl = URL.createObjectURL(file.raw);
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val;
      // 此处应该有加载数据的逻辑
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      // 此处应该有加载数据的逻辑
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
    // 组件加载时的操作
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
.component-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}
.component-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}
.component-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.component-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.component-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: space-around;
  opacity: 0;
  transition: opacity 0.3s;
}
.component-preview:hover .component-actions {
  opacity: 1;
}
.component-info {
  padding: 10px 0;
}
.component-info h3 {
  margin: 5px 0;
  font-size: 16px;
}
.component-desc {
  font-size: 12px;
  color: #666;
  margin: 8px 0;
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.component-meta {
  font-size: 12px;
  color: #999;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.code-editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.component-thumbnail-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 100px;
}
.component-thumbnail-uploader:hover {
  border-color: #409EFF;
}
.component-thumbnail-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.uploaded-thumbnail {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style>
