import React, { type FC } from "react";
import {
  LinkedinShareButton,
  TwitterShareButton,
  RedditShareButton,
  LinkedinIcon,
  XIcon,
  RedditIcon,
} from "react-share";

import * as styles from "./social-share.module.scss";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

const SocialShare: FC<SocialShareProps> = ({ url, title, description }) => {
  return (
    <div className={styles.socialShare}>
      <h4 className={styles.title}>Share this post</h4>
      <div className={styles.buttons}>
        <TwitterShareButton url={url} title={title}>
          <XIcon size={32} round />
        </TwitterShareButton>
        
        <LinkedinShareButton url={url} title={title} summary={description}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        
        <RedditShareButton url={url} title={title}>
          <RedditIcon size={32} round />
        </RedditShareButton>
      </div>
    </div>
  );
};

export { SocialShare };