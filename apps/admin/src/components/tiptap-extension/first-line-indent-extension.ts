import { Extension } from '@tiptap/core';

export interface FirstLineIndentOptions {
  types: string[];
  indent: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    firstLineIndent: {
      setFirstLineIndent: () => ReturnType;
      unsetFirstLineIndent: () => ReturnType;
      toggleFirstLineIndent: () => ReturnType;
    };
  }
}

export const FirstLineIndent = Extension.create<FirstLineIndentOptions>({
  name: 'firstLineIndent',

  addOptions() {
    return {
      types: ['paragraph'],
      indent: '2em',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          firstLineIndent: {
            default: false,
            parseHTML: (element) => {
              const value = element.style.textIndent.trim();
              return Boolean(value && value !== '0' && value !== '0px');
            },
            renderHTML: (attributes) =>
              attributes.firstLineIndent
                ? { style: `text-indent: ${this.options.indent}` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFirstLineIndent:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) =>
              commands.updateAttributes(type, { firstLineIndent: true }),
            )
            .some(Boolean),
      unsetFirstLineIndent:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.resetAttributes(type, 'firstLineIndent'))
            .some(Boolean),
      toggleFirstLineIndent:
        () =>
        ({ editor, commands }) =>
          editor.isActive({ firstLineIndent: true })
            ? commands.unsetFirstLineIndent()
            : commands.setFirstLineIndent(),
    };
  },
});
