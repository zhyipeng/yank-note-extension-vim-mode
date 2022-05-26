import { getExtensionBasePath, registerPlugin } from '@yank-note/runtime-api'

registerPlugin({
  name: __EXTENSION_ID__,
  register (ctx) {
    ctx.editor.whenEditorReady().then((monaco) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      require.config({
        paths: {
          'monaco-vim': getExtensionBasePath(__EXTENSION_ID__) + '/dist/monaco-vim.js',
        }
      })

      // monaco-vim 状态栏要求直接使用 dom 操作更新状态
      let statusBar: HTMLSpanElement
      const docInfoEls = document.getElementsByClassName('document-info')
      if (docInfoEls.length > 0) {
        const docInfo = docInfoEls[0]
        statusBar = document.createElement('span')
        statusBar.style.marginRight = '5px'
        docInfo.parentNode!.insertBefore(statusBar, docInfo)
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      require(['monaco-vim'], function (MonacoVim) {
        MonacoVim.initVimMode(monaco.editor, statusBar)
      })
    })
  }
})
