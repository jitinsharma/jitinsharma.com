// @flow
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import Feed from '../components/PresentationFeed';
import Page from '../components/Page';
import { useSiteMetadata } from '../hooks';
import type { PageContext, AllMarkdownRemark } from '../types';

type Props = {
  data: AllMarkdownRemark,
  pageContext: PageContext
};

const PresentationsTemplate = ({ data }: Props) => {
  const { title: siteTitle, subtitle: siteSubtitle } = useSiteMetadata();


  const { edges } = data.allMarkdownRemark;
  const pageTitle = siteTitle;
  console.log(edges)

  return (
    <Layout title={pageTitle} description={siteSubtitle}>
      <Sidebar isIndex />
      <Page>
        <Feed edges={edges} />
      </Page>
    </Layout>
  );
};

export const query = graphql`
  query PresentationsPage {
    allMarkdownRemark(
        filter: { frontmatter: { template: { eq: "presentation" }, draft: { ne: true } } },
        sort: { order: DESC, fields: [frontmatter___date] }
      ){
      edges {
        node {
          fields {
            slug
            categorySlug
          }
          frontmatter {
            title
            date
            category
            description
          }
        }
      }
    }
  }
`;

export default PresentationsTemplate;
