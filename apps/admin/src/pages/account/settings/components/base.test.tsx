import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as service from '../service';
import BaseView from './base';

const mocks = vi.hoisted(() => ({
  avatarProps: undefined as Record<string, unknown> | undefined,
  fieldNames: [] as string[],
  initialValues: undefined as Record<string, unknown> | undefined,
  onFinish: undefined as
    | ((values: Record<string, unknown>) => Promise<boolean>)
    | undefined,
  setInitialState: vi.fn(),
  success: vi.fn(),
}));

vi.mock('@ant-design/pro-components', () => {
  const field = ({ name }: { name: string }) => {
    if (!mocks.fieldNames.includes(name)) mocks.fieldNames.push(name);
    return <div data-field={name} />;
  };
  const ProForm = ({ children, initialValues, onFinish }: any) => {
    mocks.initialValues = initialValues;
    mocks.onFinish = onFinish;
    return <form>{children}</form>;
  };

  return {
    ProForm,
    ProFormText: field,
    ProFormTextArea: field,
  };
});

vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
  useModel: () => ({ setInitialState: mocks.setInitialState }),
}));

vi.mock('antd', () => ({
  App: {
    useApp: () => ({ message: { success: mocks.success } }),
  },
}));

vi.mock('@/components/Uploader', () => ({
  AvatarUploader: (props: Record<string, unknown>) => {
    mocks.avatarProps = props;
    return <div data-testid="avatar-uploader" />;
  },
}));

vi.mock('./index.style', () => ({
  default: () => ({
    styles: {
      avatar: 'avatar',
      avatar_title: 'avatar-title',
      baseView: 'base-view',
      left: 'left',
      right: 'right',
    },
  }),
}));

vi.mock('../service', () => ({
  queryCurrent: vi.fn(),
  updateCurrent: vi.fn(),
}));

const currentUser = {
  avatar: '',
  createdAt: '2026-08-01T00:00:00.000Z',
  email: 'admin@example.com',
  fullName: 'Ant Design',
  id: 1,
  isSuperAdmin: true,
  lastLoginAt: null,
  name: 'Ant Design',
  permissions: ['*'],
  profile: 'Reusable project administrator',
  roles: [],
  status: true,
  updatedAt: null,
  username: 'admin',
};

describe('account basic settings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mocks.avatarProps = undefined;
    mocks.fieldNames = [];
    mocks.initialValues = undefined;
    mocks.onFinish = undefined;
    vi.clearAllMocks();
    vi.mocked(service.queryCurrent).mockResolvedValue({ data: currentUser });
    vi.mocked(service.updateCurrent).mockResolvedValue(currentUser);
  });

  const renderView = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BaseView />
      </QueryClientProvider>,
    );

  it('keeps only email, nickname, and profile fields', async () => {
    renderView();

    await waitFor(() => {
      expect(mocks.initialValues).toEqual({
        email: 'admin@example.com',
        name: 'Ant Design',
        profile: 'Reusable project administrator',
      });
    });

    expect(mocks.fieldNames).toEqual(['email', 'name', 'profile']);
    expect(mocks.fieldNames).not.toEqual(
      expect.arrayContaining([
        'phone',
        'country',
        'province',
        'city',
        'address',
      ]),
    );
  });

  it('uses name initials when no avatar is configured', async () => {
    renderView();

    await waitFor(() => {
      expect(mocks.avatarProps).toMatchObject({
        fallbackText: 'AD',
        initialPreviewUrl: undefined,
        title: 'Change avatar',
      });
    });
  });

  it('keeps a configured avatar while retaining the text fallback', async () => {
    vi.mocked(service.queryCurrent).mockResolvedValue({
      data: {
        ...currentUser,
        avatar: '/avatar.png',
        name: '张三',
      },
    });

    renderView();

    await waitFor(() => {
      expect(mocks.avatarProps).toMatchObject({
        fallbackText: '张三',
        initialPreviewUrl: '/avatar.png',
      });
    });
  });

  it('uses contextual feedback after submitting', async () => {
    renderView();

    await waitFor(() => expect(mocks.onFinish).toBeTypeOf('function'));
    await mocks.onFinish?.({
      email: 'new@example.com',
      name: 'New Name',
      profile: 'Updated profile',
    });

    expect(service.updateCurrent).toHaveBeenCalledWith({
      email: 'new@example.com',
      fullName: 'New Name',
      profile: 'Updated profile',
    });
    expect(mocks.success).toHaveBeenCalledWith('Basic information updated');
  });

  it('submits a newly uploaded avatar attachment', async () => {
    renderView();

    await waitFor(() => expect(mocks.avatarProps).toBeDefined());
    act(() => {
      const onChange = mocks.avatarProps?.onChange as (
        attachments: Array<{ id: number }>,
      ) => void;
      onChange([{ id: 88 }]);
    });
    await waitFor(() => expect(mocks.onFinish).toBeTypeOf('function'));
    await mocks.onFinish?.({
      email: 'admin@example.com',
      name: 'Ant Design',
      profile: 'Profile',
    });

    expect(service.updateCurrent).toHaveBeenCalledWith({
      avatarAttachmentId: 88,
      email: 'admin@example.com',
      fullName: 'Ant Design',
      profile: 'Profile',
    });
  });
});
