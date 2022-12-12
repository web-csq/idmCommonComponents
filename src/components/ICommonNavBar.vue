<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
    <a-menu mode="horizontal" :selectedKeys="selectedKeys" @click="menuClick" @select="handleSelect">
      <template v-for="item in menuList">
        <i-sub-menu v-if="item.children && item.children.length > 0" :moduleObject="moduleObject" :key="item.id" :menu-info="item" />
        <a-menu-item v-else :key="item.id">
          <span>{{ item.title }}</span>
        </a-menu-item>
      </template>
    </a-menu>
  </div>
</template>
<script>
import ISubMenu from '../innerComponents/ISubMenu.vue'
const defaultSelectedKeys = ['1'],  // 默认选中的菜单
  menuList = [
    {
      id: '1',
      title: '首页',
      children: [
        {
          id: '1-1',
          title: '首页11',
        }
      ]
    },
    {
      id: '2',
      title: '组件工厂',
    },
    {
      id: '3',
      title: '组件市场',
    },
    {
      id: '4',
      title: '业务组件',
    }
  ]
export default {
  name: 'ICommonNavBar',
  components: {
    ISubMenu
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      menuList: [],
      selectedKeys: [],
      clickItem: null
    }
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
  },
  methods: {
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
    },
    convertAttrToStyleObject() {
      const styleObject = {},bgColorObj = {}, itemStyleObj = {}, noSelectItemObj = {}, selectItemObj = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
              styleObject[key] = element;
              break;
            case "height":
              styleObject['line-height'] = element
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element)
              break;
            case 'itemBox':
              IDM.style.setBoxStyle(itemStyleObj, element)
              break
            case "bgColor":
              styleObject['background-color'] = element?.hex8;
              bgColorObj['background-color'] = element?.hex8 + ' !important';
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case "font":
              IDM.style.setFontStyle(noSelectItemObj, element)
              break;
            case 'selectFont':
              IDM.style.setFontStyle(selectItemObj, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .ant-menu', styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .ant-menu .ant-menu-item', itemStyleObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .ant-menu .ant-menu-item:not(.ant-menu-item-selected)', noSelectItemObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .ant-menu .ant-menu-item.ant-menu-item-selected', selectItemObj);
      window.IDM.setStyleToPageHead('.idm-common-nav-popup-' + this.moduleObject.id + ' .ant-menu', bgColorObj);
      this.initData();
    },
    handleFindMenuItem(menuList, key) {
      menuList.forEach(el => {
        if (el.id == key) {
          this.clickItem = el
          return
        }
        if (!el.children || el.children.length == 0) return
        this.handleFindMenuItem(el.children, key)
      })
    },
    menuClick({ key }) {
      this.handleFindMenuItem(this.menuList, key)
      const funcName = this.propData?.customClickFunction?.[0]?.name
      const result = window?.[funcName]?.call(this, this.clickItem)
      if (result === false) return
      this.sendBroadcastMessage({
        type: this.propData.messageType,
        rangeModule: this.propData.triggerComponents.map(el => el.moduleId),
        message: this.clickItem
      })
    },
    handleSelect({ selectedKeys }) {
      this.selectedKeys = selectedKeys
    },
    reload() {
      //请求数据源
      this.initData();
    },
    initData() {
      if (this.moduleObject.env === 'develop') {
        this.menuList = menuList
        this.selectedKeys = defaultSelectedKeys
        return
      }
      //所有地址的url参数转换
      var params = this.commonParam();
      switch (this.propData.dataSourceType) {
        case "dataSource":
          IDM.datasource.request(this.propData?.dataSource?.[0]?.id, {
            moduleObject: this.moduleObject,
            param: {}
          }, (res) => {
            if (res.code == 200) {
              this.menuList = res.data.menuList
              this.selectedKeys = res.data.defaultSelectedKeys
              console.log(this.selectedKeys)
            } else {
              IDM.message.error(res.message)
            }
          })
          break;
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
        case "customFunction":
          if (this.propData.customFunction && this.propData.customFunction.length > 0) {
            var resValue = "";
            try {
              resValue = window[this.propData.customFunction[0].name] && window[this.propData.customFunction[0].name].call(this, { ...params, ...this.propData.customFunction[0].param, moduleObject: this.moduleObject });
              if (resValue?.menuList) this.menuList = resValue?.menuList
              if (resValue?.selectedKeys) this.selectedKeys = resValue?.selectedKeys
            } catch (error) {
            }
          }
          break;
      }
    },
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)

    },
    setContextValue(object) {
      console.log("统一接口设置的值", object);
      if (object.type != "pageCommonInterface") {
        return;
      }
      if (object.key === 'menuList') {
        this.menuList = object.data
      }
      if (object.key === 'selectedKeys') {
        this.selectedKeys = object.data
      }
    },
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    },
    /**
   * 通用的url参数对象
   * 所有地址的url参数转换
   */
    commonParam() {
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        urlData: JSON.stringify(urlObject),
      };
      return params;
    },
  }
};
</script>