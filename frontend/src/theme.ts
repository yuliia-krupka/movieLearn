import type {ThemeConfig} from 'antd';

/**
 * Ant Design theme configuration.
 * Values must stay in sync with CSS custom properties in src/index.css:
 * --color-primary: #5A73DB | --color-accent: #F49E4C | --radius-sm: 8px
 */
const theme: ThemeConfig = {
    token: {
        colorPrimary: '#5A73DB',
        colorLink: '#5A73DB',
        borderRadius: 8,
    },
    components: {
        Button: {
            colorPrimary: '#5A73DB',
        },
        Menu: {
            itemSelectedColor: '#5A73DB',
            itemSelectedBg: 'rgba(90, 115, 219, 0.1)',
        },
        Progress: {
            defaultColor: '#F49E4C',
        },
        Input: {
            activeBorderColor: '#F49E4C',
            hoverBorderColor: '#F49E4C',
            activeShadow: '0 0 0 2px rgba(244, 158, 76, 0.2)',
        },
    },
};

export default theme;
