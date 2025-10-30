// 全屏视图模式 Composable
import { inject, computed } from 'vue'

export function useViewMode() {
    // 从App.vue注入视图模式相关的方法和状态
    const viewMode = inject('viewMode', ref('tabbed'))
    const switchViewMode = inject('switchViewMode', () => { })
    const exitFullscreen = inject('exitFullscreen', () => { })

    // 判断是否为全屏模式
    const isFullscreen = computed(() => viewMode.value === 'fullscreen')

    // 全屏模式下的样式类
    const fullscreenClass = computed(() => ({
        'is-fullscreen': isFullscreen.value
    }))

    return {
        viewMode,
        switchViewMode,
        exitFullscreen,
        isFullscreen,
        fullscreenClass
    }
}

// 导出一个用于所有组件的全屏退出按钮组件配置
export const FullscreenExitButton = {
    template: `
    <el-button 
      v-if="isFullscreen"
      class="component-fullscreen-exit-btn"
      @click="exitFullscreen"
      type="danger"
      size="small"
      circle
      title="退出全屏 (ESC)"
    >
      <el-icon><Close /></el-icon>
    </el-button>
  `,
    setup() {
        const { isFullscreen, exitFullscreen } = useViewMode()
        return {
            isFullscreen,
            exitFullscreen
        }
    }
}