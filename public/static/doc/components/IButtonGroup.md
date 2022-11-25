# 评论列表

按钮组

## 组件类名（className）

IButtonGroup

## 组件类 ID（classId）

idm.component.idmCommonComponent.ibuttongroup

## 组件开发语言（comLangue）

vue

## 组件类型（comType）

common

## 所在代码包版本

idmCommonComponent@1.0.0

## 组件属性

### 唯一标识【ctrlId】

### 高级

#### 数据源

数据源返回格式

```ts
interface Button {
    key: string                                        // 图标key
    btnText: string                                    // 按钮文本

    icon?: string                                      // 图标名称
    iconSize?: number                                  // 图标尺寸
    iconColor?: IDM.Component.Prop.ColorPicker         // 图标颜色
    iconBox?: IDM.Component.Prop.Box                   // 图标边距

    btnBox?: IDM.Component.Prop.Box                    // 按钮边距
    btnBorder?: IDM.Component.Prop.Border              // 按钮边框
    btnFont?: IDM.Component.Prop.Font                  // 按钮文本
}

{
    code: 200,
    data: Array<Button>,
    message: 'success'
}
```
