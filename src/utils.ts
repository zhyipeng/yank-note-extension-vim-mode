import { Ctx } from '@yank-note/runtime-api'

export function getActions (ctx: Ctx) {
  // @ts-ignore
  const ynActions: string[] = ctx.action.getRawActions().map(item => item.name)
  // @ts-ignore
  const editorActions: string[] = Array.from(ctx.editor.getEditor()._actions.keys())
  return {
    ynActions,
    editorActions,
  }
}

export function closeTab (ctx: Ctx) {
  const action = ctx.action.getAction('file-tabs.close-current')
  if (action) {
    action.handler()
  }
}
