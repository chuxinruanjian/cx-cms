import { GridContent } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Breadcrumb, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import useStyles from './style.style';

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
  const { styles } = useStyles();

  return (
    <GridContent>
      <Breadcrumb
        className={styles.breadcrumb}
        items={breadcrumbs.map((item) => ({
          title: item.path ? (
            <Link to={item.path}>{item.title}</Link>
          ) : (
            item.title
          ),
        }))}
      />
      <Flex
        className={styles.header}
        align="center"
        justify="space-between"
        gap="middle"
        wrap
      >
        <Typography.Title level={4} className={styles.title}>
          {title}
        </Typography.Title>
        {extra}
      </Flex>
      <main>{children}</main>
    </GridContent>
  );
};
