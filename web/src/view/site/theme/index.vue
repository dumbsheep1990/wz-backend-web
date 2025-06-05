<template>
  <div>
    <h2>主题管理</h2>
    <div class="content-box">
      <div class="theme-gallery">
        <el-row :gutter="20">
          <el-col :span="6" v-for="theme in themeList" :key="theme.id">
            <el-card :class="['theme-card', theme.active ? 'theme-active' : '']">
              <div class="theme-preview">
                <img :src="theme.thumbnail" class="theme-image" />
                <div class="theme-overlay" v-if="theme.active">
                  <el-icon><Check /></el-icon> 当前主题
                </div>
                <div class="theme-actions" v-else>
                  <el-button type="primary" size="small" @click="activateTheme(theme)">应用主题</el-button>
                </div>
              </div>
              <div class="theme-info">
                <h3>{{ theme.name }}</h3>
                <p class="theme-desc">{{ theme.description }}</p>
                <div class="theme-meta">
                  <span>版本: {{ theme.version }}</span>
                  <el-tag size="small" v-if="theme.premium" type="warning">高级版</el-tag>
                  <el-tag size="small" v-else type="success">免费版</el-tag>
                </div>
              </div>
              <div class="theme-actions-footer">
                <el-button link type="primary" @click="themeDetails(theme)">查看详情</el-button>
                <el-button link type="primary" @click="themeSettings(theme)" v-if="theme.active">设置</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="theme-upload-section">
        <el-divider content-position="center">上传自定义主题</el-divider>
        <el-upload
          class="theme-uploader"
          action="#"
          :auto-upload="false"
          :on-change="handleThemeUpload"
          accept=".zip"
        >
          <el-button type="primary">上传主题包 (.zip)</el-button>
          <template #tip>
            <div class="el-upload__tip">
              请上传符合主题规范的zip格式压缩包，大小不超过10MB
            </div>
          </template>
        </el-upload>
      </div>
    </div>
    
    <!-- 主题详情对话框 -->
    <el-dialog v-model="detailsVisible" title="主题详情" width="50%">
      <div v-if="currentTheme" class="theme-details">
        <div class="theme-preview-large">
          <img :src="currentTheme.thumbnail" class="theme-image-large" />
        </div>
        <div class="theme-info-detailed">
          <h2>{{ currentTheme.name }}</h2>
          <p>{{ currentTheme.description }}</p>
          
          <el-descriptions border>
            <el-descriptions-item label="版本">{{ currentTheme.version }}</el-descriptions-item>
            <el-descriptions-item label="作者">{{ currentTheme.author }}</el-descriptions-item>
            <el-descriptions-item label="发布日期">{{ currentTheme.releaseDate }}</el-descriptions-item>
            <el-descriptions-item label="类型">
              {{ currentTheme.premium ? '高级主题' : '免费主题' }}
            </el-descriptions-item>
            <el-descriptions-item label="兼容性">{{ currentTheme.compatibility }}</el-descriptions-item>
          </el-descriptions>
          
          <h3>主题特性</h3>
          <ul class="theme-features">
            <li v-for="(feature, index) in currentTheme.features" :key="index">
              <el-icon><Check /></el-icon> {{ feature }}
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsVisible = false">关闭</el-button>
          <el-button type="primary" @click="activateTheme(currentTheme)" v-if="!currentTheme?.active">
            应用此主题
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 主题设置对话框 -->
    <el-dialog v-model="settingsVisible" title="主题设置" width="60%">
      <div v-if="currentTheme" class="theme-settings">
        <el-tabs v-model="activeSettingsTab">
          <el-tab-pane label="基本设置" name="basic">
            <el-form label-width="120px">
              <el-form-item label="主色调">
                <el-color-picker v-model="themeSettings.primaryColor"></el-color-picker>
              </el-form-item>
              <el-form-item label="强调色">
                <el-color-picker v-model="themeSettings.accentColor"></el-color-picker>
              </el-form-item>
              <el-form-item label="字体">
                <el-select v-model="themeSettings.font" placeholder="选择字体">
                  <el-option label="默认字体" value="default"></el-option>
                  <el-option label="无衬线字体" value="sans-serif"></el-option>
                  <el-option label="衬线字体" value="serif"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="圆角大小">
                <el-slider v-model="themeSettings.borderRadius" :min="0" :max="20"></el-slider>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="页头设置" name="header">
            <el-form label-width="120px">
              <el-form-item label="显示LOGO">
                <el-switch v-model="themeSettings.showLogo"></el-switch>
              </el-form-item>
              <el-form-item label="显示搜索框">
                <el-switch v-model="themeSettings.showSearch"></el-switch>
              </el-form-item>
              <el-form-item label="页头样式">
                <el-radio-group v-model="themeSettings.headerStyle">
                  <el-radio label="fixed">固定</el-radio>
                  <el-radio label="sticky">粘性</el-radio>
                  <el-radio label="normal">普通</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="页脚设置" name="footer">
            <el-form label-width="120px">
              <el-form-item label="显示版权信息">
                <el-switch v-model="themeSettings.showCopyright"></el-switch>
              </el-form-item>
              <el-form-item label="显示社交链接">
                <el-switch v-model="themeSettings.showSocialLinks"></el-switch>
              </el-form-item>
              <el-form-item label="页脚列数">
                <el-input-number v-model="themeSettings.footerColumns" :min="1" :max="4"></el-input-number>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingsVisible = false">取消</el-button>
          <el-button type="primary" @click="saveThemeSettings">保存设置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SiteTheme',
  data() {
    return {
      themeList: [
        {
          id: 1,
          name: '默认主题',
          description: '系统默认主题，简洁现代的设计风格',
          thumbnail: 'https://via.placeholder.com/300x200?text=Default+Theme',
          version: '1.0.0',
          author: '系统',
          releaseDate: '2025-01-01',
          premium: false,
          active: true,
          compatibility: '全部版本',
          features: [
            '响应式布局',
            '多种颜色方案',
            '可配置首页模块',
            '优化的移动端体验'
          ]
        },
        {
          id: 2,
          name: '商务主题',
          description: '专为企业网站设计的主题，专业简约',
          thumbnail: 'https://via.placeholder.com/300x200?text=Business+Theme',
          version: '2.1.0',
          author: 'ThemeDesign Studio',
          releaseDate: '2025-03-15',
          premium: true,
          active: false,
          compatibility: 'v2.0+',
          features: [
            '专业商务布局',
            '多种页面模板',
            '团队成员展示',
            '集成客户案例轮播'
          ]
        },
        {
          id: 3,
          name: '极简主题',
          description: '极简设计风格，注重内容展示的阅读体验',
          thumbnail: 'https://via.placeholder.com/300x200?text=Minimal+Theme',
          version: '1.5.0',
          author: 'Minimalist',
          releaseDate: '2025-05-20',
          premium: false,
          active: false,
          compatibility: 'v1.5+',
          features: [
            '极简设计',
            '优化的排版',
            '快速加载速度',
            '专注内容阅读体验'
          ]
        },
        {
          id: 4,
          name: '电商主题',
          description: '为在线商店设计的主题，包含产品展示和购物流程',
          thumbnail: 'https://via.placeholder.com/300x200?text=E-commerce+Theme',
          version: '3.0.2',
          author: 'Commerce Solutions',
          releaseDate: '2025-04-10',
          premium: true,
          active: false,
          compatibility: 'v2.0+',
          features: [
            '产品画廊',
            '购物车集成',
            '产品筛选',
            '促销模块'
          ]
        }
      ],
      detailsVisible: false,
      settingsVisible: false,
      currentTheme: null,
      activeSettingsTab: 'basic',
      themeSettings: {
        primaryColor: '#409EFF',
        accentColor: '#67C23A',
        font: 'default',
        borderRadius: 4,
        showLogo: true,
        showSearch: true,
        headerStyle: 'fixed',
        showCopyright: true,
        showSocialLinks: true,
        footerColumns: 3
      }
    }
  },
  methods: {
    // 激活主题
    activateTheme(theme) {
      this.$confirm(`确定将主题更改为"${theme.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 将当前激活的主题设置为非激活
        this.themeList.forEach(item => {
          item.active = false;
        });
        
        // 激活选中的主题
        const index = this.themeList.findIndex(item => item.id === theme.id);
        if (index !== -1) {
          this.themeList[index].active = true;
        }
        
        this.$message.success(`已成功切换至"${theme.name}"`);
        this.detailsVisible = false;
      }).catch(() => {
        // 取消操作
      });
    },
    
    // 查看主题详情
    themeDetails(theme) {
      this.currentTheme = theme;
      this.detailsVisible = true;
    },
    
    // 打开主题设置
    themeSettings(theme) {
      this.currentTheme = theme;
      this.settingsVisible = true;
    },
    
    // 保存主题设置
    saveThemeSettings() {
      this.$message.success('主题设置已保存');
      this.settingsVisible = false;
    },
    
    // 处理主题上传
    handleThemeUpload(file) {
      this.$message.info('主题上传功能待实现');
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

.theme-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  position: relative;
}

.theme-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.theme-active {
  border: 2px solid #409EFF;
}

.theme-preview {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.theme-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(64, 158, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.theme-overlay .el-icon {
  margin-right: 5px;
}

.theme-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.theme-preview:hover .theme-actions {
  opacity: 1;
}

.theme-info {
  padding: 10px 0;
}

.theme-info h3 {
  margin: 5px 0;
  font-size: 16px;
}

.theme-desc {
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

.theme-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.theme-actions-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
}

.theme-upload-section {
  margin-top: 40px;
}

.theme-uploader {
  text-align: center;
  padding: 20px 0;
}

.theme-preview-large {
  margin-bottom: 20px;
}

.theme-image-large {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 4px;
}

.theme-info-detailed {
  margin-top: 20px;
}

.theme-features {
  padding: 0;
  list-style: none;
}

.theme-features li {
  margin: 8px 0;
  display: flex;
  align-items: center;
}

.theme-features li .el-icon {
  color: #67C23A;
  margin-right: 8px;
}
</style>
