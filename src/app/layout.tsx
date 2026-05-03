import type { Metadata, Viewport } from 'next';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sri Discount Gallery — Best Deals at Lowest Prices',
  description: 'Shop gadgets, home essentials, kids products and more at unbeatable discount prices. Free delivery, genuine warranty.',
  keywords: ['discount', 'gadgets', 'home essentials', 'kids products', 'sri discount gallery'],
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1E3A8A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="facebook-domain-verification" content="ithrf5occuv6dzg499pfg5x491ccw6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2077787863062828');
fbq('track', 'PageView');`
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2077787863062828&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
