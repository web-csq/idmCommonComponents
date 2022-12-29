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
    class="i-infoList-outer"
    ref="module_ref"
    :style="
      propData.heightType == 'adaptive' ? { height: moduleHeight + 'px' } : {}
    "
  >
    <div key="i-infoList-header" class="i-infoList-header" v-if="propData.isShowTitleBar">
      <div class="i-infoList-header-main">
        <div class="i-infoList-header-tit">
          <span v-if="propData.titleIconPosition === 'right'">{{ propData.title }}</span>
          <div class="i-infoList-header-tit-icon" v-if="propData.showIcon">
            <svg
              v-if="propData.titleIcon && propData.titleIcon.length > 0"
              class="idm_filed_svg_icon"
              aria-hidden="true"
            >
              <use :xlink:href="`#${propData.titleIcon && propData.titleIcon[0]}`" />
            </svg>
            <svg-icon v-else class="idm_filed_svg_icon" icon-class="application-icon" />
          </div>
          <span v-if="propData.titleIconPosition === 'left'">{{ propData.title }}</span>
        </div>
      </div>
      <div class="i-infoList-header-more" v-if="propData.showMore" @click="onMoreClick">
        <!-- {{propData.moreDesc || ''}} -->
        <svg
          v-if="propData.moreIcon && propData.moreIcon.length > 0"
          class="idm_filed_svg_icon"
          aria-hidden="true"
        >
          <use :xlink:href="`#${propData.moreIcon && propData.moreIcon[0]}`" />
        </svg>
        <svg-icon v-else icon-class="gengduo" className="idm_filed_svg_icon"/>
      </div>
    </div>
    <div key="i-infoList-content" class="i-infoList-content">
      <div
        key="i-infoList-content-list"
        class="i-infoList-content-list"
        v-show="data && data.length"
        v-infinite-scroll="initData"
        :infinite-scroll-disabled="end"
        :infinite-scroll-distance="10"
      >
        <div class="i-infoList-row" v-for="item,index in data" :key="index" @click="onRowClick(item, index)">
          <div :class="`i-infoList-cell i-infoList-cell-${f.key}`" v-for="f,i in propData.cellsList" :key="i" @click="onCellClick(item, index, f, i)">
            <div v-if="leftSignsList && leftSignsList.length" class="left-area">
              <template v-for="s,j in leftSignsList">
                <template v-if="s.key == f.key && (s.compareField ? s.compareValue ? item[s.compareField] == s.compareValue : item[s.compareField] : true)">
                  <div :class="`tag tag-${s.key}`" :key="j" v-if="s.type == 'tag'">{{s.name}}</div>
                  <div :class="`icon icon-${s.key}`" :key="j" v-else-if="s.type == 'icon'">
                    <svg
                      v-if="s.icon && s.icon.length"
                      class="idm_filed_svg_icon"
                      aria-hidden="true"
                    >
                      <use :xlink:href="`#${s.icon && s.icon[0]}`" />
                    </svg>
                  </div>
                </template>
              </template>
            </div>
            <div :class="{'text': true, 'text-ellipsis': !f.textWrap}">{{f.textFiled ? f.textFiled.includes("@[") ? IDM.express.replace(f.textFiled, item, true) : getExpressData('data', f.textFiled, item) : item}}</div>
            <div v-if="rightSignsList && rightSignsList.length" class="right-area">
              <template v-for="s,j in rightSignsList">
                <template v-if="s.key == f.key && (s.compareField ? s.compareValue ? item[s.compareField] == s.compareValue : item[s.compareField] : true)">
                  <div :class="`tag tag-${s.key}`" :key="j" v-if="s.type == 'tag'">{{s.name}}</div>
                  <div :class="`icon icon-${s.key}`" :key="j" v-else-if="s.type == 'icon'">
                    <svg
                      v-if="s.icon && s.icon.length"
                      class="idm_filed_svg_icon"
                      aria-hidden="true"
                    >
                      <use :xlink:href="`#${s.icon && s.icon[0]}`" />
                    </svg>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
        <div class="i-infoList-content-loading" v-show="loading" v-if="propData.loadingDesc">
          <div>{{propData.loadingDesc}}</div>
        </div>
        <div class="i-infoList-content-end" v-show="end" v-if="propData.endDesc">
          <div>{{propData.endDesc}}</div>
        </div>
      </div>
      <div class="i-infoList-content-empty" v-show="!data || !data.length" v-if="propData.emptyDesc">
        <div>{{propData.emptyDesc}}</div>
      </div>
    </div>
  </div>
</template>

<script>
const devResult = () => {
  const arr = [];
  for(let i=1;i<10;i++){
    arr.push({
      text: '如何高效的提升自己的阅读能力',
      time: '2022-12-07'
    })
  }
  arr[3].showzt = true;
  return arr;
}
import infiniteScroll from 'vue-infinite-scroll';
export default {
  name: 'IInfoList',
  directives: { infiniteScroll },
  data() {
    return {
      moduleObject: {},
      currentEquipWidth: 0,
      moduleHeight: 0,
      propData: this.$root.propData.compositeAttr || {
        // loadingDesc: '加载中...',
        // cellsList: [{
        //   key: 1,
        //   textFiled: 'text'
        // },{
        //   key: 2,
        //   textFiled: 'time'
        // }],
        // signsList: [{
        //   key: 1,
        //   type: 'tag',
        //   position: 'left',
        //   name: '专题',
        //   compareField: 'showzt'
        // },{
        //   key: 1,
        //   type: 'tag',
        //   position: 'left',
        //   name: '热门'
        // }]
      },
      loading: false,
      end: false,
      pageIndex: 1,
      data: [],
    };
  },
  props: {},
  watch: {
    'propData.dataSource': {
      handler(value) {
        this.data = [];
        this.end = false;
        this.initData();
      },
      deep: true
    }
  },
  computed: {
    leftSignsList() {
      return this.propData.signsList && this.propData.signsList.filter(item => item.position == 'left')
    },
    rightSignsList() {
      return this.propData.signsList && this.propData.signsList.filter(item => item.position == 'right')
    },
  },
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.getClientWidth();
    this.convertAttrToStyleObject();
    this.convertThemeListAttrToStyleObject();
    this.convertCellAttrToStyleObject();
    this.convertSignAttrToStyleObject();
    this.resizeContentWrapperHeight();
    this.initData();
  },
  methods: {
    onMoreClick(){
      if (this.moduleObject.env !== 'production') {
        return;
      }
      if (this.propData.moreJumpType === 'custom') {
        this.customFunctionHandle(this.propData.customMoreBtnFunction);
      } else if (this.propData.moreJumpType === 'tab' && this.propData.moreUrl) {
        const item = {
          isTabReload: "-1",
          name: this.propData.title,
          action: IDM.url.getWebPath(this.propData.moreUrl)
        };
        window.$$iframeCtrl && window.$$iframeCtrl.addTab(item);
      } else if (this.propData.moreUrl) {
        const url = IDM.url.getWebPath(this.propData.moreUrl);
        window.open(url, this.propData.moreJumpType || '_block');
      }
    },
    onRowClick(item, index) {
      if (this.moduleObject.env !== 'production') {
        return;
      }
      this.customFunctionHandle(this.propData.handleRowClick, {
        rowData: item,
        rowIndex: index,
        data: this.data
      })
    },
    onCellClick(item, index, f, i) {
      if (this.moduleObject.env !== 'production') {
        return;
      }
      this.customFunctionHandle(f.customFunction, {
        rowData: item,
        rowIndex: index,
        cellIndex: i,
        cellKey: f.key,
        data: this.data
      })
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      // this.initData();
      this.convertAttrToStyleObject();
      this.convertThemeListAttrToStyleObject();
      this.convertCellAttrToStyleObject();
      this.convertSignAttrToStyleObject();
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
        case 'websocket':
          if (this.propData.messageRefreshKey && messageObject.message) {
            const messageData =
              (typeof messageObject.message === 'string' && JSON.parse(messageObject.message)) ||
              messageObject.message;
            const arr = Array.isArray(this.propData.messageRefreshKey)
              ? this.propData.messageRefreshKey
              : [this.propData.messageRefreshKey];
            if (messageData.badgeType && arr.includes(messageData.badgeType)) {
              this.initData();
            }
          }
          break;
        case 'linkageReload':
          this.initData();
          break;
        case 'pageResize':
          this.currentEquipWidth = messageObject.message?.width;
          if (this.propData.enableFontAdaptation) {
            this.convertAttrToStyleObject();
            this.convertCellAttrToStyleObject();
            this.convertSignAttrToStyleObject();
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
          this.data = data || [];
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
        _defaultVal = window.IDM.express.replace.call(this, '@[' + filedExp + ']', dataObject, false);
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
    initData() {
      if (this.propData.dataType !== 'dataSource' || !this.propData.dataSource || !this.propData.dataSource[0]?.id) {
        if (this.moduleObject.env !== 'production') {
          this.data = devResult();
          this.end = true;
        }
        return;
      }
      this.loading = true
      IDM.datasource.request(this.propData.dataSource[0]?.id, {
        moduleObject: this.moduleObject,
        param: {
          pageIndex: this.pageIndex,
        }
      }, (data) => {
        this.loading = false
        if (data) {
          this.data = [...this.data, ...data.data];
          this.pageIndex = this.pageIndex + 1;
          this.data.length >= data.total ? this.end = true : this.end = false;
        }
      }, (err) => {
        this.loading = false
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
      const headerStyleObject = {};
      const titleStyleObject = {};
      const innerCardStyleObject = {};
      const iconStyleObject = {};
      const moreStyleObject = {};
      const rowStyleObject = {};
      const emptyStyleObject = {};
      const loadingStyleObject = {};
      const endStyleObject = {};

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
      if (this.propData.innerBgSize && this.propData.innerBgSize == 'custom') {
        innerCardStyleObject['background-size'] =
          (this.propData.innerBgSizeWidth
            ? this.propData.innerBgSizeWidth.inputVal + this.propData.innerBgSizeWidth.selectVal
            : 'auto') +
          ' ' +
          (this.propData.innerBgSizeHeight
            ? this.propData.innerBgSizeHeight.inputVal + this.propData.innerBgSizeHeight.selectVal
            : 'auto');
      } else if (this.propData.innerBgSize) {
        innerCardStyleObject['background-size'] = this.propData.innerBgSize;
      }

      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject['background-position-x'] =
          this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.innerPositionX && this.propData.innerPositionX.inputVal) {
        innerCardStyleObject['background-position-x'] =
          this.propData.innerPositionX.inputVal + this.propData.innerPositionX.selectVal;
      }

      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject['background-position-y'] =
          this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }
      if (this.propData.innerPositionY && this.propData.innerPositionY.inputVal) {
        innerCardStyleObject['background-position-y'] =
          this.propData.innerPositionY.inputVal + this.propData.innerPositionY.selectVal;
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
            case 'bgColor':
              styleObject['background-color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
              break;
            case 'innerBgColor':
              innerCardStyleObject['background-color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
              break;
            case 'boxShadow':
              styleObject['box-shadow'] = element;
              break;
            case 'box':
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case 'innerBox':
              IDM.style.setBoxStyle(innerCardStyleObject, element);
              break;
            case 'bgImgUrl':
              styleObject['background-image'] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case 'innerBgImgUrl':
              innerCardStyleObject['background-image'] = `url(${window.IDM.url.getWebPath(
                element
              )})`;
              break;
            case 'bgRepeat':
              //平铺模式
              styleObject['background-repeat'] = element;
              break;
            case 'innerBgRepeat':
              //平铺模式
              innerCardStyleObject['background-repeat'] = element;
              break;
            case 'bgAttachment':
              //背景模式
              styleObject['background-attachment'] = element;
              break;
            case 'innerBgAttachment':
              //背景模式
              innerCardStyleObject['background-attachment'] = element;
              break;
            case 'border':
              IDM.style.setBorderStyle(styleObject, element);
              break;
            case 'innerBorder':
              IDM.style.setBorderStyle(innerCardStyleObject, element);
              break;
            case 'titleFont':
              IDM.style.setFontStyle(titleStyleObject, element);
              titleStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                element.fontSize + element.fontSizeUnit
              break;
            case 'titleIconColor':
              iconStyleObject['color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
              break;
            case 'titleIconSize':
              iconStyleObject['font-size'] = this.translatePxToAdaptation(element) + 'px';
              break;
            case 'moreIconColor':
              moreStyleObject['color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
              break;
            case 'moreIconSize':
              moreStyleObject['font-size'] = this.translatePxToAdaptation(element) + 'px';
              break;
            case 'headerBox':
              IDM.style.setBoxStyle(headerStyleObject, element);
              break;
            case 'loadingFont':
              IDM.style.setFontStyle(loadingStyleObject, element);
              loadingStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                element.fontSize + element.fontSizeUnit
              IDM.style.setFontStyle(endStyleObject, element);
              endStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                element.fontSize + element.fontSizeUnit
              break;
            case 'emptyFont':
              IDM.style.setFontStyle(emptyStyleObject, element);
              emptyStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                element.fontSize + element.fontSizeUnit
              break;
            case 'rowHeight':
              rowStyleObject['height'] = element;
              break;
            case 'rowBox':
              IDM.style.setBoxStyle(rowStyleObject, element);
              break;
            case 'rowBorder':
              IDM.style.setBorderStyle(rowStyleObject, element);
              break;
          }
        }
      }
      // 内层容器高度适配，若外层有高度，则内层随外层缩放。若外层没有高度，则由内层容器的子元素撑起。前提设置的有外层容器高度属性，若无此值不走此逻辑，取下面style中的预设
      // if (styleObject.height && styleObject.height != 'auto') {
      //   innerCardStyleObject.height = 0;
      // } else if (styleObject.height && styleObject.height == 'auto') {
      //   innerCardStyleObject.height = 'auto';
      // }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + ' .i-infoList-content',
        innerCardStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + ' .i-infoList-header',
        headerStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + ' .i-infoList-header-tit span',
        titleStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid +
          ' #' +
          this.moduleObject.id +
          ' .i-infoList-header-tit .i-infoList-header-tit-icon',
        iconStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid +
          ' #' +
          this.moduleObject.id +
          ' .i-infoList-header .i-infoList-header-more',
        moreStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid +
          ' #' +
          this.moduleObject.id +
          ' .i-infoList-content .i-infoList-row',
        rowStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid +
          ' #' +
          this.moduleObject.id +
          ' .i-infoList-content .i-infoList-content-loading',
        loadingStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid +
          ' #' +
          this.moduleObject.id +
          ' .i-infoList-content .i-infoList-content-end',
        endStyleObject
      );
      window.IDM.setStyleToPageHead(
        this.moduleObject.packageid +
          ' #' +
          this.moduleObject.id +
          ' .i-infoList-content .i-infoList-content-empty',
        emptyStyleObject
      );
    },
    /**
     * 主题颜色
     */
    convertThemeListAttrToStyleObject() {
      const themeList = this.propData.themeList;
      if (!themeList) {
        return;
      }
      const themeNamePrefix =
        IDM.setting && IDM.setting.applications && IDM.setting.applications.themeNamePrefix
          ? IDM.setting.applications.themeNamePrefix
          : 'idm-theme-';
      for (var i = 0; i < themeList.length; i++) {
        const item = themeList[i];

        IDM.setStyleToPageHead(
          '.' +
            themeNamePrefix +
            item.key +
            ' .i-infoList-outer .i-infoList-header-tit .i-infoList-header-tit-icon',
          {color: item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''}
        );
        IDM.setStyleToPageHead(
          '.' +
            themeNamePrefix +
            item.key +
            ' .i-infoList-outer .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .left-area .tag',
          {
            color: item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : '',
            'border-color': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''
          }
        );
        IDM.setStyleToPageHead(
          '.' +
            themeNamePrefix +
            item.key +
            ' .i-infoList-outer .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .right-area .tag',
          {
            color: item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : '',
            'border-color': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''
          }
        );
        IDM.setStyleToPageHead(
          '.' +
            themeNamePrefix +
            item.key +
            ' .i-infoList-outer .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .left-area .icon',
          {color: item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''}
        );
        IDM.setStyleToPageHead(
          '.' +
            themeNamePrefix +
            item.key +
            ' .i-infoList-outer .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .right-area .icon',
          {color: item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''}
        );
        // IDM.setStyleToPageHead(
        //   '.' +
        //     themeNamePrefix +
        //     item.key +
        //     ' .i-infoList-outer .i-infoList-content',
        //   {'border-color': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''}
        // );
      }
    },
    /**
     * 单元格样式
     */
    convertCellAttrToStyleObject() {
      const cellsList = this.propData.cellsList;
      if (!cellsList) {
        return;
      }
      for (var i = 0; i < cellsList.length; i++) {
        const cell = cellsList[i];
        if (!(cell.key)) {
          continue;
        }
        const cellStyleObject = {};
        const cellFontStyleObject = {};
        for (const key in cell) {
          if (cell.hasOwnProperty.call(cell, key)) {
            const element = cell[key];
            if (!element && element !== false && element != 0) {
              continue;
            }
            switch (key) {
              case 'cellFont':
                IDM.style.setFontStyle(cellFontStyleObject, element);
                cellFontStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                  this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                  element.fontSize + element.fontSizeUnit
                break;
              case 'cellTextAlign':
                cellStyleObject['justify-content'] = element;
                break;
              case 'cellWidth':
                cellStyleObject['width'] = element;
                break;
              case 'cellBox':
                IDM.style.setBoxStyle(cellStyleObject, element);
                break;
            }
          }
        }
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell-${cell.key}`,
          cellStyleObject
        );
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell-${cell.key} .text`,
          cellFontStyleObject
        );
      }
    },
    /**
     * 标记样式
     */
    convertSignAttrToStyleObject() {
      const signsList = this.propData.signsList;
      if (!signsList) {
        return;
      }
      for (var i = 0; i < signsList.length; i++) {
        const sign = signsList[i];
        if (!(sign.key)) {
          continue;
        }
        const tagStyleObject = {};
        const iconStyleObject = {};
        for (const key in sign) {
          if (sign.hasOwnProperty.call(sign, key)) {
            const element = sign[key];
            if (!element && element !== false && element != 0) {
              continue;
            }
            switch (key) {
              case 'tagFont':
                IDM.style.setFontStyle(tagStyleObject, element);
                tagStyleObject['font-size'] = element.fontSizeUnit == 'px' ?
                  this.translatePxToAdaptation(element.fontSize) + element.fontSizeUnit :
                  element.fontSize + element.fontSizeUnit
                break;
              case 'tagBorder':
                IDM.style.setBorderStyle(tagStyleObject, element);
                break;
              case 'iconSize':
                iconStyleObject['font-size'] = this.translatePxToAdaptation(element) + 'px';
                break;
              case 'iconColor':
                iconStyleObject['color'] = element && element.hex8 ? IDM.hex8ToRgbaString(element.hex8) : '';
                break;
              case 'signBox':
                IDM.style.setBoxStyle(tagStyleObject, element);
                IDM.style.setBoxStyle(iconStyleObject, element);
                break;
            }
          }
        }
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .left-area .tag-${sign.key}`,
          tagStyleObject
        );
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .right-area .tag-${sign.key}`,
          tagStyleObject
        );
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .left-area .icon-${sign.key}`,
          iconStyleObject
        );
        window.IDM.setStyleToPageHead(
          this.moduleObject.packageid + ' #' + this.moduleObject.id + ` .i-infoList-content .i-infoList-content-list .i-infoList-row .i-infoList-cell .right-area .icon-${sign.key}`,
          iconStyleObject
        );
      }
    }
  }
};
</script>

<style lang="scss">
.i-infoList-outer {
  width: auto;
  box-sizing: border-box;
  padding: 0 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 300px;
  overflow: hidden;

  .i-infoList-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .i-infoList-header-main {
      // width: 86%;
      flex-grow: 1;
      display: flex;
      align-items: center;

      .i-infoList-header-tit {
        font-size: 16px;
        text-decoration: none;
        max-width: 60%;
        display: flex;
        align-items: center;
        line-height: 40px;

        .i-infoList-header-tit-icon {
          margin-right: 5px;
          display: inline-block;
          flex: 1;
        }

        span {
          margin-right: 5px;
          width: 90%;
          flex: 8;
        }

        .idm_filed_svg_icon {
          font-size: 1em;
          width: 1em;
          height: 1em;
          fill: currentColor;
          vertical-align: -0.15em;
          outline: none;
        }
      }
    }

    .i-infoList-header-more {
      margin: 0 10px;
      cursor: pointer;
      &:hover {
        opacity: 0.7;
      }
      .idm_filed_svg_icon {
        font-size: 1em;
        width: 1em;
        height: 1em;
        fill: currentColor;
        /* vertical-align: -0.15em; */
        outline: none;
      }
    }
  }

  .i-infoList-content {
    flex-grow: 1;
    flex-shrink: 1;
    height: 0;
    border-top: 1px solid #ccc;

    .i-infoList-content-list {
      overflow: auto;
      height: 100%;
      scrollbar-width: none; /* firefox */
      -ms-overflow-style: none; /* IE 10+ */
      &::-webkit-scrollbar {
          display: none; /* Chrome Safari */
      }

      .i-infoList-row {
        display: flex;
        padding: 10px 0;

        .i-infoList-cell {
          width: 100px;
          flex-grow: 1;
          flex-shrink: 1;
          display: flex;

          .text {
          }

          .text-ellipsis {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }

          .left-area,.right-area{
            display: flex;
            align-items: center;
            justify-content: center;

            .tag {
              flex-shrink: 0;
              font-size: 12px;
              line-height: 18px;
              color: #0079FF;
              border: 1px solid rgba(0,145,255,1);
              border-radius: 2px;
              padding: 0 5px;
              margin-right: 5px;
            }

            .icon {
              margin-right: 5px;
              color: #999999;
              .idm_filed_svg_icon {
                font-size: 1em;
                width: 1em;
                height: 1em;
                fill: currentColor;
                /* vertical-align: -0.15em; */
                outline: none;
              }
            }
          }
        }
      }

      .i-infoList-content-loading {
        text-align: center;
        color: #999;
        line-height: 30px;
      }

      .i-infoList-content-end {
        text-align: center;
        color: #999;
        line-height: 30px;
      }
    }

    .i-infoList-content-empty {
      height: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
  }
}
</style>
