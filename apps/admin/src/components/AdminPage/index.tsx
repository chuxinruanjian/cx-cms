import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import type { ReactNode } from 'react';

export interface AdminBreadcrumbItem {
  title: ReactNode;
  path?: string;
}

export interface AdminPageProps {
  title: ReactNode;
  breadcrumbs: AdminBreadcrumbItem[];
  extra?: ReactNode;
  children: ReactNode;
}

export const AdminPage = ({
  title,
  breadcrumbs,
  extra,
  children,
}: AdminPageProps) => {
  return (
    <PageContainer
      title={title}
      extra={extra}
      breadcrumb={{
        items: breadcrumbs.map((item) => ({
          title: item.path ? (
            <Link to={item.path}>{item.title}</Link>
          ) : (
            item.title
          ),
        })),
      }}
    >
      {children}
    </PageContainer>
  );
};
