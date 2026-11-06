import { createStyles } from 'antd-style';

export default createStyles(({ token }) => ({
  stack: { display: 'flex', flexDirection: 'column', gap: token.marginMD },
  filterActions: { display: 'flex', justifyContent: 'flex-end' },
}));
