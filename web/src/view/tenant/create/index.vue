<template>
  <div>
    <h2>创建租户</h2>
    <div class="content-box">
      <el-steps :active="currentStep" finish-status="success" simple style="margin-bottom: 40px;">
        <el-step title="基本信息" icon="User" />
        <el-step title="配置选项" icon="Setting" />
        <el-step title="资源分配" icon="Wallet" />
        <el-step title="确认创建" icon="Check" />
      </el-steps>

      <el-form ref="tenantFormRef" :model="tenantForm" :rules="rules" label-width="120px" v-show="currentStep === 0">
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="tenantForm.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户标识" prop="code">
          <el-input v-model="tenantForm.code" placeholder="请输入租户唯一标识" />
          <div class="form-tip">唯一标识仅允许字母、数字和下划线，创建后不可修改</div>
        </el-form-item>
        <el-form-item label="负责人姓名" prop="adminName">
          <el-input v-model="tenantForm.adminName" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="tenantForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="tenantForm.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker v-model="tenantForm.expireTime" type="datetime" placeholder="选择过期时间" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="租户状态">
          <el-switch
            v-model="tenantForm.status"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <div v-show="currentStep === 1">
        <el-form :model="tenantConfig" label-width="120px">
          <h3>系统配置</h3>
          <el-form-item label="数据隔离方式">
            <el-radio-group v-model="tenantConfig.dataIsolation">
              <el-radio label="database">独立数据库</el-radio>
              <el-radio label="schema">独立Schema</el-radio>
              <el-radio label="table">共享数据表</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="允许自定义主题">
            <el-switch v-model="tenantConfig.allowCustomTheme" />
          </el-form-item>
          <el-form-item label="允许自定义域名">
            <el-switch v-model="tenantConfig.allowCustomDomain" />
          </el-form-item>
          <el-form-item label="允许API访问">
            <el-switch v-model="tenantConfig.allowApiAccess" />
          </el-form-item>

          <el-divider />
          <h3>功能模块</h3>
          <el-checkbox-group v-model="tenantConfig.enabledModules">
            <el-checkbox label="cms">内容管理</el-checkbox>
            <el-checkbox label="ecommerce">电子商务</el-checkbox>
            <el-checkbox label="member">会员系统</el-checkbox>
            <el-checkbox label="analytics">数据分析</el-checkbox>
            <el-checkbox label="marketing">营销工具</el-checkbox>
          </el-checkbox-group>

          <el-divider />
          <h3>安全设置</h3>
          <el-form-item label="IP白名单">
            <el-input v-model="tenantConfig.ipWhitelist" placeholder="输入允许访问的IP，多个IP用逗号分隔" />
          </el-form-item>
          <el-form-item label="密码策略">
            <el-select v-model="tenantConfig.passwordPolicy" placeholder="请选择密码策略" style="width: 100%;">
              <el-option label="低（仅长度限制）" value="low" />
              <el-option label="中（要求字母和数字）" value="medium" />
              <el-option label="高（要求大小写字母、数字和特殊字符）" value="high" />
            </el-select>
          </el-form-item>
          <el-form-item label="会话超时时间">
            <el-input-number v-model="tenantConfig.sessionTimeout" :min="5" :max="1440" :step="5" />
            <span class="ml-10">分钟</span>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="currentStep === 2">
        <el-form :model="tenantResources" label-width="140px">
          <h3>存储限制</h3>
          <el-form-item label="存储空间上限">
            <el-input-number v-model="tenantResources.storageLimit" :min="1" :step="1" />
            <span class="ml-10">GB</span>
          </el-form-item>

          <el-divider />
          <h3>流量限制</h3>
          <el-form-item label="月流量上限">
            <el-input-number v-model="tenantResources.trafficLimit" :min="1" :step="10" />
            <span class="ml-10">GB</span>
          </el-form-item>
          <el-form-item label="API请求限制">
            <el-input-number v-model="tenantResources.apiRequestLimit" :min="1000" :step="1000" />
            <span class="ml-10">次/日</span>
          </el-form-item>

          <el-divider />
          <h3>用户限制</h3>
          <el-form-item label="最大管理员数">
            <el-input-number v-model="tenantResources.adminLimit" :min="1" :max="100" :step="1" />
            <span class="ml-10">人</span>
          </el-form-item>
          <el-form-item label="最大用户数">
            <el-input-number v-model="tenantResources.userLimit" :min="10" :step="100" />
            <span class="ml-10">人</span>
            <div class="form-tip">0表示不限制</div>
          </el-form-item>

          <el-divider />
          <h3>资源套餐</h3>
          <el-form-item label="选择预设套餐">
            <el-radio-group v-model="selectedPlan" @change="applyResourcePlan">
              <el-radio label="basic">基础版 (5GB存储，50GB流量)</el-radio>
              <el-radio label="standard">标准版 (20GB存储，200GB流量)</el-radio>
              <el-radio label="premium">高级版 (100GB存储，500GB流量)</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="currentStep === 3">
        <h3>租户信息确认</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="租户名称">{{ tenantForm.name }}</el-descriptions-item>
          <el-descriptions-item label="租户标识">{{ tenantForm.code }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ tenantForm.adminName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ tenantForm.phone }}</el-descriptions-item>
          <el-descriptions-item label="电子邮箱">{{ tenantForm.email }}</el-descriptions-item>
          <el-descriptions-item label="过期时间">{{ formatDate(tenantForm.expireTime) }}</el-descriptions-item>
          <el-descriptions-item label="租户状态">{{ tenantForm.status ? '启用' : '禁用' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />
        <h3>配置信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="数据隔离方式">{{ getDataIsolationName(tenantConfig.dataIsolation) }}</el-descriptions-item>
          <el-descriptions-item label="密码策略">{{ getPasswordPolicyName(tenantConfig.passwordPolicy) }}</el-descriptions-item>
          <el-descriptions-item label="自定义主题">{{ tenantConfig.allowCustomTheme ? '允许' : '不允许' }}</el-descriptions-item>
          <el-descriptions-item label="自定义域名">{{ tenantConfig.allowCustomDomain ? '允许' : '不允许' }}</el-descriptions-item>
          <el-descriptions-item label="API访问">{{ tenantConfig.allowApiAccess ? '允许' : '不允许' }}</el-descriptions-item>
          <el-descriptions-item label="会话超时">{{ tenantConfig.sessionTimeout }}分钟</el-descriptions-item>
        </el-descriptions>

        <el-divider />
        <h3>资源分配</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="存储空间">{{ tenantResources.storageLimit }}GB</el-descriptions-item>
          <el-descriptions-item label="月流量">{{ tenantResources.trafficLimit }}GB</el-descriptions-item>
          <el-descriptions-item label="API请求限制">{{ tenantResources.apiRequestLimit }}次/日</el-descriptions-item>
          <el-descriptions-item label="管理员数量">{{ tenantResources.adminLimit }}人</el-descriptions-item>
          <el-descriptions-item label="用户数量限制">{{ tenantResources.userLimit === 0 ? '不限制' : tenantResources.userLimit + '人' }}</el-descriptions-item>
          <el-descriptions-item label="资源套餐">{{ getResourcePlanName(selectedPlan) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />
        <h3>功能模块</h3>
        <div class="module-tags">
          <el-tag v-for="module in tenantConfig.enabledModules" :key="module" style="margin-right: 10px;">
            {{ getModuleName(module) }}
          </el-tag>
        </div>
      </div>

      <div class="form-actions">
        <el-button @click="prevStep" v-if="currentStep > 0">上一步</el-button>
        <el-button type="primary" @click="nextStep" v-if="currentStep < 3">下一步</el-button>
        <el-button type="success" @click="submitForm" v-if="currentStep === 3">创建租户</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TenantCreate',
  data() {
    return {
      currentStep: 0,
      selectedPlan: 'basic',
      tenantForm: {
        name: '',
        code: '',
        adminName: '',
        phone: '',
        email: '',
        expireTime: '',
        status: true
      },
      tenantConfig: {
        dataIsolation: 'schema',
        allowCustomTheme: false,
        allowCustomDomain: false,
        allowApiAccess: true,
        enabledModules: ['cms', 'member'],
        ipWhitelist: '',
        passwordPolicy: 'medium',
        sessionTimeout: 30
      },
      tenantResources: {
        storageLimit: 5,
        trafficLimit: 50,
        apiRequestLimit: 10000,
        adminLimit: 3,
        userLimit: 100
      },
      rules: {
        name: [
          { required: true, message: '请输入租户名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入租户标识', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '租户标识只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        adminName: [
          { required: true, message: '请输入负责人姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        expireTime: [
          { required: true, message: '请选择过期时间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 上一步
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    
    // 下一步
    nextStep() {
      if (this.currentStep === 0) {
        this.$refs.tenantFormRef.validate((valid) => {
          if (valid) {
            this.currentStep++;
          }
        });
      } else if (this.currentStep < 3) {
        this.currentStep++;
      }
    },
    
    // 提交表单
    submitForm() {
      this.$confirm('确认创建此租户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里模拟提交请求
        this.$message({
          type: 'success',
          message: '租户创建成功！即将跳转到租户列表',
          onClose: () => {
            this.$router.push({ name: 'tenantList' });
          }
        });
      }).catch(() => {
        // 取消操作
      });
    },
    
    // 应用资源套餐
    applyResourcePlan(plan) {
      switch(plan) {
        case 'basic':
          this.tenantResources.storageLimit = 5;
          this.tenantResources.trafficLimit = 50;
          this.tenantResources.apiRequestLimit = 10000;
          this.tenantResources.adminLimit = 3;
          this.tenantResources.userLimit = 100;
          break;
        case 'standard':
          this.tenantResources.storageLimit = 20;
          this.tenantResources.trafficLimit = 200;
          this.tenantResources.apiRequestLimit = 50000;
          this.tenantResources.adminLimit = 10;
          this.tenantResources.userLimit = 500;
          break;
        case 'premium':
          this.tenantResources.storageLimit = 100;
          this.tenantResources.trafficLimit = 500;
          this.tenantResources.apiRequestLimit = 200000;
          this.tenantResources.adminLimit = 30;
          this.tenantResources.userLimit = 0; // 不限制
          break;
      }
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString();
    },
    
    // 获取数据隔离方式显示名称
    getDataIsolationName(isolation) {
      const map = {
        'database': '独立数据库',
        'schema': '独立Schema',
        'table': '共享数据表'
      };
      return map[isolation] || isolation;
    },
    
    // 获取密码策略显示名称
    getPasswordPolicyName(policy) {
      const map = {
        'low': '低（仅长度限制）',
        'medium': '中（要求字母和数字）',
        'high': '高（要求大小写字母、数字和特殊字符）'
      };
      return map[policy] || policy;
    },
    
    // 获取功能模块显示名称
    getModuleName(moduleCode) {
      const map = {
        'cms': '内容管理',
        'ecommerce': '电子商务',
        'member': '会员系统',
        'analytics': '数据分析',
        'marketing': '营销工具'
      };
      return map[moduleCode] || moduleCode;
    },
    
    // 获取资源套餐显示名称
    getResourcePlanName(plan) {
      const map = {
        'basic': '基础版',
        'standard': '标准版',
        'premium': '高级版',
        'custom': '自定义'
      };
      return map[plan] || plan;
    }
  },
  mounted() {
    // 设置默认过期时间为1年后
    const defaultExpireDate = new Date();
    defaultExpireDate.setFullYear(defaultExpireDate.getFullYear() + 1);
    this.tenantForm.expireTime = defaultExpireDate;
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

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.ml-10 {
  margin-left: 10px;
}

.form-actions {
  margin-top: 40px;
  text-align: center;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 500;
  color: #333;
}

.module-tags {
  margin: 20px 0;
}
</style>
