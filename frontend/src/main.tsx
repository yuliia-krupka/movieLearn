import {createRoot} from 'react-dom/client'
import 'antd/dist/reset.css';
import './index.css';
import {ConfigProvider, App as AntdApp} from 'antd';
import App from './App.tsx'
import theme from './theme';

createRoot(document.getElementById('root')!).render(
    <ConfigProvider theme={theme}>
        <AntdApp>
            <App/>
        </AntdApp>
    </ConfigProvider>
)
