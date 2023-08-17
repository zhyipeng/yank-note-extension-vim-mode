import { Ctx, getExtensionBasePath, registerPlugin } from '@yank-note/runtime-api'
import ActionList from '@/components/ActionList.vue'
import { closeTab } from '@/utils'

interface KM {
  type: 'action' | 'key',
  before: string,
  after: string,
  context?: 'normal' | 'insert' | 'visual',
}

function showActionlist (ctx: Ctx) {
  ctx.ui.useModal().alert({
    title: 'Action List',
    component: ActionList
  })
}

const VIM_KEYMAPS_SETTING = 'vim.keymaps'

registerPlugin({
  name: __EXTENSION_ID__,
  register (ctx) {
    const openVim = ctx.lib.vue.ref(!window.localStorage.getItem('closeVim'))
    let vimMode: any = null

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
      // @ts-ignore
      require(['monaco-vim'], function (MonacoVim) {
        vimMode = MonacoVim.initVimMode(editor, vimStatus)
        // set ex command
        MonacoVim.VimMode.Vim.defineEx('quit', 'q', () => closeTab(ctx))
        MonacoVim.VimMode.Vim.defineEx('wq_save_and_quit', 'wq', () => {
          // @ts-ignore
          ctx.editor.triggerSave()
          setTimeout(() => closeTab(ctx), 200)
        })
        // @ts-ignore
        MonacoVim.VimMode.Vim.defineEx('write', 'w', () => ctx.editor.triggerSave())

        MonacoVim.VimMode.Vim.defineEx('actionlist', 'actionlist', () => {
          showActionlist(ctx)
        })

        // load keymaps
        const keymaps = ctx.setting.getSetting<KM[]>(VIM_KEYMAPS_SETTING, [])
        keymaps.forEach((item) => {
          switch (item.type) {
            case 'action':
              MonacoVim.VimMode.Vim.defineAction(`yn.${item.after}`, () => {
                const action = ctx.action.getAction(item.after)
                if (action) {
                  action.handler()
                } else {
                  try {
                    editor.trigger(null, item.after, undefined)
                  } catch (e) {
                    console.debug(e)
                  }
                }
              })
              MonacoVim.VimMode.Vim.mapCommand(item.before, 'action', `yn.${item.after}`)
              break
            case 'key':
              MonacoVim.VimMode.Vim._mapCommand({
                keys: item.before,
                type: 'keyToKey',
                toKeys: item.after,
                context: item.context,
              })
              break
          }
        })
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

    const actionName = __EXTENSION_ID__ + '.toggle-vim'
    // @ts-ignore
    const { CtrlCmd, Alt, getKeysLabel } = ctx.keybinding || ctx.command // 3.58.0 之前的版本使用 ctx.command

    ctx.action.registerAction({
      name: actionName,
      keys: [CtrlCmd, Alt, 'v'],
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

    ctx.theme.addStyles(`
      .status-bar-menu .vim-status span {
        display: inline-flex;
        color: #eee;
      }

      .status-bar-menu .vim-status span input {
        font-size: 14px !important;
        padding: 0 !important;
        color: #eee !important;
      }
    `)
  }
})
