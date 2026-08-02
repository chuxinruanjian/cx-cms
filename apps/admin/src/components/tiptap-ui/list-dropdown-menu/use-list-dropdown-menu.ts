'use client';

import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

import {
  tiptapLocaleMessages,
  useTiptapLocale,
} from '@/components/TiptapEditor/locale';
// --- Icons ---
import { ListIcon } from '@/components/tiptap-icons/list-icon';
import { ListOrderedIcon } from '@/components/tiptap-icons/list-ordered-icon';
import { ListTodoIcon } from '@/components/tiptap-icons/list-todo-icon';
// --- Tiptap UI ---
import {
  canToggleList,
  isListActive,
  type ListType,
  listIcons,
  listLabelMessageKeys,
} from '@/components/tiptap-ui/list-button';
// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
// --- Lib ---
import { isNodeInSchema } from '@/lib/tiptap-utils';

/**
 * Configuration for the list dropdown menu functionality
 */
export interface UseListDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The list types to display in the dropdown.
   * @default ["bulletList", "orderedList", "taskList"]
   */
  types?: ListType[];
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean;
}

export interface ListOption {
  label: string;
  type: ListType;
  icon: React.ElementType;
}

export const listOptions: ListOption[] = [
  {
    label: tiptapLocaleMessages.bulletList.defaultMessage,
    type: 'bulletList',
    icon: ListIcon,
  },
  {
    label: tiptapLocaleMessages.orderedList.defaultMessage,
    type: 'orderedList',
    icon: ListOrderedIcon,
  },
  {
    label: tiptapLocaleMessages.taskList.defaultMessage,
    type: 'taskList',
    icon: ListTodoIcon,
  },
];

export function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[],
): boolean {
  if (!editor?.isEditable) return false;
  return listTypes.some((type) => canToggleList(editor, type));
}

export function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[],
): boolean {
  if (!editor?.isEditable) return false;
  return listTypes.some((type) => isListActive(editor, type));
}

export function getFilteredListOptions(
  availableTypes: ListType[],
): typeof listOptions {
  return listOptions.filter(
    (option) => !option.type || availableTypes.includes(option.type),
  );
}

export function shouldShowListDropdown(params: {
  editor: Editor | null;
  listTypes: ListType[];
  hideWhenUnavailable: boolean;
  listInSchema: boolean;
  canToggleAny: boolean;
}): boolean {
  const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params;

  if (!editor) return false;

  if (!hideWhenUnavailable) {
    return true;
  }

  if (!listInSchema) return false;

  if (!editor.isActive('code')) {
    return canToggleAny;
  }

  return true;
}

/**
 * Gets the currently active list type from the available types
 */
export function getActiveListType(
  editor: Editor | null,
  availableTypes: ListType[],
): ListType | undefined {
  if (!editor?.isEditable) return undefined;
  return availableTypes.find((type) => isListActive(editor, type));
}

/**
 * Custom hook that provides list dropdown menu functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyListDropdown() {
 *   const {
 *     isVisible,
 *     activeType,
 *     isAnyActive,
 *     canToggleAny,
 *     filteredLists,
 *   } = useListDropdownMenu()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <DropdownMenu>
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedListDropdown() {
 *   const {
 *     isVisible,
 *     activeType,
 *   } = useListDropdownMenu({
 *     editor: myEditor,
 *     types: ["bulletList", "orderedList"],
 *     hideWhenUnavailable: true,
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
export function useListDropdownMenu(config?: UseListDropdownMenuConfig) {
  const { t } = useTiptapLocale();
  const {
    editor: providedEditor,
    types = ['bulletList', 'orderedList', 'taskList'],
    hideWhenUnavailable = false,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const listInSchema = types.some((type) => isNodeInSchema(type, editor));

  const filteredLists = getFilteredListOptions(types).map((option) => ({
    ...option,
    label: t(listLabelMessageKeys[option.type]),
  }));

  const canToggleAny = canToggleAnyList(editor, types);
  const isAnyActive = isAnyListActive(editor, types);
  const activeType = getActiveListType(editor, types);
  const activeList = filteredLists.find((option) => option.type === activeType);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowListDropdown({
          editor,
          listTypes: types,
          hideWhenUnavailable,
          listInSchema,
          canToggleAny,
        }),
      );
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [canToggleAny, editor, hideWhenUnavailable, listInSchema, types]);

  return {
    isVisible,
    activeType,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    types,
    filteredLists,
    label: t('list'),
    Icon: activeList ? listIcons[activeList.type] : ListIcon,
  };
}
