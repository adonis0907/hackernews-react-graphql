import * as React from 'react';
import Link from 'next/link';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { MainLayout } from '../layouts/main-layout';
import { NewsFeed } from '../components/presentational/NewsFeed';
import { NewsFeedWithApolloRenderer } from '../components/container/NewsFeedWithApolloRenderer';
import { withData } from '../helpers/with-data';

const POSTS_PER_PAGE = 30;

const query = gql`
  query topNewsItems($type: FeedType!, $first: Int!, $skip: Int!) {
    feed(type: $type, first: $first, skip: $skip) {
      ...NewsFeed
    }
  }
  ${NewsFeed.fragments.newsItem}
`;

const ShowHNNewsFeed = graphql(query, {
  options: ({ options: { first, skip } }) => ({
    variables: {
      type: 'SHOW',
      first,
      skip,
    },
  }),
  props: ({ data }) => ({
    data,
  }),
  loadMorePosts: data =>
    data.fetchMore({
      variables: {
        skip: data.allNewsItems.length,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }
        return Object.assign({}, previousResult, {
          // Append the new posts results to the old one
          allNewsItems: [...previousResult.allNewsItems, ...fetchMoreResult.allNewsItems],
        });
      },
    }),
})(NewsFeedWithApolloRenderer);

export default withData(props => {
  const pageNumber = (props.url.query && +props.url.query.p) || 0;
  const notice = [
    <tr key="noticetopspacer" style={{ height: '5px' }} />,
    <tr key="notice">
      <td colSpan="2" />
      <td>
        Please read the{' '}
        <Link prefetch href="/showhn">
          <a>
            <u>rules</u>
          </a>
        </Link>
        . You can also browse the{' '}
        <Link prefetch href="/shownew">
          <a>
            <u>newest</u>
          </a>
        </Link>{' '}
        Show HNs.
      </td>
    </tr>,
    <tr key="noticebottomspacer" style={{ height: '10px' }} />,
  ];
  return (
    <MainLayout currentURL={props.url.pathname}>
      <ShowHNNewsFeed
        options={{
          currentURL: props.url.pathname,
          first: POSTS_PER_PAGE,
          skip: POSTS_PER_PAGE * pageNumber,
          notice,
        }}
      />
    </MainLayout>
  );
});
