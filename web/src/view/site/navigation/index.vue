<template>
  <div>
    <h2>导航管理</h2>
    <div class="content-box">
      <div class="operation-header">
        <el-button type="primary" @click="addNavigationItem">添加导航项</el-button>
        <el-button type="success" @click="saveOrder">保存排序</el-button>
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
            ></el-cascader>
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
            <el-button type="primary" @click="saveNavItem">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SiteNavigation',
  data() {
    return {
      navigationData: [
        {
          id: 1,
          name: '首页',
          url: '/',
          icon: 'House',
          visible: true,
          newWindow: false,
          children: []
        },
        {
          id: 2,
          name: '产品服务',
          url: '/products',
          icon: 'Goods',
          visible: true,
          newWindow: false,
          children: [
            {
              id: 21,
              name: '解决方案',
              url: '/solutions',
              icon: 'SetUp',
              visible: true,
              newWindow: false,
              children: []
            },
            {
              id: 22,
              name: '成功案例',
              url: '/cases',
              icon: 'Star',
              visible: true,
              newWindow: false,
              children: []
            }
          ]
        },
        {
          id: 3,
          name: '关于我们',
          url: '/about',
          icon: 'InfoFilled',
          visible: true,
          newWindow: false,
          children: [
            {
              id: 31,
              name: '公司简介',
              url: '/about/company',
              icon: 'Office',
              visible: true,
              newWindow: false,
              children: []
            },
            {
              id: 32,
              name: '联系我们',
              url: '/contact',
              icon: 'Phone',
              visible: true,
              newWindow: false,
              children: []
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      dialogVisible: false,
      isEdit: false,
      navForm: {
        id: null,
        name: '',
        url: '',
        icon: 'Menu',
        parentId: null,
        visible: true,
        newWindow: false
      },
      navRules: {
        name: [
          { required: true, message: '请输入导航名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入链接地址', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    navigationTree() {
      // 转换成cascader需要的格式
      return [{
        id: 0,
        name: '顶级导航',
        children: this.navigationData.map(item => this.convertToTree(item))
      }];
    }
  },
  methods: {
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
        newWindow: false
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
        parentId: this.findParentId(data.id),
        visible: data.visible,
        newWindow: data.newWindow
      };
      this.dialogVisible = true;
    },

    // 查找父级ID
    findParentId(id, navData = this.navigationData) {
      for (const item of navData) {
        if (item.children && item.children.length) {
          for (const child of item.children) {
            if (child.id === id) {
              return item.id;
            }
            if (child.children && child.children.length) {
              const foundId = this.findParentId(id, [child]);
              if (foundId) return foundId;
            }
          }
        }
      }
      return null;
    },

    // 递归生成cascader数据结构
    convertToTree(nav) {
      const result = {
        id: nav.id,
        name: nav.name
      };
      
      if (nav.children && nav.children.length) {
        result.children = nav.children.map(item => this.convertToTree(item));
      }
      
      return result;
    },

    // 保存导航项
    saveNavItem() {
      this.$refs.navFormRef.validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            // 修改现有导航项
            this.updateNavItem(this.navForm);
          } else {
            // 添加新导航项
            this.createNavItem(this.navForm);
          }
          this.dialogVisible = false;
          this.$message.success('保存成功');
        }
      });
    },

    // 创建导航项
    createNavItem(formData) {
      const newItem = {
        id: Date.now(), // 使用时间戳作为临时ID
        name: formData.name,
        url: formData.url,
        icon: formData.icon,
        visible: formData.visible,
        newWindow: formData.newWindow,
        children: []
      };
      
      if (formData.parentId) {
        // 有父级，添加到父级的children中
        this.addToParent(this.navigationData, formData.parentId, newItem);
      } else {
        // 顶级导航
        this.navigationData.push(newItem);
      }
    },

    // 添加到父级节点
    addToParent(navData, parentId, newItem) {
      for (const item of navData) {
        if (item.id === parentId) {
          item.children.push(newItem);
          return true;
        }
        if (item.children && item.children.length) {
          const added = this.addToParent(item.children, parentId, newItem);
          if (added) return true;
        }
      }
      return false;
    },

    // 更新导航项
    updateNavItem(formData) {
      const updateItem = node => {
        if (node.id === formData.id) {
          node.name = formData.name;
          node.url = formData.url;
          node.icon = formData.icon;
          node.visible = formData.visible;
          node.newWindow = formData.newWindow;
          return true;
        }
        return false;
      };

      const traverse = (navData) => {
        for (const item of navData) {
          if (updateItem(item)) {
            return true;
          }
          if (item.children && item.children.length) {
            const updated = traverse(item.children);
            if (updated) return true;
          }
        }
        return false;
      };

      traverse(this.navigationData);
    },

    // 删除导航项
    removeNav(node, data) {
      this.$confirm('确认删除此导航项吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        if (index !== -1) {
          children.splice(index, 1);
        }
        this.$message.success('导航项已删除');
      }).catch(() => {
        // 取消删除
      });
    },

    // 保存排序
    saveOrder() {
      this.$message.success('导航排序已保存');
    },

    // 拖拽结束处理
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      this.$message.info('导航顺序已更改，请记得保存');
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
</style>
