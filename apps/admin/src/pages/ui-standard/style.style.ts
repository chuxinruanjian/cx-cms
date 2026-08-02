import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => ({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginLG,
  },
  metricCard: {
    height: '100%',
  },
  metricValue: {
    margin: `${token.marginXS}px 0 0 !important`,
  },
}));

export default useStyles;
