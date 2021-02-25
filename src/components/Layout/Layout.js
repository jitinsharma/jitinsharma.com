// @flow
import React from 'react';
import Helmet from 'react-helmet';
import type { Node as ReactNode } from 'react';
import styles from './Layout.module.scss';
import 'typeface-raleway'

type Props = {
  children: ReactNode,
  title: string,
  description?: string,
  bannerImage?: string
};

const Layout = ({ children, title, description, bannerImage }: Props) => {
  var twitterImageTag = null
  if (bannerImage == null) {
      bannerImage = "photo.png"
  } else {
    twitterImageTag = <meta name="twitter:image" content={"https://jitinsharma.in/" + bannerImage} />
  }
  return(
  <div className={styles.layout}>
    <Helmet>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:site_name" content={title} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={"https://jitinsharma.in/" + bannerImage} />
      <meta name="twitter:site" content="@_jitinsharma" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {twitterImageTag}
    </Helmet>
    {children}
  </div>)
};

export default Layout;
