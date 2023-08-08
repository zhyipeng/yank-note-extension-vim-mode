import { getExtensionBasePath, registerPlugin } from '@yank-note/runtime-api'

registerPlugin({
  name: __EXTENSION_ID__,
  register (ctx) {
    const openVim = ctx.lib.vue.ref(!window.localStorage.getItem('closeVim'))
    let vimMode: any = null

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    require.config({
      paths: {
        'monaco-vim': getExtensionBasePath(__EXTENSION_ID__) + '/dist/monaco-vim.js',
      }
    })

    let vimStatus: HTMLElement | undefined

    const VimStatus = ctx.lib.vue.defineComponent({
      name: 'vim-status',
      setup () {
        const { h, ref, onMounted, watchEffect } = ctx.lib.vue
        const refStatusBar = ref<HTMLElement>()

        watchEffect(() => {
          vimStatus = refStatusBar.value
        }, { flush: 'post' })

        onMounted(() => {
          if (openVim.value) {
            loadVimPlugin()
          }
        })

        return () => h('div', {
          ref: refStatusBar,
          class: 'vim-status',
          style: { padding: '0 5px' },
        })
      },
    })

    const loadVimPlugin = () => {
      if (!vimStatus) return

      const editor = ctx.editor.getEditor()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      require(['monaco-vim'], function (MonacoVim) {
        vimMode = MonacoVim.initVimMode(editor, vimStatus)
      })
    }

    ctx.lib.vue.watch(openVim, (val) => {
      if (val) {
        loadVimPlugin()
        window.localStorage.removeItem('closeVim')
      } else {
        vimMode?.dispose()
        window.localStorage.setItem('closeVim', '1')
      }

      ctx.statusBar.refreshMenu()
    })

    const actionName = __EXTENSION_ID__ + '.toggleVim'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { CtrlCmd, Alt, getKeysLabel } = ctx.keybinding || ctx.command // 3.58.0 之前的版本使用 ctx.command

    ctx.action.registerAction({
      name: actionName,
      keys: [CtrlCmd, Alt, 'v'],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      forUser: true, // 用户可以自定义快捷键
      description: '切换 Vim 模式',
      handler: () => {
        openVim.value = !openVim.value
      },
      when: () => ctx.store.state.showEditor
    })

    ctx.statusBar.tapMenus(menus => {
      menus['status-bar-tool']?.list?.push({
        id: __EXTENSION_ID__,
        type: 'normal',
        title: 'Vim 模式',
        checked: openVim.value,
        subTitle: getKeysLabel(actionName),
        onClick: () => ctx.action.getActionHandler(actionName)()
      })
    })

    ctx.statusBar.tapMenus(menus => {
      const id = __EXTENSION_ID__ + '-vim'
      menus[id] = {
        id,
        title: VimStatus,
        order: -2048,
        position: 'right',
        hidden: !openVim.value
      }
    })
  }
})
