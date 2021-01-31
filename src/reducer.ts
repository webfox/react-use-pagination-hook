import { PaginationState } from './index';

type PaginationAction =
  | { type: 'GOTO_PAGE'; page: number }
  | { type: 'SET_ITEMS_PER_PAGE'; itemsPerPage: number; reset?: boolean }
  | { type: 'SET_TOTAL_ITEMS'; totalItems: number; reset?: boolean };

export interface BuildStateInput {
  /** The total number of items to create pages from */
  itemCount: number;
  /** The maximum number of items each page should contain */
  itemsPerPage: number;
  /** The number of pages fixed at the start and end (e.g. if 10 pages 2 would display [<][1][2]...[65]...[9][10][>] */
  pagesBeforeMargin: number;
  /** The ideal number of pages to display on each side of the current page */
  pagesAfterMargin: number;
  /** The page that should be the current page */
  currentPageIndex: number;
  /** The page that was the current page */
  previousPageIndex: number;
}

export function buildState({
  itemCount,
  itemsPerPage,
  pagesBeforeMargin,
  pagesAfterMargin,
  currentPageIndex,
  previousPageIndex,
}: BuildStateInput): PaginationState {
  console.log({
    itemCount,
    itemsPerPage,
    pagesBeforeMargin,
    pagesAfterMargin,
    currentPageIndex,
    previousPageIndex,
  });
  return {} as PaginationState;
}

export function reducer(
  state: PaginationState,
  action?: PaginationAction,
): PaginationState {
  if (!action) {
    return state;
  }

  return {} as PaginationState;
}
