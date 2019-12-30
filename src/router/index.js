import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Permission from '../components/power/Permission.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Permission }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫, 拦截未登录不允许访问其他页面
router.beforeEach((to, from, next) => {
  // to表示将要访问的页面
  // from表示从哪个页面跳转而来
  // next是一个函数, 表示放行, 其中 next()是放行, next('/xxx')是强制跳转

  // 如果访问的是登录页面, 之间放行让其访问
  if (to.path === '/login') return next()
  // 访问其他页面时, 先判断是否有token
  const tokenStr = window.sessionStorage.getItem('token')

  // 如果未登录, 强制跳转到登录页
  if (!tokenStr) return next('/login')

  // 有token, 则直接放行
  next()
})

export default router
