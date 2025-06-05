<template>
  <div>
    <h2>缓存管理</h2>
    <div class="content-box">
      <div class="operation-header">
        <el-button type="primary" @click="refreshStats">刷新统计</el-button>
        <el-button type="warning" @click="confirmClearCache('selected')">清除选中缓存</el-button>
        <el-button type="danger" @click="confirmClearCache('all')">清除所有缓存</el-button>
      </div>

      <!-- 缓存统计信息 -->
      <el-card class="stats-card">
        <div class="stats-grid">
          <div class="stats-item">
            <div class="stats-label">总缓存数量</div>
            <div class="stats-value">{{ cacheStats.totalKeys }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">内存占用</div>
            <div class="stats-value">{{ cacheStats.memoryUsage }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">平均访问延迟</div>
            <div class="stats-value">{{ cacheStats.avgLatency }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">命中率</div>
            <div class="stats-value">{{ cacheStats.hitRate }}</div>
          </div>
        </div>
      </el-card>

      <!-- 缓存表格 -->
      <div class="cache-table-container">
        <el-table
          :data="cacheItems"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="key" label="缓存键名" width="300"></el-table-column>
          <el-table-column prop="type" label="类型" width="120"></el-table-column>
          <el-table-column prop="size" label="大小" width="120"></el-table-column>
          <el-table-column prop="ttl" label="过期时间">
            <template #default="scope">
              {{ scope.row.ttl === -1 ? '永不过期' : scope.row.ttl + ' 秒' }}
            </template>
          </el-table-column>
          <el-table-column prop="hitCount" label="命中次数" width="120"></el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" @click="viewCacheValue(scope.row)">查看</el-button>
              <el-button link type="danger" @click="confirmClearCache('single', scope.row.key)">
                删除
              </el-button>
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
      </div>

      <!-- 缓存值查看对话框 -->
      <el-dialog v-model="valueDialogVisible" :title="'缓存值 - ' + selectedCache.key" width="60%">
        <pre v-if="selectedCache.type === 'string'" class="cache-value">{{ selectedCache.value }}</pre>
        <el-tree
          v-else-if="selectedCache.type === 'hash' || selectedCache.type === 'object'"
          :data="formatCacheValue(selectedCache.value)"
          :props="{ label: 'key', children: 'children' }"
          node-key="key"
          default-expand-all
        ></el-tree>
        <el-table
          v-else-if="selectedCache.type === 'list' || selectedCache.type === 'array'"
          :data="formatAsList(selectedCache.value)"
          style="width: 100%"
        >
          <el-table-column prop="index" label="索引" width="120"></el-table-column>
          <el-table-column prop="value" label="值"></el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CacheConfig',
  data() {
    return {
      loading: false,
      cacheStats: {
        totalKeys: 1245,
        memoryUsage: '34.5 MB',
        avgLatency: '2.3 ms',
        hitRate: '87.5%'
      },
      cacheItems: [
        { key: 'user:profile:10001', type: 'hash', size: '2.3 KB', ttl: 3600, hitCount: 142, value: { id: 10001, name: '张三', role: 'admin' } },
        { key: 'product:list:category:5', type: 'list', size: '15.7 KB', ttl: 1800, hitCount: 278, value: ['产品1', '产品2', '产品3'] },
        { key: 'config:system', type: 'hash', size: '4.1 KB', ttl: -1, hitCount: 89, value: { theme: 'dark', language: 'zh-CN' } },
        { key: 'token:auth:xxxx', type: 'string', size: '0.5 KB', ttl: 7200, hitCount: 56, value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        { key: 'stats:daily:2025-06-05', type: 'hash', size: '8.2 KB', ttl: 86400, hitCount: 35, value: { visits: 1205, users: 368 } }
      ],
      selectedCacheKeys: [],
      currentPage: 1,
      pageSize: 10,
      totalItems: 1245,
      valueDialogVisible: false,
      selectedCache: {}
    }
  },
  methods: {
    // 刷新缓存统计
    refreshStats() {
      this.loading = true;
      // 模拟异步加载
      setTimeout(() => {
        this.loading = false;
        this.$message.success('缓存统计已刷新');
      }, 500);
    },

    // 确认清除缓存
    confirmClearCache(type, key) {
      let message = '';
      let confirmAction = '';
      
      if (type === 'all') {
        message = '确定要清除所有缓存吗？这可能会影响系统性能。';
        confirmAction = '清除所有';
      } else if (type === 'selected') {
        if (this.selectedCacheKeys.length === 0) {
          this.$message.warning('请先选择要清除的缓存项');
          return;
        }
        message = `确定要清除已选中的 ${this.selectedCacheKeys.length} 个缓存项吗？`;
        confirmAction = '清除选中';
      } else {
        message = `确定要清除缓存键 "${key}" 吗？`;
        confirmAction = '清除';
      }

      this.$confirm(message, '提示', {
        confirmButtonText: confirmAction,
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.clearCache(type, key);
      }).catch(() => {
        // 取消操作
      });
    },

    // 清除缓存
    clearCache(type, key) {
      this.loading = true;
      // 模拟异步操作
      setTimeout(() => {
        if (type === 'all') {
          // 清除所有缓存的逻辑
          this.$message.success('所有缓存已清除');
        } else if (type === 'selected') {
          // 清除选中缓存的逻辑
          this.$message.success(`已清除 ${this.selectedCacheKeys.length} 个缓存项`);
          this.selectedCacheKeys = [];
        } else {
          // 清除单个缓存的逻辑
          const index = this.cacheItems.findIndex(item => item.key === key);
          if (index !== -1) {
            this.cacheItems.splice(index, 1);
            this.totalItems--;
          }
          this.$message.success(`缓存键 "${key}" 已清除`);
        }
        this.loading = false;
      }, 500);
    },

    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadCacheItems();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadCacheItems();
    },

    // 多选处理
    handleSelectionChange(val) {
      this.selectedCacheKeys = val.map(item => item.key);
    },

    // 加载缓存项
    loadCacheItems() {
      this.loading = true;
      // 模拟异步加载
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },

    // 查看缓存值
    viewCacheValue(row) {
      this.selectedCache = { ...row };
      this.valueDialogVisible = true;
    },

    // 格式化缓存值为树形结构
    formatCacheValue(value) {
      if (!value || typeof value !== 'object') return [];
      
      return Object.entries(value).map(([key, val]) => {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return {
            key: key,
            children: this.formatCacheValue(val)
          };
        } else {
          return {
            key: `${key}: ${JSON.stringify(val)}`
          };
        }
      });
    },

    // 格式化列表数据
    formatAsList(value) {
      if (!Array.isArray(value)) return [];
      
      return value.map((item, index) => ({
        index,
        value: JSON.stringify(item)
      }));
    }
  },
  mounted() {
    this.loadCacheItems();
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
.stats-card {
  margin-bottom: 20px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.stats-item {
  text-align: center;
}
.stats-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}
.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
.cache-table-container {
  margin-top: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
.cache-value {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
