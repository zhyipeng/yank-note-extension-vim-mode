import { Ctx } from '@yank-note/runtime-api'

export function getActions (ctx: Ctx) {
  const ynActions: string[] = ctx.action.getRawActions().filter(item => item.forUser).map(item => item.name)
  // @ts-ignore
  const editorActions: string[] = Array.from(ctx.editor.getEditor()._actions.keys())
  return {
    ynActions,
    editorActions,
  }
}

export function closeTab (ctx: Ctx) {
  ctx.action.getActionHandler('file-tabs.close-current')()
}
