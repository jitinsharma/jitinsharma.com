import React, { type FC } from "react";
import { Disqus } from "gatsby-plugin-disqus";

import type { Node } from "@/types/node";
import { Button } from "@/components/button";
import { PostTags } from "@/components/post-tags";
import { PostAuthor } from "@/components/post-author";
import { PostFooter } from "@/components/post-footer";
import { PostContent } from "@/components/post-content";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SocialShare } from "@/components/social-share";
import { useSiteMetadata } from "@/hooks/use-site-metadata";

import * as styles from "./post.module.scss";

interface PostProps {
  post: Node;
}

const Post: FC<PostProps> = ({ post }) => {
  const { html } = post;
  const { tagSlugs, slug } = post.fields;
  const { tags, title, date, slug: frontmatterSlug } = post.frontmatter;
  const { url } = useSiteMetadata();

  // Fix the duplicated path in fields.slug
  const cleanSlug = frontmatterSlug || (slug.includes('//') ? slug.split('//')[1] : slug);
  const postUrl = url + cleanSlug;
  
  const disqusConfig = {
    url: postUrl,
    identifier: title,
    title: title,
  };

  return (
    <div className={styles.post}>
      <div className={styles.buttons}>
        <Button className={styles.buttonArticles} title="All Articles" to="/" />
        <ThemeSwitcher />
      </div>
      <div className={styles.content}>
        <PostContent body={html} title={title} />
      </div>
      <div className={styles.footer}>
        <PostFooter date={date} />
        {tags && tagSlugs && <PostTags tags={tags} tagSlugs={tagSlugs} />}
        <PostAuthor />
      </div>
      <SocialShare url={postUrl} title={title} />
      <div className={styles.comments}>
        <Disqus config={disqusConfig} />
      </div>
    </div>
  );
};

export { Post };
