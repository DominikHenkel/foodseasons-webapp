import { ViteReactSSG } from 'vite-react-ssg';
import App from './App';
import './styles.css';

export const createRoot = ViteReactSSG({
  routes: [
    { path: '/', Component: App },
    { path: '/item/:slug', Component: App },
  ],
});
