# 导航栏

通用导航栏组件

## 组件类名（className）

ICommonNavBar

## 组件类 ID（classId）

idm.component.idmCommonComponent.icommonnavbar

## 组件开发语言（comLangue）

vue

## 组件类型（comType）

common

## 所在代码包版本

idmCommonComponent@1.0.0

## 组件属性

### 唯一标识【ctrlId】

### 高级

##### 数据源返回格式

```ts

class MenuItem {
    id: string
    title: string
    [otherKey]: any
}

{
    code: 200,
    data: {
        defaultSelectedKeys: Array<string>,
        menuList: Array<MenuItem>
    },
    message: 'success'
}

```
