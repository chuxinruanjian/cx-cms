import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => ({
  root: {
    width: '100%',
  },
  uploadButton: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginXS,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    color: token.colorText,
    background: 'transparent',
    border: 0,
    cursor: 'pointer',
  },
  avatarButton: {
    width: '100%',
    height: '100%',
    padding: 0,
    overflow: 'hidden',
    background: 'transparent',
    border: 0,
    borderRadius: '50%',
    cursor: 'pointer',
  },
  avatarImage: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginXS,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.marginXS,
    alignItems: 'center',
    fontSize: 32,
    fontWeight: 500,
    lineHeight: 1,
  },
  avatarFallbackHint: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    fontWeight: 400,
    lineHeight: token.lineHeightSM,
  },
  avatarActions: {
    marginTop: token.marginSM,
  },
  avatarProgress: {
    maxWidth: 320,
    marginTop: token.marginSM,
  },
  hint: {
    display: 'block',
    marginTop: token.marginSM,
  },
  sortableItem: {
    cursor: 'move',
  },
}));

export default useStyles;
