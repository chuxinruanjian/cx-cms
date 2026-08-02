import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => ({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginMD,
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalDescription: {
    marginBottom: token.marginLG,
  },
}));

export default useStyles;
