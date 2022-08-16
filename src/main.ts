import { getExtensionBasePath, registerPlugin } from '@yank-note/runtime-api'

registerPlugin({
  name: __EXTENSION_ID__,
  register (ctx) {
    let openVim = !window.localStorage.getItem('closeVim')
    let vimMode: any = null

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    require.config({
      paths: {
        'monaco-vim': getExtensionBasePath(__EXTENSION_ID__) + '/dist/monaco-vim.js',
      }
    })

    let statusBar: HTMLSpanElement
    const docInfoEls = document.getElementsByClassName('document-info')
    if (docInfoEls.length > 0) {
      const docInfo = docInfoEls[0]
      statusBar = document.createElement('span')
      statusBar.style.marginRight = '5px'
      statusBar.style.display = 'none'
      docInfo.parentNode!.insertBefore(statusBar, docInfo)
    }

    const loadVimPlugin = () => {
      statusBar.style.display = 'inline-block'
      const editor = ctx.editor.getEditor()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      require(['monaco-vim'], function (MonacoVim) {
        vimMode = MonacoVim.initVimMode(editor, statusBar)
      })
    }

    if (openVim) {
      loadVimPlugin()
    }

    const actionName = 'toggleVim'

    ctx.action.registerAction({
      name: actionName,
      keys: [ctx.command.CtrlCmd, ctx.command.Alt, 'v'],
      handler: () => {
        openVim = !openVim
        ctx.statusBar.refreshMenu()
        if (openVim) {
          loadVimPlugin()
          window.localStorage.removeItem('closeVim')
        } else if (vimMode) {
          vimMode.dispose()
          window.localStorage.setItem('closeVim', '1')
        }
      },
      when: () => ctx.store.state.showEditor
    })

    ctx.statusBar.tapMenus(menus => {
      menus['status-bar-tool']?.list?.push({
        id: __EXTENSION_ID__,
        type: 'normal',
        title: 'Vim 模式',
        checked: openVim,
        subTitle: ctx.command.getKeysLabel(actionName),
        onClick: () => ctx.action.getActionHandler(actionName)()
      })
    })
  }
})
