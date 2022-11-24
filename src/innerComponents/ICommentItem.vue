<template>
    <div class="d-flex just-b comment-list-container">
        <div class="d-flex flex-1">
            <img :src="IDM.url.getWebPath(itemData.fromUserAvatar)" v-if="propData.isShowAvatar"
                class="comment-list-avatar" alt="头像加载失败" />
            <div class="common-list-right flex-1">
                <div class="cursor-p">
                    <span class="comment-list-name mr-10">{{ itemData.fromUserName }}</span>
                    <span class="common-list-author mr-10" v-if="itemData.fromUserId == authorId">作者</span>
                    <span v-if="itemData.toUserName">
                        <span class="mr-10">回复</span>
                        <span class="comment-list-name mr-10">
                            {{ itemData.toUserName }}
                        </span>
                        <span v-if="itemData.toUserId == authorId" class="common-list-author">作者</span>
                    </span>
                </div>
                <div class="word-all">{{ itemData.content }}</div>
                <div class="comment-list-bottom">
                    <span class="mr-10 cursor-p">{{ itemData.createTime }}</span>
                    <span class="mr-10 cursor-p" v-if="isShowApply"
                        @click.stop="$emit('showReply', { index: lIndex, sIndex: sIndex })">
                        回复
                    </span>
                    <span class="mr-10 cursor-p"
                        @click.stop="$emit('handleLike', { item: itemData, index: lIndex, sIndex: sIndex })">
                        <span v-if="itemData.isLike">已赞</span> <span v-else>赞</span>
                        <span v-if="propData.isFabulousNumber">({{ itemData.likeNum }})</span></span>
                    <span class="comment-list-del-btn cursor-p"
                        v-if="userInfo.userid && itemData.fromUserId == userInfo.userid"
                        @click.stop="$emit('handleDelete', { item: itemData, index: lIndex, sIndex: sIndex })">
                        删除
                    </span>
                </div>
                <div class="common-list-reply" :style="{ width: propData.inputWidth }" v-if="itemData.isReply">
                    <a-input placeholder="请输入内容" :maxLength="propData.maxLength" allowClear @blur="$emit('handleBlur')"
                        v-model="replyContent" />
                    <div class="d-flex flex-d-r-r align-c comment-list-button-container">
                        <a-button type="primary" size="small" @click="handleSubReply">回复</a-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="common-list-selected-speeches" v-if="itemData.isFeatured">精选发言</div>
    </div>
</template>

<script>
export default {
    name: 'ItemComment',
    props: {
        lIndex: {
            type: Number,
            default: -1
        },
        sIndex: {
            type: Number,
            default: -1
        },
        itemData: {
            type: Object,
            default: () => { }
        },
        propData: {
            type: Object,
            default: () => { }
        },
        authorId: {
            type: String,
            default: ''
        },
        moduleObject: {
            type: Object,
            default: () => { }
        },
        userInfo: {
            type: Object,
            default: () => { }
        },
        isShowApply: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return { replyContent: '' }
    },
    methods: {
        handleSubReply() {
            if (this.moduleObject.env == 'develop') {
                return
            }
            const { itemData, lIndex, sIndex } = this
            this.$emit('handleSubReply', {
                itemData: itemData,
                index: lIndex,
                sIndex: sIndex,
                replyContent: this.replyContent
            })
            this.replyContent = ''
        }
    }
}
</script>

<style lang="scss" scoped>
.common-list-author {
    padding: 2px 5px;
    color: #fff;
    border-radius: 4px;
}
</style>
