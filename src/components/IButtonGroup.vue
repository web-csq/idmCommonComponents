<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="d-flex align-c">
    <template v-for="item, index in buttonList">
      <div :key="index" class="d-flex align-c cursor-p idm-common-button" :style="handleGetBtnStyle(item)"
        @click="handleButtonClick(item)" v-if="handleButtonShow(item)">
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
      propData: this.$root.propData.compositeAttr || {},
      buttonList: []
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
      const styleObject = {}, btnObj = {}, iconObj = {}, btnHoverObj = {};
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
            // 按钮
            case 'btnFont':
              IDM.style.setFontStyle(btnObj, element)
              break;
            case 'btnBorder':
              IDM.style.setBorderStyle(btnObj, element)
              break;
            case 'btnBox':
              IDM.style.setBoxStyle(btnObj, element)
              break;
            case 'BgColor':
              if (element && element.hex8) {
                btnObj['background-color'] = IDM.hex8ToRgbaString(element.hex8)
              }
              break
            case 'hoverBgColor':
              if (element && element.hex8) {
                btnHoverObj['background-color'] = IDM.hex8ToRgbaString(element.hex8)
              }
              break
            // 图标
            case 'iconSize':
              iconObj['width'] = element + 'px'
              iconObj['height'] = element + 'px'
              iconObj['font-size'] = element + 'px'
              break;
            case 'iconColor':
              if (element?.hex8) {
                iconObj['color'] = IDM.hex8ToRgbaString(element.hex8)
                iconObj['fill'] = IDM.hex8ToRgbaString(element.hex8)
              }
              break;
            case 'iconBox':
              IDM.style.setBoxStyle(iconObj, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .idm-common-button', btnObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .idm-common-button:hover', btnHoverObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .btn-left-icon', iconObj);
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
      const funcName = this.propData?.showFunction?.[0]?.name
      if (!funcName) return true
      const result = window?.[funcName]?.call(this, item.key)
      return result
    },
    // click event
    handleButtonClick(item) {
      const funcName = this.propData?.clickFunction?.[0]?.name
      if (funcName) {
        window?.[funcName]?.call(this, item.key)
      }
    },
    reload() {
      //请求数据源
      this.initData();
    },
    initData() {

      switch (this.propData.dataType) {
        case 'custom':
          this.buttonList = this.propData.buttonList
          break;
        case 'dataSource':
          IDM.datasource.request(this.propData?.dataSource?.[0]?.id, {
            moduleObject: this.moduleObject,
          }, (res) => {
            if (res.code == 200) {
              this.buttonList = res.data
              return
            }
            IDM.message.error(res.message)
          }, (err) => {
            this.buttonList = []
          })
          break;
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
      }
    },
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)
    },
    getExpressData(dataName,dataFiled,resultData){
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if(dataFiled){
        var filedExp = dataFiled;
        filedExp =
          dataName +
          (filedExp.startsWiths("[") ? "" : ".") +
          filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      return _defaultVal;
    },
    setContextValue(object) {
      console.log("统一接口设置的值", object);
      if (object.type != "pageCommonInterface") {
        return;
      }
      //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
      if (object.key == this.propData.dataName) {
        this.buttonList = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
        // this.$set(this.propData, "fontContent", this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data));
      }
    },
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    }
  }
};
</script>

<style scoped>
.btn-text {
  font: inherit;
}
</style>