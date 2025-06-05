<template>
  <div>
    <h2>API配置</h2>
    <div class="content-box">
      <!-- API配置内容将在这里实现 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="API密钥管理" name="keys">
          <div class="section-container">
            <div class="operation-header">
              <el-button type="primary" @click="dialogVisible = true">创建新密钥</el-button>
            </div>

            <el-table :data="apiKeys" style="width: 100%">
              <el-table-column prop="name" label="名称" width="180"></el-table-column>
              <el-table-column prop="key" label="密钥" width="220">
                <template #default="scope">
                  <span>{{ hideKey(scope.row.key) }}</span>
                  <el-button link type="primary" @click="copyKey(scope.row.key)">复制</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="created" label="创建时间"></el-table-column>
              <el-table-column prop="expired" label="过期时间"></el-table-column>
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '有效' ? 'success' : 'danger'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button link type="primary" @click="refreshKey(scope.row)">刷新</el-button>
                  <el-button link type="danger" @click="deleteKey(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="接口限流设置" name="rate-limit">
          <div class="section-container">
            <el-form :model="rateLimitForm" label-width="180px">
              <el-form-item label="启用API限流">
                <el-switch v-model="rateLimitForm.enabled" />
              </el-form-item>
              <el-form-item label="默认限流频率(次/分钟)">
                <el-input-number v-model="rateLimitForm.defaultRate" :min="1" :max="1000" />
              </el-form-item>
              <el-form-item label="IP白名单">
                <el-input type="textarea" v-model="rateLimitForm.whiteList" placeholder="每行输入一个IP地址" rows="4" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveRateLimit">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 创建API密钥对话框 -->
      <el-dialog v-model="dialogVisible" title="创建API密钥" width="40%">
        <el-form :model="newKeyForm" label-width="120px">
          <el-form-item label="密钥名称">
            <el-input v-model="newKeyForm.name" placeholder="请输入密钥名称"></el-input>
          </el-form-item>
          <el-form-item label="有效期">
            <el-select v-model="newKeyForm.expiryDays" placeholder="选择有效期">
              <el-option label="30天" :value="30"></el-option>
              <el-option label="90天" :value="90"></el-option>
              <el-option label="180天" :value="180"></el-option>
              <el-option label="365天" :value="365"></el-option>
              <el-option label="永久" :value="-1"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="createKey">创建</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiConfig',
  data() {
    return {
      activeTab: 'keys',
      dialogVisible: false,
      apiKeys: [
        {
          name: '前端开发测试',
          key: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
          created: '2025-05-01 09:30:00',
          expired: '2025-11-01 09:30:00',
          status: '有效'
        },
        {
          name: '移动端应用',
          key: 'q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6',
          created: '2025-04-15 14:20:00',
          expired: '2025-10-15 14:20:00',
          status: '有效'
        }
      ],
      newKeyForm: {
        name: '',
        expiryDays: 90
      },
      rateLimitForm: {
        enabled: true,
        defaultRate: 60,
        whiteList: '127.0.0.1\n192.168.1.100'
      }
    }
  },
  methods: {
    hideKey(key) {
      if (key && key.length > 8) {
        return key.substring(0, 4) + '****' + key.substring(key.length - 4);
      }
      return key;
    },
    copyKey(key) {
      // 复制到剪贴板的实现
      navigator.clipboard.writeText(key).then(() => {
        this.$message.success('API密钥已复制到剪贴板');
      }).catch(() => {
        this.$message.error('复制失败，请手动复制');
      });
    },
    refreshKey(row) {
      this.$confirm('确定要刷新此密钥吗？刷新后原密钥将立即失效。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里实现密钥刷新逻辑
        this.$message.success('密钥已刷新');
      }).catch(() => {
        // 取消操作
      });
    },
    deleteKey(row) {
      this.$confirm('确定要删除此密钥吗？删除后将无法恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里实现密钥删除逻辑
        const index = this.apiKeys.findIndex(item => item.key === row.key);
        if (index !== -1) {
          this.apiKeys.splice(index, 1);
        }
        this.$message.success('密钥已删除');
      }).catch(() => {
        // 取消操作
      });
    },
    createKey() {
      if (!this.newKeyForm.name) {
        this.$message.error('请输入密钥名称');
        return;
      }

      // 模拟创建新密钥
      const newKey = {
        name: this.newKeyForm.name,
        key: this.generateRandomKey(),
        created: new Date().toLocaleString(),
        expired: this.getExpiryDate(this.newKeyForm.expiryDays),
        status: '有效'
      };

      this.apiKeys.push(newKey);
      this.dialogVisible = false;
      this.newKeyForm = {
        name: '',
        expiryDays: 90
      };
      this.$message.success('密钥创建成功');
    },
    generateRandomKey() {
      // 生成随机UUID格式的密钥
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    getExpiryDate(days) {
      if (days === -1) {
        return '永久有效';
      }
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toLocaleString();
    },
    saveRateLimit() {
      // 保存限流设置
      this.$message.success('限流设置保存成功');
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
.section-container {
  margin-top: 10px;
}
.operation-header {
  margin-bottom: 20px;
}
</style>
