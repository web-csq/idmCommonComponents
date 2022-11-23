<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="idm-button-group-container">
    <template v-for="item, index in propData.buttonList">
      <div :key="index" class="button-container" :style="handleGetBtnStyle(item)" @click="handleButtonClick(item)"
        v-if="handleButtonShow(item)">
        <svg v-if="item.icon && item.icon.length" :style="handleGetIconStyle(item)" class="btn-left-icon"
          aria-hidden="true">
          <use :xlink:href="`#${item.icon[0]}`"></use>
        </svg>
        <span class="btn-text">{{ item.btnText }}</span>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: 'IButtonGroup',
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {}
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
      const styleObject = {}, fontObj = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element)
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case 'bgColor':
              if (element && element.hex8) {
                styleObject['background-color'] = IDM.hex8ToRgbaString(element.hex8)
              }
              break
            case 'font':
              IDM.style.setFontStyle(fontObj, element)
              break;

          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .btn-text', fontObj);
      this.initData();
    },
    //btn style
    handleGetBtnStyle(item) {
      const styleObject = {}
      Object.keys(item.btnBox || {}).length > 0 && IDM.style.setBoxStyle(styleObject, item.btnBox)
      Object.keys(item.btnBorder || {}).length > 0 && IDM.style.setBorderStyle(styleObject, item.btnBorder || {})
      Object.keys(item.btnFont || {}).length > 0 && IDM.style.setFontStyle(styleObject, item.btnFont || {})
      return styleObject
    },
    // icon style
    handleGetIconStyle(item) {
      if (!item?.icon?.length) return {}
      const size = item.iconSize + 'px',
        color = item?.iconColor?.hex8 ? IDM.hex8ToRgbaString(item.iconColor.hex8) : ''
      const styleObject = {}
      Object.assign(styleObject, {
        width: size,
        height: size,
        fill: color,
        color: color,
      })
      IDM.style.setBoxStyle(styleObject, item.iconBox || {})
      return styleObject
    },
    // button is show
    handleButtonShow(item) {
      const funcName = item?.showFunction?.[0]?.name
      if (!funcName) return true
      const result = window?.[funcName]?.call(this)
      return result
    },
    // click event
    handleButtonClick(item) {
      const funcName = item?.clickFunction?.[0]?.name
      if (funcName) {
        window?.[funcName]?.call(this)
      }
    },
    reload() {
      //请求数据源
      this.initData();
    },
    initData() {
    },
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)
    },
    setContextValue(object) {
      console.log("统一接口设置的值", object);
    },
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    }
  }
};
</script>

<style lang="scss" scoped>
.idm-button-group-container {
  display: flex;
  align-items: center;
}

.button-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>