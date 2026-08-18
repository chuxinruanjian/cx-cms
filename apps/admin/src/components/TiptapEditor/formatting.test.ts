import { Editor } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { StarterKit } from '@tiptap/starter-kit';
import { FirstLineIndent } from '@/components/tiptap-extension/first-line-indent-extension';

const createFormattingEditor = (content = '<p>Styled text</p>') =>
  new Editor({
    content,
    extensions: [StarterKit, TextStyle, FontSize, Color],
  });

describe('Tiptap text formatting', () => {
  it('persists and removes font size and text color styles', () => {
    const editor = createFormattingEditor();

    editor.commands.selectAll();
    expect(editor.chain().setFontSize('24px').setColor('#2563eb').run()).toBe(
      true,
    );

    const html = editor.getHTML();
    expect(html).toContain('font-size: 24px');
    expect(html).toContain('color: #2563eb');

    const restoredEditor = createFormattingEditor(html);
    restoredEditor.commands.selectAll();
    expect(restoredEditor.getAttributes('textStyle')).toMatchObject({
      color: '#2563eb',
      fontSize: '24px',
    });

    expect(restoredEditor.chain().unsetFontSize().unsetColor().run()).toBe(
      true,
    );
    expect(restoredEditor.getHTML()).not.toContain('font-size');
    expect(restoredEditor.getHTML()).not.toContain('color:');

    restoredEditor.destroy();
    editor.destroy();
  });

  it('round-trips resized image dimensions through HTML', () => {
    const extensions = [
      StarterKit,
      Image.configure({
        resize: {
          enabled: true,
          directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          minWidth: 80,
          minHeight: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),
    ];
    const editor = new Editor({ extensions });

    expect(
      editor.commands.setImage({
        src: 'https://example.com/image.png',
        width: 320,
        height: 180,
      }),
    ).toBe(true);

    const html = editor.getHTML();
    expect(html).toContain('width="320"');
    expect(html).toContain('height="180"');

    const restoredEditor = new Editor({ content: html, extensions });
    expect(restoredEditor.getJSON().content?.[0].attrs).toMatchObject({
      height: 180,
      width: 320,
    });

    restoredEditor.destroy();
    editor.destroy();
  });

  it('toggles and round-trips first-line indentation for paragraphs', () => {
    const extensions = [StarterKit, FirstLineIndent];
    const editor = new Editor({
      content: '<p>First paragraph</p><p>Second paragraph</p>',
      extensions,
    });

    editor.commands.setTextSelection(3);
    expect(editor.commands.toggleFirstLineIndent()).toBe(true);
    expect(editor.getHTML()).toContain('text-indent: 2em');

    const restoredEditor = new Editor({
      content: editor.getHTML(),
      extensions,
    });
    restoredEditor.commands.setTextSelection(3);
    expect(restoredEditor.isActive({ firstLineIndent: true })).toBe(true);
    expect(restoredEditor.commands.toggleFirstLineIndent()).toBe(true);
    expect(restoredEditor.getHTML()).not.toContain('text-indent');

    restoredEditor.destroy();
    editor.destroy();
  });
});
