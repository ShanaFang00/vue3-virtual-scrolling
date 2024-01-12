<template>
    <div class="wrapper" ref="wrapper" @scroll="onScroll">
        <div class="body-space" :style="{height: `${totalHeight}px`}"></div>
        <div class="list" ref="container">
            <div class="list-item" v-for="item in runList" :key="item.id">
                <span>{{item.name}}</span>
                <span>{{item.id}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { userList } from '../mock/mock'
import { ref, onMounted  } from 'vue'
export default {
    setup() {
        const containerHeight = 600 // 容器高度
        const container = ref(null)
        let topHeight = 0
        const list = userList.map((data, index) => {
            const height = 50
            const ob = {
                index,
                height,
                top: topHeight,
                ...data
            }
            topHeight += height
            return ob
        }) // 源数据
        const totalHeight = ref(topHeight) //  列表总高度
        const runList = ref([]) // 运行时的列表
        const minHeight = 50 // 最小高度是50
        let scrollScale = null // 在哪个范围内不执行滚动
        //屏幕最大能容纳的列表项数量,containerHeight是父容器高度,按照最小高度来计算
        const maxNum = Math.ceil(containerHeight / minHeight)
        const cacheScreens = 1 // 缓冲屏数

        // 获取运行时的数据
        function getRunData(distance = null) {
            // 滚动的总距离
            const scrollTop = distance ? distance : container.value.scrollTop

            if (scrollScale && scrollTop > scrollScale[0] && scrollTop < scrollScale[1]) {
                return
            }

            // 起始索引
            let startIndex = getStartIndex(scrollTop)

            // 上屏索引
            let upperStartIndex = startIndex - (maxNum * cacheScreens)
            upperStartIndex = upperStartIndex < 0 ? 0 : upperStartIndex

            // 调整offset
            container.value.style.transform = `translate3d(0,${list[upperStartIndex].top}px, 0)`

            // 下屏索引
            let downStartIndex = startIndex + maxNum
            downStartIndex = downStartIndex > (list.length - 1) ? (list.length - 1) : downStartIndex

            // 中间屏的元素
            const midList = list.slice(startIndex, startIndex + maxNum)
            // 上屏的元素
            const upperList = list.slice(upperStartIndex, startIndex)
            // 下间屏的元素
            const downList = list.slice(downStartIndex, downStartIndex + (maxNum * cacheScreens))

            scrollScale = [list[Math.floor(upperStartIndex + maxNum / 2)].top, list[Math.ceil(startIndex + maxNum / 2)].top]
            runList.value = [...upperList, ...midList, ...downList]

        }

        // 获取起始索引,二分法计算
        function getStartIndex(scrollTop) {
            let start = 0,
                end = list.length - 1
            while (start < end) {
                const mid = Math.floor((start + end) / 2)
                const {top, height} = list[mid]
                if (scrollTop >= top && scrollTop < (top + height)) {
                    start = mid
                    break
                } else if (scrollTop >= (top + height)) {
                    start = mid + 1
                } else if (scrollTop < top) {
                    end = mid - 1
                }
            }
            start = start < 0 ? 0 : start
            return start
        }

        let ticking = null // 用于节流

        // 滚动事件
        function onScroll(e) {
            if (ticking) {
                return
            }
            ticking = true
            // 减少浏览器的计算量,使用requestAnimationFrame函数做一下节流
            window.requestAnimationFrame(() => {
                const distance = e.target.scrollTop
                getRunData(distance)
                ticking = false
            })
        }


        onMounted(() => {
            getRunData()
        })

        return {
            totalHeight,
            runList,
            minHeight,
            container,
            onScroll
        }
    }
}

</script>

<style lang="less" scoped>
.wrapper {
    position: relative;
    height: 600px;
    border: 1px solid #ddd;
    overflow: auto;
    .body-space {
        position: relative;
        z-index: -1;
    }
    .list {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        .list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            height: 49px;
            border-bottom: 1px solid #d1d1d1;
        }
    }
}
</style>