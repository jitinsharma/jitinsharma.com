// @flow
import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import Content from '../components/Post/Content';
import Page from '../components/Page';
import { useSiteMetadata } from '../hooks';
import type { MarkdownRemark } from '../types';

type Props = {
    data: {
        markdownRemark: MarkdownRemark
    }
};

const PresentationTemplate = ({ data }: Props) => {
    const { title: siteTitle, subtitle: siteSubtitle, twitterHandle } = useSiteMetadata();
    const { title: postTitle, description: postDescription, date } = data.markdownRemark.frontmatter;
    const metaDescription = postDescription !== null ? postDescription : siteSubtitle;
    const { html } = data.markdownRemark;
    const { title } = data.markdownRemark.frontmatter;

    return (
        <Layout title={`${postTitle} - ${siteTitle}`} description={metaDescription}>
            <Sidebar isIndex />
            <Page>
                <div>
                    <Content body={html} title={title} date={date} twitterHandle={twitterHandle} />
                </div>
            </Page>
        </Layout>
    );
};

export const query = graphql`
  query PresentationBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        slug
        tagSlugs
      }
      frontmatter {
        date
        description
        tags
        title
      }
    }
  }
`;

export default PresentationTemplate;
