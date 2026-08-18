# TiptapEditor

`TiptapEditor` is the shared controlled rich-text field for admin forms. It
includes headings, lists, blockquotes, code, marks, multi-color highlights,
links, font sizes, text colors, alignment, two-character first-line indentation,
image insertion and resizing,
responsive mobile controls, and an editor-scoped light/dark preview.

```tsx
import { TiptapEditor } from '@/components';

<Form.Item name="content" label={intl.formatMessage({ id: 'page.content' })}>
  <TiptapEditor imageUpload={uploadRichTextImage} />
</Form.Item>;
```

The component is controlled through `value` and `onChange`, so Ant Design
`Form.Item` can manage its HTML value directly. `readOnly` disables editing,
`ariaLabel` provides the field's accessible name, and `imageUpload` follows the
`UploadFunction` signature exported by this component.

Font sizes and text colors use Tiptap's `TextStyle`, `FontSize`, and `Color`
extensions. Image dimensions are written as `width` and `height` attributes by
the official resizable Image node view. Any server-side HTML sanitizer must
preserve `span` color/font-size styles, paragraph `text-indent` styles, and image
width/height attributes or these formats will be lost after saving.

`demoImageUpload` is intentionally limited to `/ui-standard/create`: it embeds
the selected image as a Data URL so the static blueprint never calls the API.
Do not use it for business data.

Business image uploads must be implemented inside the shared Uploader
architecture. The persisted HTML needs a durable URL that a normal `<img>` can
load, together with attachment identity for binding and cleanup. The current
`/api/v1/admin/attachments/:id/content` route requires a bearer header and is
therefore not a valid persisted image `src`; blob URLs and Data URLs are also
not valid production storage.
