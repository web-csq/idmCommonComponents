export const getCommentListData = function () {
    const _this = this
    return [
        {
            id: '',
            time: '2022-05-09',
            likeNum: 30,
            content: '磐石在线学习1',
            isLike: true, // 是否点过赞
            isFeatured: true, //	boolean	必须		是否精选
            createTime: '2022-05-09', //	string	必须		评论时间
            fromUserId: '123', //	string	必须		评论用户Id
            fromUserName: '小小', //	string	必须		评论用户名
            fromUserAvatar: IDM.url.getModuleAssetsWebPath(require('../assets/avatar.png'), _this.moduleObject), //	string	非必须		评论用户头像
            children: [
                {
                    createTime: '2022-05-09',
                    likeNum: 30,
                    isFeatured: false,
                    content: '磐石在线学习1',
                    fromUserName: '小小',
                    fromUserAvatar: IDM.url.getModuleAssetsWebPath(
                        require('../assets/avatar.png'),
                        _this.moduleObject
                    ),
                    id: '1',
                    toUserId: '456', //	string	必须		回复用户Id
                    toUserName: '阿月', //	string	必须		回复用户名
                    toUserAvatar: '' //	string	非必须		回复用户头像
                }
            ]
        },
        {
            createTime: '2022-05-09',
            likeNum: 30,
            content: '磐石在线学习2',
            isFeatured: false,
            isLike: true,
            fromUserName: '小小',
            id: '1',
            fromUserAvatar: IDM.url.getModuleAssetsWebPath(require('../assets/avatar.png'), _this.moduleObject)
        },
        {
            createTime: '2022-05-09',
            likeNum: 30,
            content: '磐石在线学习3',
            isFeatured: false,
            fromUserName: '小小',
            id: '1',
            fromUserAvatar: IDM.url.getModuleAssetsWebPath(require('../assets/avatar.png'), _this.moduleObject)
        }
    ]
}