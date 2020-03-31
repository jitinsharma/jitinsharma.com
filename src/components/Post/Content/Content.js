// @flow
import React from 'react';
import moment from 'moment';
import { getContactHref } from '../../../utils';
import styles from './Content.module.scss';

type Props = {
  body: string,
  title: string
};

const Content = ({ body, title, date, twitterHandle }: Props) => (
  <div className={styles['content']}>
    <h1 className={styles['content__title']}>{title}</h1>
    <p className={styles['content__author']}>
        <em>Published on {moment(date).format('D MMM YYYY')} by </em>
        <a
          href={getContactHref('twitter', twitterHandle)}
          rel="noopener noreferrer"
          target="_blank">
            <strong> Jitin Sharma</strong>
        </a>
    </p>
    <div className={styles['content__body']} dangerouslySetInnerHTML={{ __html: body }} />
  </div>
);

export default Content;
