import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core'

export interface RomanOrderedListOptions {
  itemTypeName: string
  HTMLAttributes: Record<string, unknown>
  keepMarks: boolean
  keepAttributes: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    romanOrderedList: {
      toggleRomanOrderedList: () => ReturnType
    }
  }
}

export const RomanOrderedList = Node.create<RomanOrderedListOptions>({
  name: 'romanOrderedList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {
        style: 'list-style-type: upper-roman;'
      },
      keepMarks: false,
      keepAttributes: false,
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: element => {
          return element.hasAttribute('start')
            ? parseInt(element.getAttribute('start') || '', 10)
            : 1
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'ol[style*="upper-roman"]',
        getAttrs: node => (node as HTMLElement).style.listStyleType === 'upper-roman' && null,
      },
      {
        tag: 'ol.roman-list',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { start, ...otherAttributes } = HTMLAttributes

    return start === 1
      ? ['ol', mergeAttributes(this.options.HTMLAttributes, otherAttributes), 0]
      : ['ol', mergeAttributes(this.options.HTMLAttributes, otherAttributes, { start }), 0]
  },

  addCommands() {
    return {
      toggleRomanOrderedList: () => ({ commands, chain }) => {
        if (this.editor.isActive(this.name)) {
          return commands.liftListItem(this.options.itemTypeName)
        }

        return chain()
          .clearNodes()
          .wrapInList(this.name)
          .run()
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-7': () => this.editor.commands.toggleRomanOrderedList(),
    }
  },

  addInputRules() {
    const inputRegex = /^(\d+)\.\s$/

    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => ({ start: +match[1] }),
        joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
      }),
    ]
  },
})