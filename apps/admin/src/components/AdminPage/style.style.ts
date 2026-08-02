import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => ({
  breadcrumb: {
    marginBottom: token.marginSM,
  },
  header: {
    minHeight: 32,
    marginBottom: token.marginMD,
  },
  title: {
    margin: '0 !important',
  },
}));

export default useStyles;
