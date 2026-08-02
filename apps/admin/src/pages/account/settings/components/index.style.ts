import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    baseView: {
      display: 'flex',
      paddingTop: '12px',
      '.ant-form-item .ant-form-item-control': {
        width: '100%',
      },
      [`@media screen and (max-width: ${token.screenXL}px)`]: {
        flexDirection: 'column-reverse',
      },
    },
    left: {
      minWidth: '224px',
      maxWidth: '448px',
    },
    right: {
      flex: '1',
      paddingLeft: '104px',
      [`@media screen and (max-width: ${token.screenXL}px)`]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '448px',
        padding: '20px',
      },
    },
    avatar_title: {
      height: '22px',
      marginBottom: '8px',
      color: token.colorTextHeading,
      fontSize: token.fontSize,
      lineHeight: '22px',
      [`@media screen and (max-width: ${token.screenXL}px)`]: {
        display: 'none',
      },
    },
    avatar: {
      width: '144px',
      marginBottom: '12px',
      '.ant-upload-wrapper .ant-upload-select': {
        width: '144px !important',
        height: '144px !important',
      },
    },
  };
});

export default useStyles;
