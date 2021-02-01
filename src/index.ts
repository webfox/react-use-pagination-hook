import { useReducer } from 'react';
import { buildState, reducer } from './reducer';
import PropTypes from 'prop-types';

export interface PaginationState {
  /** The total number of items to create pages from */
  itemCount: number;
  /** The total number of pages the items have been split into */
  pageCount: number;
  /** The maximum number of items each page should contain */
  itemsPerPage: number;
  /** The number of pages fixed at the start and end (e.g. if 10 pages 2 would display [<][1][2]...[65]...[9][10][>] */
  pagesBeforeMargin: number;
  /** The ideal number of pages to display on each side of the current page */
  pagesAfterMargin: number;
  /** The current page index */
  currentPageIndex: number;
  /** The current page number (index+1) */
  currentPageNumber: number;
  /** The page index before the most recent page change */
  oldPageIndex?: number;
  /** The page number before the most recent page change (oldPageIndex+1) */
  oldPageNumber?: number;
  /** The starting offset position to slice the data */
  itemStart: number;
  /** The finishing offset position to slice the data */
  itemEnd: number;
  /** The list of pages to display before the first page margin */
  beforeStartMarginPages: Array<Page>;
  /** The list of pages to display after the last page margin */
  afterEndMarginPages: Array<Page>;
  /** The list of pages to display before the current page */
  beforeCurrentPagePages: Array<Page>;
  /** The list of pages to display after the current page */
  afterCurrentPagePages: Array<Page>;
  /** Whether there are pages hidden in the start margin */
  hasMorePastPages: boolean;
  /** Whether there are pages hidden in the end margin */
  hasMoreFuturePages: boolean;
  /** Whether there is a 'previous' page */
  hasPastPage: boolean;
  /** Whether there is a 'next' page */
  hasFuturePage: boolean;
}

export interface PaginationStateWithNavigation extends PaginationState {
  /** The list of pages to display before the first page margin */
  beforeStartMarginPages: Array<PageWithNavigation>;
  /** The list of pages to display after the last page margin */
  afterEndMarginPages: Array<PageWithNavigation>;
  /** The list of pages to display before the current page */
  beforeCurrentPagePages: Array<PageWithNavigation>;
  /** The list of pages to display after the current page */
  afterCurrentPagePages: Array<PageWithNavigation>;
  /** Navigate back one page */
  gotoPast: () => void;
  /** Navigate forward one page */
  gotoFuture: () => void;
  /** Navigate to a specific page by index */
  gotoPageIndex: () => void;
  /** Navigate to a specific page by number */
  gotoPageNumber: () => void;
  /** Navigate to the first page */
  gotoFirst: () => void;
  /** Navigate to the last page */
  gotoLast: () => void;
  /** Update the item count */
  setItemCount: (count: number) => void;
  /** Update the items per page */
  setItemsPerPage: (itemsPerPage: number) => void;
}

export interface Page {
  index: number;
  number: number;
}

export interface PageWithNavigation extends Page {
  /** Navigate to this page */
  gotoPage: () => void;
}

export interface PaginationInput {
  /** The total number of items to create pages from */
  itemCount: number;
  /** The maximum number of items each page should contain */
  itemsPerPage?: number;
  /** The number of pages fixed at the start and end (e.g. if 10 pages 2 would display [<][1][2]...[65]...[9][10][>] */
  pagesBeforeMargin?: number;
  /** The ideal number of pages to display on each side of the current page */
  pagesAfterMargin?: number;
  /** The page index to initialize as being active in the pagination component */
  initialPageIndex?: number;
}

export const usePagination = ({
  itemCount,
  itemsPerPage = 10,
  pagesBeforeMargin = 0,
  pagesAfterMargin = 5,
  initialPageIndex = 0,
}: PaginationInput): PaginationStateWithNavigation => {

  const [state, dispatch] = useReducer(
    reducer,
    {
      itemCount,
      itemsPerPage,
      pagesBeforeMargin,
      pagesAfterMargin,
      currentPageIndex: initialPageIndex,
      previousPageIndex: initialPageIndex,
    },
    buildState
  );

  console.log(dispatch);
  return state as PaginationStateWithNavigation;
};

usePagination.PropTypes = {
  itemCount: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number,
  pagesBeforeMargin: PropTypes.number,
  pagesAfterMargin: PropTypes.number,
  initialPageIndex: PropTypes.number,
};

usePagination.defaultProps = {
  itemsPerPage: 10,
  pagesBeforeMargin: 0,
  pagesAfterMargin: 5,
  initialPageIndex: 0,
};
