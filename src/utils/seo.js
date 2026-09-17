import seoData from '../data/seo.json';

export function getSEO(pageKey = 'default') {
  const base = seoData.baseUrl;
  const data = seoData[pageKey] || seoData.default;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    metadataBase: new URL(base),
    openGraph: {
      title: data.title,
      description: data.description,
      url: base,
      siteName: 'Gameboard',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/favicon.ico',
    }
  };
}
