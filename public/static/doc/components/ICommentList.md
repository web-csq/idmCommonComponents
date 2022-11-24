# 评论列表

通用评论列表组件

## 组件类名（className）

ICommentList

## 组件类 ID（classId）

idm.component.idmCommonComponent.icommentlist

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

组件操作数据的方法，参数格式

```js
enum Type {
    'list'        //  评论列表
    'delete'      //  删除
    'submit'      //  提交评论
    'like'        //  点赞
    'unLike'      //  取消点赞
}
interface Params {
    contentId       // 评论所属内容的id
    sortDir         //	1、时间   2、点赞  排序模式
    showLike        //	true、false  点赞数是否显示
    page            //	1 分页页数
    showNum         //  评论展示条数
    childShowNum    //	子评论展示条数
    commentId       //  父评论id
    showAvatar      //	true、false 是否展示用户头像
    content         //  评论内容
}
// 数据源参数
{
    type: Type,
    params: Params
}
```

list/submit 返回格式
```js
{
    code: '200',
    message: 'success',
    data: {
        rows: [
            {
                id: '评论id',                       //评论id
                content: '评论内容',                //评论内容
                likeNum: 20,                       //点赞数
                isLike: false,                     //是否点过赞
                isFeatured: false,                 //是否精选
                createTime: '2022-5-16',           //评论时间
                fromUserId: '用户id',              //评论用户id
                fromUserName: '用户名',            //评论用户名
                fromUserAvatar: '头像',            //评论用户头像
                toUserId: 'id',                    //回复用户id
                toUserName: '名称',                //回复用户名
                total: 0,                          //总数
                children: [],                      //子评论

            }
        ],
        total: 0,
        authorId: ''                               // 作者id
    }
}

```

delete/like/unlike 返回格式
```js
{
    code: '200',
    message: 'success',
    data: null
}

```
