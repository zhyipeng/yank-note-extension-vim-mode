# Vim 模式插件

Vim 插件, 通过加载 monaco 的插件 - [monaco-vim](https://github.com/brijeshb42/monaco-vim) 实现.

> 目前仅支持最基础的光标移动指令和搜索指令

## 如何使用
- 启用/关闭 Vim 编辑模式: [状态栏]工具-Vim模式, 或者快捷键 `cmd/ctrl + alt + v`
![img_1.png](https://raw.githubusercontent.com/zhyipeng/yank-note-extension-vim-mode/main/img_1.png)

## Keymap
支持基本的键映射和调用 yn 的部分功能

- 在 yn 配置文件 (yn主目录下的 config.json) 中增加一项配置:
```json
{
  ...
  "vim.keymaps": [
    ...
  ]
}
```

### 键映射
exp:
```json
{
  "vim.keymaps": [
    // normal 模式下 H -> 0
    {
      "type": "key",
      "before": "H",
      "after": "0",
      "context": "normal"
    },
    // insert 模式下 JK -> Esc
    {
      "type": "key",
      "before": "jk",
      "after": "<Esc>",
      "context": "insert"
    },
    // 组合键
    {
      "type": "key",
      "before": "<C-m>",
      "after": "j",
      "context": "normal"
    }
  ]
}
```

### 调用 yn/monaco-editor action

```json
{
  "vim.keymaps": [
    {
      "type": "action",
      "before": "K",
      "after": "file-tabs.switch-left",
      "context": "normal"
    },
    {
      "type": "action",
      "before": "J",
      "after": "file-tabs.switch-right",
      "context": "normal"
    },
    {
      "type": "action",
      "before": "`+",
      "after": "editor.action.fontZoomIn"
    }
  ]
}
```

如何获取 action:
- yn 键盘快捷键设置处有展示 (注意目前暂不支持应用栏的操作)
- yn: `ctx.action.getRawActions()`
- editor: `ctx.editor.getEditor()._actions`
- vim 指令: `:actionlist`

> 修改配置文件后需要重载页面或重启yn生效

## 关于 Vim
- [Vim](https://www.vim.org/)
- [Vim 从入门到精通](https://github.com/wsdjeg/vim-galore-zh_cn)
