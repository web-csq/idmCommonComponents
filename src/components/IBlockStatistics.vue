<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    class="i-blockStatistics-outer"
    ref="module_ref"
    :style="
      propData.heightType == 'adaptive' ? { height: moduleHeight + 'px' } : {}
    "
  >
    <div key="i-blockStatistics-content" class="i-blockStatistics-content" :style="{'justify-content': !propData.blockSpace ? 'space-between' : 'flex-start'}">
      <template v-for="block,index in propData.blockList">
        <div
          :key="index"
          :class="`i-blockStatistics-content-block i-blockStatistics-content-block-${index}`"
          :style="{'margin-right': !propData.blockSpace ? 0 : undefined, width: !propData.blockWidth ? 'auto' : propData.blockWidth + 'px', 'flex-grow': !propData.blockWidth ? 1 : 0}"
          v-if="block.dataFiled && (getExpressData('data', block.dataFiled, data) || getExpressData('data', block.dataFiled, data) === 0)"
          @click="onBlockClick(getExpressData('data', block.dataFiled, data), block.dataFiled)"
        >
          <div class="name">{{block.nameType == 'dataSource' ? getElementData(block.dataFiled, block.nameFiled) : block.name}}</div>
          <div class="count">
            <span class="num">{{block.countFiled ? getElementData(block.dataFiled, block.countFiled) : getExpressData('data', block.dataFiled, data)}}</span>
            <span v-if="block.unitName" class="unit">{{block.unitName}}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
const devResult = () => ({
  createNum:{
    name: '知识创建数',
    count: 10
  }
});
export default {
  name: 'IBlockStatistics',
  data() {
    return {
      moduleObject: {},
      currentEquipWidth: 0,
      moduleHeight: 0,
      propData: this.$root.propData.compositeAttr || {
        blockWidth: 135,
        blockSpace: 10,
        blockList: [{
          key: 1,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count',
          unitName: '%'
        },{
          key: 2,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count',
          unitName: '个'
        },{
          key: 3,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count',
          unitName: '个'
        },{
          key: 4,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count',
          unitName: '个'
        },{
          key: 5,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count',
          unitName: '个'
        },{
          key: 6,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count'
        },{
          key: 7,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count',
          unitName: '个'
        },{
          key: 8,
          nameType: 'dataSource',
          dataFiled: 'createNum',
          nameFiled: 'name',
          countFiled: 'count',
          unitName: '个'
        }]
      },
      data: {},
    };
  },
  props: {},
  watch: {
    'propData.dataSource': {
      handler(newValue, oldValue) {
        if (this.moduleObject.env !== 'production' && ((newValue && newValue[0]?.id) != (oldValue && oldValue[0]?.id))) {
          this.initData();
        }
      },
      deep: true,
      immediate: false
    }
  },
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.getClientWidth();
    this.convertAttrToStyleObject();
    this.convertBlockAttrToStyleObject();
    this.resizeContentWrapperHeight();
    this.propData.defaultInitData && this.initData();
  },
  methods: {
    getElementData(dataFiled, elementFiled) {
      const data = this.getExpressData('data', dataFiled, this.data)
      return this.getExpressData('data', elementFiled, data)
    },
    onBlockClick(item, dataFiled){
      if (this.moduleObject.env !== 'production') {
        return;
      }
      this.customFunctionHandle(this.propData.handleBlockClick, {
        blockData: item,
        dataFiled: dataFiled,
        data: this.data
      })
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
      this.convertBlockAttrToStyleObject();
      this.resizeContentWrapperHeight();
    },
    resizeContentWrapperHeight(wrapperHeight, wrapperWidth) {
      wrapperHeight = wrapperHeight || $('#' + this.moduleObject.packageid)
      .parents('.fsl-region-element')
      .height();
      wrapperWidth = wrapperWidth || $('#' + this.moduleObject.packageid)
      .parents('.fsl-region-element')
      .width();
      let moduleTBMarginNumber = 0;
      const iAttrArray = ['marginTopVal', 'marginBottomVal'];
      iAttrArray.forEach(item => {
        if (this.propData.box && this.propData.box[item]) {
          if (this.propData.box[item].indexOf('%') > -1) {
            //用宽度计算出实际的px
            moduleTBMarginNumber =
              moduleTBMarginNumber +
              (parseFloat(this.propData.box[item].replace('%', '')) / 100) * wrapperWidth;
          } else {
            moduleTBMarginNumber =
              moduleTBMarginNumber + parseFloat(this.propData.box[item].replace('px', ''));
          }
        }
      });
      this.moduleHeight = wrapperHeight - moduleTBMarginNumber;
    },
    /**
     * 组件通信：接收消息的方法
     */
    receiveBroadcastMessage(messageObject) {
      switch (messageObject.type) {
        case 'linkageReload':
          this.initData(messageObject.message || {});
          break;
        case 'linkageDemand':
          this.initData(messageObject.message || {});
          break;
        case 'pageResize':
          this.currentEquipWidth = messageObject.message?.width;
          if (this.propData.enableFontAdaptation) {
            this.convertAttrToStyleObject();
            this.convertBlockAttrToStyleObject();
          }
          break;
        case 'regionResize':
          if (messageObject.message && messageObject.message.gridEleTarget) {
            const {offsetHeight, offsetWidth} = messageObject.message.gridEleTarget
            this.resizeContentWrapperHeight(offsetHeight, offsetWidth);
          }
          break;
      }
    },
    /**
     * 交互功能：设置组件的上下文内容值
     * @param {
     *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）、"
     *  key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
     *  data:"数据集，内容为：字符串 or 数组 or 对象"
     * }
     */
    setContextValue(object) {
      if (object.type == 'pageCommonInterface' && object.key == this.propData.dataName && this.propData.dataType === 'pageCommonInterface') {
        let data = this.propData.contextDataFiled ? this.getExpressData(this.propData.dataName, this.propData.contextDataFiled, object.data) : object.data;
        if (data !== undefined) {
          data = this.customFormat(this.propData.contextCustomFunction, data);
          this.data = data;
        }
      }
    },
    /**
     * 通用的获取表达式匹配后的结果
     */
    getExpressData(dataName, dataFiled, resultData) {
      //给defaultValue设置dataFiled的值
      let _defaultVal = undefined;
      if (dataFiled) {
        let filedExp = dataFiled;
        filedExp = dataName + (filedExp.startsWiths('[') ? '' : '.') + filedExp;
        let dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(this, '@[' + filedExp + ']', dataObject, true);
      }
      return _defaultVal;
    },
    customFormat(customFunction, data) {
      if (customFunction && customFunction[0] && customFunction[0].name) {
        data =
          window[customFunction[0].name] &&
          window[customFunction[0].name].call(this, {
            commonParam: this.commonParam(),
            customParam: customFunction[0].param,
            data
          });
      }
      return data;
    },
    customFunctionHandle(customFunction, param = {}) {
      if (customFunction && customFunction[0] && customFunction[0].name) {
        return window[customFunction[0].name] &&
          window[customFunction[0].name].call(this, {
            commonParam: this.commonParam(),
            customParam: customFunction[0].param,
            ...param
          });
      }
    },
    commonParam() {
      return {
        moduleObject: this.moduleObject,
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : '',
        urlObject: IDM.url.queryObject()
      };
    },
    /**
     * 请求数据
     */
    initData(param = {}) {
      if (this.propData.dataType !== 'dataSource' || !this.propData.dataSource || !this.propData.dataSource[0]?.id) {
        if (this.moduleObject.env !== 'production') {
          this.data = devResult();
        }
        return;
      }
      IDM.datasource.request(this.propData.dataSource[0]?.id, {
        moduleObject: this.moduleObject,
        param
      }, (data) => {
        this.data = data;
      })
    },
    getClientWidth() {
      if (this.moduleObject.env == 'develop') {
        return;
      } else {
        this.currentEquipWidth = window.innerWidth;
      }
    },
    /**
     * 移动端文字大小自适应
     */
    translatePxToAdaptation(data) {
      const clientWidth = this.currentEquipWidth;
      if (!data || !clientWidth || !this.propData.enableFontAdaptation) {
        return data;
      }
      const adaptationBase = this.propData.adaptationBase || 414;
      const adaptationPercent = this.propData.adaptationPercent || 1;
      const percent = (clientWidth / adaptationBase - 1) * (adaptationPercent - 1) + 1;
      return Math.round(data * percent);
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      const styleObject = {};
      const blockStyleObject = {};
      const blockNameStyleObject = {};
      const blockNumStyleObject = {};
      const blockUnitStyleObject = {};
      const blockSpaceStyleObject = {};

      if (this.propData.bgSize && this.propData.bgSize == 'custom') {
        styleObject['background-size'] =
          (this.propData.bgSizeWidth
            ? this.propData.bgSizeWidth.inputVal + this.propData.bgSizeWidth.selectVal
            : 'auto') +
          ' ' +
          (this.propData.bgSizeHeight
            ? this.propData.bgSizeHeight.inputVal + this.propData.bgSizeHeight.selectVal
            : 'auto');
      } else if (this.propData.bgSize) {
        styleObject['background-size'] = this.propData.bgSize;
      }
      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject['background-position-x'] =
          this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject['background-position-y'] =
          this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case 'width':
            case 'height':
              styleObject[key] = element;
              break;
            case 'boxShadow':
              styleObject['box-shadow'] = element;
              break;
            case 'box':
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case 'border':
              IDM.style.setBorderStyle(styleObject, element);
              break;
            case 'bgColor':
              styleObject['background-color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
              break;
            case 'bgImgUrl':
              styleObject['background-image'] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case 'bgRepeat':
              //平铺模式
              styleObject['background-repeat'] = element;
              break;
            case 'bgAttachment':
              //背景模式
              styleObject['background-attachment'] = element;
              break;
            case 'blockNameFont':
              IDM.style.setFontStyle(blockNameStyleObject, element);
              blockNameStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                element.fontSize + element.fontSizeUnit
              break;
            case 'blockNumFont':
              IDM.style.setFontStyle(blockNumStyleObject, element);
              blockNumStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                element.fontSize + element.fontSizeUnit
              break;
            case 'blockUnitFont':
              IDM.style.setFontStyle(blockUnitStyleObject, element);
              blockUnitStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                element.fontSize + element.fontSizeUnit
              break;
            case 'blockBorder':
              IDM.style.setBorderStyle(blockStyleObject, element);
              break;
            case 'blockBox':
              IDM.style.setBoxStyle(blockStyleObject, element);
              break;
            case 'blockSpace':
              blockSpaceStyleObject['margin-right'] = element + 'px';
              break;
            case 'blockBoxShadow':
              blockStyleObject['box-shadow'] = element;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content-block`,
        blockStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content-block .name`,
        blockNameStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content-block .num`,
        blockNumStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content-block .unit`,
        blockUnitStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content-block:not(:last-child)`,
        blockSpaceStyleObject
      );
    },
    /**
     * 每个方块样式
     */
    convertBlockAttrToStyleObject() {
      const blockList = this.propData.blockList;
      if (!blockList) {
        return;
      }
      for (var i = 0; i < blockList.length; i++) {
        const block = blockList[i];
        if (!(block.dataFiled)) {
          continue;
        }
        const blockStyleObject = {};

        if (block.blockBgSize && block.blockBgSize == 'custom') {
          blockStyleObject['background-size'] =
            (block.blockBgSizeWidth
              ? block.blockBgSizeWidth.inputVal + block.blockBgSizeWidth.selectVal
              : 'auto') +
            ' ' +
            (block.blockBgSizeHeight
              ? block.blockBgSizeHeight.inputVal + block.blockBgSizeHeight.selectVal
              : 'auto');
        } else if (block.blockBgSize) {
          blockStyleObject['background-size'] = block.blockBgSize;
        }
        if (block.blockPositionX && block.blockPositionX.inputVal) {
          blockStyleObject['background-position-x'] =
            block.blockPositionX.inputVal + block.blockPositionX.selectVal;
        }
        if (block.blockPositionY && block.blockPositionY.inputVal) {
          blockStyleObject['background-position-y'] =
            block.blockPositionY.inputVal + block.blockPositionY.selectVal;
        }
        for (const key in block) {
          if (block.hasOwnProperty.call(block, key)) {
            const element = block[key];
            if (!element && element !== false && element != 0) {
              continue;
            }
            switch (key) {
              case 'blockBgColor':
                blockStyleObject['background-color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
                break;
              case 'blockBgImgUrl':
                blockStyleObject['background-image'] = `url(${window.IDM.url.getWebPath(element)})`;
                break;
              case 'blockBgRepeat':
                //平铺模式
                blockStyleObject['background-repeat'] = element;
                break;
              case 'blockBgAttachment':
                //背景模式
                blockStyleObject['background-attachment'] = element;
                break;
              case 'blockBorderColor':
                blockStyleObject['border-color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
                break;
            }
          }
        }
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content .i-blockStatistics-content-block-${block.dataFiled}`,
          blockStyleObject
        );
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content .i-blockStatistics-content-block-${block.dataFiled} .count .num`,
          {color: block.blockFontColor && block.blockFontColor.hex8 ? IDM.hex8ToRgbaString(block.blockFontColor.hex8) : ''}
        );
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-blockStatistics-content .i-blockStatistics-content-block-${block.dataFiled} .count .unit`,
          {color: block.blockFontColor && block.blockFontColor.hex8 ? IDM.hex8ToRgbaString(block.blockFontColor.hex8) : ''}
        );
      }
    }
  }
};
</script>

<style lang="scss">
.i-blockStatistics-outer {
  width: auto;
  box-sizing: border-box;
  padding: 0 10px;
  position: relative;
  height: 120px;
  overflow: hidden;

  .i-blockStatistics-content {
    height: 100%;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;

    .i-blockStatistics-content-block {
      flex-grow: 0;
      flex-shrink: 1;
      height: 100%;
      width: 135px;
      box-sizing: border-box;
      background: #F3F6FD;
      border: 1px solid rgba(199,219,253,1);
      border-radius: 8px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      overflow: hidden;
      &:not(:last-child) {
        margin-right: 10px;
      }
      .name {
        font-size: 16px;
        color: #333333;
        letter-spacing: 0;
        text-align: center;
        font-weight: 500;
        line-height: 36px;
      }
      .count {
        display: flex;
        justify-content: center;
        flex-direction: row;
        align-items: baseline;
        .num{
          font-size: 32px;
          color: #2B72EE;
          font-weight: 700;
          line-height: 1;
        }
        .unit{
          font-size: 16px;
          color: #2B72EE;
          font-weight: 600;
          line-height: 1;
        }
      }
    }
  }
}
</style>
