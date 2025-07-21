import React, { type FC } from "react";

import { graphql } from "gatsby";

import { type Node } from "@/types/node";
import { Meta } from "@/components/meta";
import { Post } from "@/components/post";
import { Layout } from "@/components/layout";
import { useSiteMetadata } from "@/hooks/use-site-metadata";

interface PresentationTemplateProps {
  data: {
    markdownRemark: Node;
  };
}

const PresentationTemplate: FC<PresentationTemplateProps> = ({
  data: { markdownRemark },
}) => (
  <Layout>
    <Post post={markdownRemark} />
  </Layout>
);

export const query = graphql`
  query PresentationTemplate($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        slug
        tagSlugs
      }
      frontmatter {
        date
        tags
        title
        description
        socialImage {
          publicURL
        }
      }
    }
  }
`;

export const Head: FC<PresentationTemplateProps> = ({ data }) => {
  const { title, description, url } = useSiteMetadata();

  const {
    frontmatter: {
      title: presentationTitle,
      description: presentationDescription = description || "",
      socialImage,
    },
  } = data.markdownRemark;

  const image = socialImage?.publicURL && url.concat(socialImage?.publicURL);

  return (
    <Meta
      title={`${presentationTitle} - ${title}`}
      description={presentationDescription}
      image={image}
    />
  );
};

export default PresentationTemplate;