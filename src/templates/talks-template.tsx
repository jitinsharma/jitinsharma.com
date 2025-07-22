import React, { type FC } from "react";

import { graphql } from "gatsby";

import { Feed } from "@/components/feed";
import { Meta } from "@/components/meta";
import { Page } from "@/components/page";
import { Layout } from "@/components/layout";
import { Sidebar } from "@/components/sidebar";
import { useSiteMetadata } from "@/hooks/use-site-metadata";
import type { AllMarkdownRemark } from "@/types/all-markdown-remark";
import type { Node } from "@/types/node";

interface TalksTemplateProps {
  data: {
    markdownRemark: Node;
    allMarkdownRemark: AllMarkdownRemark;
  };
}

const TalksTemplate: FC<TalksTemplateProps> = ({ data }) => {
  const { markdownRemark, allMarkdownRemark } = data;
  const { edges } = allMarkdownRemark;

  return (
    <Layout>
      <Sidebar />
      <Page title={markdownRemark.frontmatter.title}>
        <div dangerouslySetInnerHTML={{ __html: markdownRemark.html }} />
        <Feed edges={edges} />
      </Page>
    </Layout>
  );
};

export const query = graphql`
  query TalksTemplate($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        description
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { template: { eq: "presentation" }, draft: { ne: true } } }
    ) {
      edges {
        node {
          fields {
            categorySlug
            slug
          }
          frontmatter {
            description
            category
            title
            date
            slug
          }
        }
      }
    }
  }
`;

export const Head: FC<TalksTemplateProps> = ({ data }) => {
  const { title, description } = useSiteMetadata();
  const {
    frontmatter: {
      title: pageTitle,
      description: pageDescription = description || "",
    },
  } = data.markdownRemark;

  return (
    <Meta
      title={`${pageTitle} - ${title}`}
      description={pageDescription}
    />
  );
};

export default TalksTemplate;