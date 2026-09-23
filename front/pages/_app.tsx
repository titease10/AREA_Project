import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AuthProvider } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    const headerlessRoutes = ['/providers', '/actions', '/reactions'];

    return (
        <AuthProvider>
            {!headerlessRoutes.includes(router.pathname) && <Header />}
            <Component {...pageProps} />
            <Footer />
        </AuthProvider>
    )
}

export default MyApp