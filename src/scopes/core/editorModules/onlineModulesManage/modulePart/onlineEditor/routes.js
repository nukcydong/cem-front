//导出该模块路由
export default [
    {
        title: "在线编辑模板",
        name: "onlineEditor",
        path: 'onlineEditor',
        component: () => import("./onlineEditor.vue")
}
]

