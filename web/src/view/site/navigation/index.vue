<template>
  <div>
    <h2>导航管理</h2>
    <div class="content-box">
      <div class="operation-header">
        <el-button type="primary" @click="addNavigationItem">添加导航项</el-button>
        <el-button type="success" @click="saveOrder">保存排序</el-button>
        <el-button type="info" @click="exportNavigation">导出导航</el-button>
        <el-button type="warning" @click="showImportDialog">导入导航</el-button>
      </div>

      <el-alert
        title="拖拽导航项可以调整顺序，修改后请点击"保存排序"按钮"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px;"
      ></el-alert>

      <div class="nav-tree-container">
        <el-tree
          ref="navTree"
          :data="navigationData"
          node-key="id"
          default-expand-all
          :props="defaultProps"
          draggable
          @node-drag-end="handleDragEnd"
          v-loading="loading"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <span>
                <el-icon><component :is="data.icon || 'Menu'"></component></el-icon>
                {{ node.label }}
              </span>
              <span>
                <el-tag size="small" :type="data.visible ? 'success' : 'info'">
                  {{ data.visible ? '显示' : '隐藏' }}
                </el-tag>
                <el-button link type="primary" @click.stop="editNav(data)">编辑</el-button>
                <el-switch 
                  v-model="data.visible" 
                  @change="toggleVisibility(data)"
                  size="small"
                  style="margin: 0 8px;"
                ></el-switch>
                <el-button link type="danger" @click.stop="removeNav(node, data)">删除</el-button>
              </span>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 编辑导航项对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑导航项' : '添加导航项'"
        width="50%"
      >
        <el-form :model="navForm" :rules="navRules" ref="navFormRef" label-width="100px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="navForm.name" placeholder="请输入导航名称"></el-input>
          </el-form-item>
          <el-form-item label="链接" prop="url">
            <el-input v-model="navForm.url" placeholder="请输入链接地址，内部页面以/开头"></el-input>
          </el-form-item>
          <el-form-item label="图标" prop="icon">
            <el-select v-model="navForm.icon" placeholder="选择图标" style="width: 100%">
              <el-option label="菜单" value="Menu"></el-option>
              <el-option label="主页" value="House"></el-option>
              <el-option label="设置" value="Setting"></el-option>
              <el-option label="用户" value="User"></el-option>
              <el-option label="文件" value="Document"></el-option>
              <el-option label="商品" value="Goods"></el-option>
              <el-option label="配置" value="SetUp"></el-option>
              <el-option label="星标" value="Star"></el-option>
              <el-option label="信息" value="InfoFilled"></el-option>
              <el-option label="办公" value="Office"></el-option>
              <el-option label="电话" value="Phone"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="父级" prop="parentId">
            <el-cascader
              v-model="navForm.parentId"
              :options="navigationTree"
              :props="{ 
                checkStrictly: true,
                emitPath: false,
                label: 'name',
                value: 'id',
                children: 'children'
              }"
              clearable
              placeholder="顶级导航"
              style="width: 100%"
            >            </el-cascader>
          </el-form-item>
          <el-form-item label="排序值">
            <el-input-number v-model="navForm.sortOrder" :min="0" style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item label="在新窗口打开">
            <el-switch v-model="navForm.newWindow"></el-switch>
          </el-form-item>
          <el-form-item label="显示">
            <el-switch v-model="navForm.visible"></el-switch>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveNavItem" :loading="submitting">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 导入对话框 -->
      <el-dialog
        v-model="importDialogVisible"
        title="导入导航数据"
        width="50%"
      >
        <el-form>
          <el-form-item label="导航类型">
            <el-select v-model="importForm.type" placeholder="选择导航类型" style="width: 100%">
              <el-option label="主导航" value="main"></el-option>
              <el-option label="底部导航" value="footer"></el-option>
              <el-option label="侧边导航" value="sidebar"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="导航数据">
            <el-input 
              v-model="importForm.data" 
              type="textarea" 
              :rows="10"
              placeholder="请粘贴导航JSON数据"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="importDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="importNavigation" :loading="importing">导入</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { 
  getNavigationTree, 
  createNavigationItem, 
  updateNavigationItem, 
  deleteNavigationItem,
  updateNavigationOrder,
  toggleNavigationVisibility,
  exportNavigationTree,
  importNavigationTree
} from '@/api/admin/navigation'

export default {
  name: 'SiteNavigation',
  data() {
    return {
      loading: false,
      submitting: false,
      importing: false,
      navigationData: [],
      currentNavType: 'main', // main, footer, sidebar
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      dialogVisible: false,
      importDialogVisible: false,
      isEdit: false,
      navForm: {
        id: null,
        name: '',
        url: '',
        icon: 'Menu',
        parentId: null,
        visible: true,
        newWindow: false,
        sortOrder: 0,
        type: 'main'
      },
      importForm: {
        type: 'main',
        data: ''
      },
      navRules: {
        name: [
          { required: true, message: '请输入导航名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入链接地址', trigger: 'blur' }
        ]
      },
      orderChanged: false
    }
  },
  computed: {
    navigationTree() {
      // 转换成cascader需要的格式
      const convertToTree = (nav) => {
        const result = {
          id: nav.id,
          name: nav.name
        };
        
        if (nav.children && nav.children.length) {
          result.children = nav.children.map(item => convertToTree(item));
        }
        
        return result;
      };

      return [{
        id: 0,
        name: '顶级导航',
        children: this.navigationData.map(item => convertToTree(item))
      }];
    }
  },
  mounted() {
    this.loadNavigationData();
  },
  methods: {
    // 加载导航数据
    async loadNavigationData() {
      this.loading = true;
      try {
        const response = await getNavigationTree({ type: this.currentNavType });
        if (response.code === 200) {
          this.navigationData = response.data || [];
        } else {
          this.$message.error(response.message || '获取导航数据失败');
        }
      } catch (error) {
        console.error('获取导航数据失败:', error);
        this.$message.error('获取导航数据失败');
      } finally {
        this.loading = false;
      }
    },

    // 添加导航项
    addNavigationItem() {
      this.isEdit = false;
      this.navForm = {
        id: null,
        name: '',
        url: '',
        icon: 'Menu',
        parentId: null,
        visible: true,
        newWindow: false,
        sortOrder: 0,
        type: this.currentNavType
      };
      this.dialogVisible = true;
    },

    // 编辑导航项
    editNav(data) {
      this.isEdit = true;
      this.navForm = {
        id: data.id,
        name: data.name,
        url: data.url,
        icon: data.icon,
        parentId: data.parentId,
        visible: data.visible,
        newWindow: data.newWindow,
        sortOrder: data.sortOrder,
        type: data.type
      };
      this.dialogVisible = true;
    },



    // 保存导航项
    async saveNavItem() {
      const isValid = await this.$refs.navFormRef.validate();
      if (!isValid) return;

      this.submitting = true;
      try {
        if (this.isEdit) {
          // 更新现有导航项
          const response = await updateNavigationItem(this.navForm.id, this.navForm);
          if (response.code === 200) {
            this.$message.success('更新导航项成功');
            this.loadNavigationData();
            this.dialogVisible = false;
          } else {
            this.$message.error(response.message || '更新导航项失败');
          }
        } else {
          // 创建新导航项
          const response = await createNavigationItem(this.navForm);
          if (response.code === 200) {
            this.$message.success('创建导航项成功');
            this.loadNavigationData();
            this.dialogVisible = false;
          } else {
            this.$message.error(response.message || '创建导航项失败');
          }
        }
      } catch (error) {
        console.error('保存导航项失败:', error);
        this.$message.error('保存导航项失败');
      } finally {
        this.submitting = false;
      }
    },



    // 删除导航项
    removeNav(node, data) {
      this.$confirm('确认删除此导航项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteNavigationItem(data.id);
          if (response.code === 200) {
            this.$message.success('导航项已删除');
            this.loadNavigationData();
          } else {
            this.$message.error(response.message || '删除导航项失败');
          }
        } catch (error) {
          console.error('删除导航项失败:', error);
          this.$message.error('删除导航项失败');
        }
      }).catch(() => {
        // 取消删除
      });
    },

    // 切换可见性
    async toggleVisibility(data) {
      try {
        const response = await toggleNavigationVisibility(data.id, { visible: data.visible });
        if (response.code === 200) {
          this.$message.success('导航项状态已更新');
        } else {
          this.$message.error(response.message || '更新导航项状态失败');
          // 回滚状态
          data.visible = !data.visible;
        }
      } catch (error) {
        console.error('更新导航项状态失败:', error);
        this.$message.error('更新导航项状态失败');
        // 回滚状态
        data.visible = !data.visible;
      }
    },

    // 保存排序
    async saveOrder() {
      if (!this.orderChanged) {
        this.$message.info('排序未发生变化');
        return;
      }

      try {
        // 构建排序数据
        const orderData = this.buildOrderData(this.navigationData);
        const response = await updateNavigationOrder({
          type: this.currentNavType,
          orderData
        });
        
        if (response.code === 200) {
          this.$message.success('导航排序已保存');
          this.orderChanged = false;
        } else {
          this.$message.error(response.message || '保存导航排序失败');
        }
      } catch (error) {
        console.error('保存导航排序失败:', error);
        this.$message.error('保存导航排序失败');
      }
    },

    // 构建排序数据
    buildOrderData(navItems, parentId = null) {
      let orderData = [];
      navItems.forEach((item, index) => {
        orderData.push({
          id: item.id,
          parentId: parentId,
          order: index
        });
        
        if (item.children && item.children.length > 0) {
          orderData = orderData.concat(this.buildOrderData(item.children, item.id));
        }
      });
      return orderData;
    },

    // 拖拽结束处理
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      this.$message.info('导航顺序已更改，请记得保存');
      this.orderChanged = true;
    },

    // 导出导航
    async exportNavigation() {
      try {
        const response = await exportNavigationTree({ type: this.currentNavType });
        // 创建下载链接
        const blob = new Blob([response], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `navigation_${this.currentNavType}_${new Date().getTime()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.$message.success('导航数据导出成功');
      } catch (error) {
        console.error('导出导航数据失败:', error);
        this.$message.error('导出导航数据失败');
      }
    },

    // 显示导入对话框
    showImportDialog() {
      this.importForm = {
        type: this.currentNavType,
        data: ''
      };
      this.importDialogVisible = true;
    },

    // 导入导航
    async importNavigation() {
      if (!this.importForm.data.trim()) {
        this.$message.error('请输入导航数据');
        return;
      }

      this.importing = true;
      try {
        const response = await importNavigationTree(this.importForm);
        if (response.code === 200) {
          this.$message.success('导入导航数据成功');
          this.importDialogVisible = false;
          this.loadNavigationData();
        } else {
          this.$message.error(response.message || '导入导航数据失败');
        }
      } catch (error) {
        console.error('导入导航数据失败:', error);
        this.$message.error('导入导航数据失败');
      } finally {
        this.importing = false;
      }
    }
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
.nav-tree-container {
  margin-top: 20px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}
.custom-tree-node span:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
}
.custom-tree-node span:last-child {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
