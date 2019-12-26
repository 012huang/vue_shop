<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/houtai.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapsed ? '64px' : '200px'">
        <div class='toggle-button' @click='toggleCollapse'>|||</div>
        <el-menu background-color="#333744" text-color="#fff"
          active-text-color="#409eff" unique-opened :collapse='isCollapsed' :collapse-transition='false'>
          <!--一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="subItem.id + ''" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右边内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapsed: false
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    logout() {
      // 清除token, 并跳转到登录页
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 8px;
}
.el-menu {
  border-right: none;
}

.toggle-button {
  background-color: #4a506f;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: .2em;
  cursor: pointer;
}
</style>
