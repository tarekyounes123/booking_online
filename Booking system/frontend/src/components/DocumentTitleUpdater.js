import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import ThemeSettingsContext from '../context/ThemeSettingsContext';

const DocumentTitleUpdater = () => {
  const { settings } = useContext(ThemeSettingsContext);

  // Update document title when settings change
  useEffect(() => {
    if (settings) {
      const brandName = settings?.brandName || 'Booking System';
      const brandNameHighlight = settings?.brandNameHighlight || 'Appointment Booking';
      const fullTitle = `${brandName} ${brandNameHighlight} - Online ${brandNameHighlight}`;

      document.title = fullTitle;
    }
  }, [settings]);

  // Only render Helmet when settings are available to update meta tags
  if (!settings) {
    return null; // Don't render anything while loading
  }

  const brandName = settings?.brandName || 'Booking System';
  const brandNameHighlight = settings?.brandNameHighlight || 'Appointment Booking';
  const fullTitle = `${brandName} ${brandNameHighlight} - Online ${brandNameHighlight}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content="Book appointments online with our easy-to-use system. Manage your bookings, services, and staff efficiently." />
      <meta name="keywords" content="appointment booking, online booking, scheduling, appointment management, booking system" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content="Book appointments online with our easy-to-use system. Manage your bookings, services, and staff efficiently." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content="Book appointments online with our easy-to-use system. Manage your bookings, services, and staff efficiently." />
    </Helmet>
  );
};

export default DocumentTitleUpdater;