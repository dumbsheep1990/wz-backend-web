<template>
  <div class="detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>收藏详情</span>
          <div class="header-actions">
            <el-button @click="goBack">返回列表</el-button>
            <el-button type="danger" @click="handleDelete">删除收藏</el-button>
          </div>
        </div>
      </template>
      
      <div v-loading="loading">
        <el-skeleton :rows="10" animated v-if="loading" />
        
        <div v-else>
          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">
              <el-link type="primary" @click="viewUserFavorites">{{ detail.user_id }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="用户名">{{ detail.username }}</el-descriptions-item>
            <el-descriptions-item label="内容ID">{{ detail.item_id }}</el-descriptions-item>
            <el-descriptions-item label="内容类型">
              <el-tag :type="getItemTypeTag(detail.item_type)">
                {{ formatItemType(detail.item_type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="收藏时间">{{ detail.created_at }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detail.updated_at }}</el-descriptions-item>
          </el-descriptions>
          
          <el-divider />
          
          <el-descriptions title="内容信息" :column="1" border>
            <el-descriptions-item label="标题">{{ detail.title }}</el-descriptions-item>
            <el-descriptions-item label="链接">
              <el-link type="primary" :href="detail.url" target="_blank">{{ detail.url }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="摘要">{{ detail.summary }}</el-descriptions-item>
            <el-descriptions-item label="用户备注">{{ detail.remark }}</el-descriptions-item>
            <el-descriptions-item label="封面图">
              <el-image
                v-if="detail.cover"
                :src="detail.cover"
                :preview-src-list="[detail.cover]"
                fit="cover"
                style="width: 200px; height: 120px; border-radius: 4px;"
              />
              <span v-else>无封面图</span>
            </el-descriptions-item>
          </el-descriptions>
          
          <el-divider />
          
          <!-- 相关内容推荐 -->
          <div class="related-content">
            <h3>相关收藏内容推荐</h3>
            <el-empty description="暂无相关内容" v-if="relatedContent.length === 0"></el-empty>
            <el-row :gutter="20" v-else>
              <el-col :span="8" v-for="(item, index) in relatedContent" :key="index">
                <el-card shadow="hover" class="related-card">
                  <div class="related-title">{{ item.title }}</div>
                  <div class="related-info">
                    <span>{{ formatItemType(item.item_type) }}</span>
                    <span>{{ item.created_at }}</span>
                  </div>
                  <el-button type="primary" link @click="goToDetail(item.id)">查看详情</el-button>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const detail = ref({})
const relatedContent = ref([])

// 获取详情数据
const fetchDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    // 这里将来需要替换为实际的API调用
    // const res = await getFavoriteDetail(id)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 800))
    const res = {
      code: 0,
      data: {
        id: parseInt(id),
        user_id: 1001,
        username: '用户1001',
        item_id: 2001,
        item_type: ['article', 'video', 'product', 'course', 'other'][Math.floor(Math.random() * 5)],
        title: `收藏内容标题 ${id}`,
        cover: `https://picsum.photos/800/450?random=${id}`,
        summary: `这是收藏内容的详细摘要描述，详细介绍了内容的主要信息。这是内容ID ${id} 的详情页。这里展示的是一个较长的摘要，包含更多的内容细节和描述信息，帮助管理员了解用户收藏的具体内容。`,
        url: `https://example.com/content/${id}`,
        remark: `用户对这条收藏的个人备注信息 ${id}`,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
      },
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      detail.value = res.data
      // 获取相关内容
      fetchRelatedContent()
    } else {
      ElMessage.error(res.msg || '获取收藏详情失败')
      setTimeout(() => {
        goBack()
      }, 1500)
    }
  } catch (error) {
    console.error('获取收藏详情出错:', error)
    ElMessage.error('获取收藏详情失败')
    setTimeout(() => {
      goBack()
    }, 1500)
  } finally {
    loading.value = false
  }
}

// 获取相关内容
const fetchRelatedContent = async () => {
  try {
    // 这里将来需要替换为实际的API调用
    // const res = await getRelatedFavorites(detail.value.id, detail.value.item_type)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 300))
    const res = {
      code: 0,
      data: Array.from({ length: 3 }, (_, index) => ({
        id: 10000 + index,
        user_id: 1000 + index,
        item_type: detail.value.item_type,
        title: `相关${formatItemType(detail.value.item_type)}内容 ${index + 1}`,
        created_at: new Date(Date.now() - index * 86400000).toISOString().split('T')[0]
      })),
      msg: '获取成功'
    }
    
    if (res.code === 0) {
      relatedContent.value = res.data
    }
  } catch (error) {
    console.error('获取相关内容出错:', error)
    relatedContent.value = []
  }
}

// 删除收藏
const handleDelete = () => {
  ElMessageBox.confirm('确定要删除该收藏记录吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里将来需要替换为实际的API调用
      // await deleteFavorite(detail.value.id)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      ElMessage.success('删除成功')
      // 返回列表页
      goBack()
    } catch (error) {
      console.error('删除收藏记录失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 查看用户收藏
const viewUserFavorites = () => {
  router.push({
    name: 'userFavorites',
    params: { userId: detail.value.user_id }
  })
}

// 查看其他收藏详情
const goToDetail = (id) => {
  router.push({
    name: 'favoritesDetail',
    params: { id }
  })
}

// 返回列表页
const goBack = () => {
  router.push({ name: 'favoritesList' })
}

// 格式化内容类型
const formatItemType = (type) => {
  const types = {
    article: '文章',
    video: '视频',
    product: '商品',
    course: '课程',
    other: '其他'
  }
  return types[type] || type
}

// 获取内容类型标签样式
const getItemTypeTag = (type) => {
  const types = {
    article: '',
    video: 'success',
    product: 'warning',
    course: 'info',
    other: 'danger'
  }
  return types[type] || ''
}

// 生命周期钩子
onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.related-content {
  margin-top: 20px;
}

.related-content h3 {
  margin-bottom: 16px;
  font-weight: normal;
  font-size: 16px;
}

.related-card {
  height: 130px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.related-title {
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.related-info {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}
</style>
