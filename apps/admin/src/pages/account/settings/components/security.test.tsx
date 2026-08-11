import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminFeatures } from '@/config/features';
import * as service from '../service';
import SecurityView from './security';

const mocks = vi.hoisted(() => ({ setInitialState: vi.fn() }));

vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
  useModel: () => ({ setInitialState: mocks.setInitialState }),
}));

vi.mock('@ant-design/pro-components', () => {
  const field = ({ label }: { label: string }) => (
    <label>
      {label}
      <input aria-label={label} />
    </label>
  );
  const ProFormText = Object.assign(field, { Password: field });
  return {
    ModalForm: ({
      children,
      open,
      title,
    }: {
      children: React.ReactNode;
      open: boolean;
      title: React.ReactNode;
    }) =>
      open ? (
        <div role="dialog">
          {title}
          {children}
        </div>
      ) : null,
    ProFormCaptcha: field,
    ProFormText,
  };
});

vi.mock('antd', () => {
  const App = Object.assign(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    {
      useApp: () => ({
        message: { error: vi.fn(), success: vi.fn() },
      }),
    },
  );
  const ListItem = Object.assign(
    ({
      actions,
      children,
    }: {
      actions: React.ReactNode[];
      children: React.ReactNode;
    }) => (
      <div>
        {children}
        {actions}
      </div>
    ),
    {
      Meta: ({
        description,
        title,
      }: {
        description: React.ReactNode;
        title: React.ReactNode;
      }) => (
        <div>
          <h4>{title}</h4>
          <span>{description}</span>
        </div>
      ),
    },
  );
  const List = Object.assign(
    ({ dataSource, renderItem }: any) => (
      <div>
        {dataSource.map((item: { key: string }) => (
          <div key={item.key}>{renderItem(item)}</div>
        ))}
      </div>
    ),
    { Item: ListItem },
  );
  return {
    App,
    Button: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
    Form: { useForm: () => [{ resetFields: vi.fn() }] },
    List,
  };
});

vi.mock('../service', () => ({
  changeCurrentPassword: vi.fn(),
  getRequestErrorCode: vi.fn(),
  queryCurrent: vi.fn(),
  sendSecurityMobileCode: vi.fn(),
  updateSecurityMobile: vi.fn(),
}));

const currentUser = {
  avatar: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  email: 'admin@example.com',
  fullName: 'Admin User',
  id: 1,
  isSuperAdmin: true,
  lastLoginAt: null,
  mobile: null,
  name: 'Admin User',
  permissions: ['*'],
  profile: null,
  roles: [],
  status: true,
  updatedAt: null,
  username: 'admin',
};

const renderView = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SecurityView />
    </QueryClientProvider>,
  );
};

describe('account security settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminFeatures.mobileEnabled = true;
    vi.mocked(service.queryCurrent).mockResolvedValue({ data: currentUser });
  });

  it('hides security phone settings when mobile features are disabled', async () => {
    adminFeatures.mobileEnabled = false;
    const view = renderView();

    await view.findByText('Configured. Update your password regularly');
    expect(view.queryByText('Security Phone')).toBeNull();
    expect(view.queryByText('No security phone is bound')).toBeNull();
  });

  it('shows the shared bind template when no mobile is configured', async () => {
    const view = renderView();

    expect(await view.findByText('No security phone is bound')).toBeTruthy();
    fireEvent.click(view.getAllByRole('button', { name: 'Bind' })[0]);

    expect(await view.findByText('Bind Security Phone')).toBeTruthy();
    expect(view.getByLabelText('Current password')).toBeTruthy();
    expect(view.getByLabelText('New mobile number')).toBeTruthy();
    expect(view.getByLabelText('SMS verification code')).toBeTruthy();
  });

  it('masks a configured mobile and opens the same template for replacement', async () => {
    vi.mocked(service.queryCurrent).mockResolvedValue({
      data: { ...currentUser, mobile: '13800138000' },
    });
    const view = renderView();

    expect(await view.findByText('Bound phone：138****8000')).toBeTruthy();
    await waitFor(() => {
      expect(view.getAllByRole('button', { name: 'Modify' }).length).toBe(3);
    });
    fireEvent.click(view.getAllByRole('button', { name: 'Modify' })[1]);

    expect(await view.findByText('Change Security Phone')).toBeTruthy();
    expect(view.getByLabelText('Current password')).toBeTruthy();
    expect(view.getByLabelText('New mobile number')).toBeTruthy();
    expect(view.getByLabelText('SMS verification code')).toBeTruthy();
  });

  it('opens the formal password-change template', async () => {
    const view = renderView();
    await view.findByText('Configured. Update your password regularly');
    fireEvent.click(view.getAllByRole('button', { name: 'Modify' })[0]);

    expect(await view.findByText('Change Account Password')).toBeTruthy();
    expect(view.getByLabelText('Current password')).toBeTruthy();
    expect(view.getByLabelText('New password')).toBeTruthy();
    expect(view.getByLabelText('Confirm new password')).toBeTruthy();
  });
});
