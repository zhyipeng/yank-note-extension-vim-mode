import { registerPlugin } from '@yank-note/runtime-api'

registerPlugin({
  name: __EXTENSION_ID__,
  register (ctx) {
    ctx.editor.whenEditorReady().then((monaco) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      require.config({
        paths: {
          'monaco-vim': 'https://unpkg.com/monaco-vim/dist/monaco-vim',
        }
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      require(['monaco-vim'], function (MonacoVim) {
        MonacoVim.initVimMode(monaco.editor)
      })
    })
  }
})
