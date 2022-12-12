<template>
    <a-sub-menu :key="menuInfo.key" :popupClassName="`idm-common-nav-popup-` + moduleObject.id" v-bind="$props" v-on="$listeners">
        <span slot="title">
            <span>{{ menuInfo.title }}</span>
        </span>
        <template v-for="item in menuInfo.children">
            <i-sub-menu v-if="item.children && item.children.length > 0" :key="item.id" :menu-info="item" />
            <a-menu-item v-else :key="item.id">
                <span>{{ item.title }}</span>
            </a-menu-item>
        </template>
    </a-sub-menu>
</template>

<script>
import { Menu } from 'ant-design-vue'
export default {
    name: 'ISubMenu',
    isSubMenu: true, // must
    props: {
        // 解构a-sub-menu的属性
        ...Menu.SubMenu.props,
        menuInfo: {
            type: Object,
            default: () => ({}),
        },
        moduleObject: {
            type: Object,
            default: () => ({}),
        },
    },
}
</script>

<style lang="scss" scoped>
.idm-console-nav-popup {

    .ant-menu-item,
    .ant-menu-submenu-title {
        font-size: 15px !important;
    }
}
</style>