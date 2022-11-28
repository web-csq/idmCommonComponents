<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
    <a-rate v-model="rateDataObj.value" :character="propData.character" :count="propData.count"
      @change="handleRateChange" :allow-half="propData.allowHalf" :allow-clear="propData.allowClear"
      :disabled="rateDisabled">
    </a-rate>
  </div>
</template>
<script>
export default {
  name: 'IRate',
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      rateDataObj: {
        value: 0,
        count: 5,
        disabled: false
      },
    }
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
  },
  computed: {
    rateDisabled() {
      if(this.propData.rateDisabled || this.rateDataObj.disabled) return true
      return false
    }
  },
  methods: {
    handleRateChange(rate) {
      const funcName = this.propData?.selectFunction?.[0]?.name
      window?.[funcName]?.call(this, rate)
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
    },
    convertAttrToStyleObject() {
      var styleObject = {}, fontObj = {}, selectFontObj = {};
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
            case "bgColor":
              if (element.hex8) {
                styleObject['background-color'] = element.hex8;
              }
              break;
            case 'font':
              IDM.style.setFontStyle(fontObj, element)
              break
            case 'selectFontColor':
              if (element.hex8) {
                selectFontObj['color'] = element.hex8;
              }
              break
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .ant-rate-star-first, .ant-rate-star-second', fontObj);
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .ant-rate', selectFontObj);
      this.initData();
    },
    reload() {
      //请求数据源
      this.initData();
    },
    initData() {
      let that = this;
      //所有地址的url参数转换
      switch (this.propData.dataType) {
        case 'dataSource':
          IDM.datasource.request(this.propData?.dataSource?.[0]?.id, {
            moduleObject: this.moduleObject,
          }, (res) => {
            if (res.code == 200) {
              this.rateDataObj = res.data
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
      if (object.type && object.type == "linkageShowModule") {
        this.showThisModuleHandle();
      } else if (object.type && object.type == "linkageHideModule") {
        this.hideThisModuleHandle();
      }
    },
    setContextValue(object) {
      console.log("统一接口设置的值", object);
      if (object.type != "pageCommonInterface") {
        return;
      }
      if (object.key == this.propData.dataName) {
        this.rateDataObj = this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data);
        // this.$set(this.propData, "fontContent", this.getExpressData(this.propData.dataName, this.propData.dataFiled, object.data));
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