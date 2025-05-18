<template>
  <div class="empty-page">
    <el-card class="box-card">
      <div class="header">
        <h2>功能开发中</h2>
      </div>
      <div class="content">
        <el-empty description="该功能正在开发中，敬请期待..." />
        <p class="hint">当前页面: {{ currentRoute }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
defineOptions({
  name: 'EmptyPage'
})

import { useRoute } from 'vue-router'
const route = useRoute()
const currentRoute = route.path
</script>

<style scoped>
.empty-page {
  padding: 20px;
}
.box-card {
  width: 100%;
  margin-bottom: 20px;
}
.header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
.hint {
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}
</style> 