import { useReducer } from 'react';

interface Page {
  index: number;
  number: number;
}

export interface PageWithNavigation extends Page {
  gotoPage: () => void;
}

interface State {
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

export interface StateWithNavigation extends State {
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
  gotoPageIndex: (index: number) => void;
  /** Navigate to a specific page by number */
  gotoPageNumber: (number: number) => void;
  /** Navigate to the first page */
  gotoFirst: () => void;
  /** Navigate to the last page */
  gotoLast: () => void;
  /** Update the item count */
  setItemCount: (count: number, reset: boolean) => void;
  /** Update the items per page */
  setItemsPerPage: (itemsPerPage: number, reset: boolean) => void;
}

export interface UsePaginationInput {
  /** The total number of items to create pages from */
  itemCount: number;
  /** The current page index */
  initialPageIndex?: number;
  /** The maximum number of items each page should contain */
  itemsPerPage?: number;
  /** The number of pages fixed at the start and end (e.g. if 10 pages 2 would display [<][1][2]...[65]...[9][10][>] */
  pagesBeforeMargin?: number;
  /** The ideal number of pages to display on each side of the current page */
  pagesAfterMargin?: number;
}

type Action =
  | { type: 'GOTO_PAGE'; page: number }
  | { type: 'SET_ITEMS_PER_PAGE'; itemsPerPage: number; reset?: boolean }
  | { type: 'SET_TOTAL_ITEMS'; itemCount: number; reset?: boolean };

const calculateComputedStateProperties = (state: State): State => {
  const totalPages = Math.ceil(state.itemCount / state.itemsPerPage);
  const clampedCurrentPageIndex = Math.floor(Math.max(0, Math.min(state.currentPageIndex, totalPages - 1)));

  return {
    ...state,
    pageCount: totalPages,
    currentPageIndex: clampedCurrentPageIndex,
    currentPageNumber: clampedCurrentPageIndex + 1,
    oldPageNumber: state.oldPageIndex === undefined ? undefined : state.oldPageIndex + 1,
    itemStart: clampedCurrentPageIndex * state.itemsPerPage,
    itemEnd: Math.min(clampedCurrentPageIndex * state.itemsPerPage + state.itemsPerPage, state.itemCount) - 1,
    beforeStartMarginPages: [{ index: 0, number: 1 }],
    afterEndMarginPages: [{ index: 0, number: 1 }],
    beforeCurrentPagePages: [{ index: 0, number: 1 }],
    afterCurrentPagePages: [{ index: 0, number: 1 }],
    hasMorePastPages: false,
    hasMoreFuturePages: false,
    hasPastPage: clampedCurrentPageIndex > 0,
    hasFuturePage: clampedCurrentPageIndex < totalPages - 1,
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'GOTO_PAGE':
      if (state.currentPageIndex === action.page) return state;
      return calculateComputedStateProperties({
        ...state,
        currentPageIndex: action.page,
        oldPageIndex: state.currentPageIndex >= 0 ? state.currentPageIndex : undefined,
      });

    case 'SET_ITEMS_PER_PAGE':
      if (state.itemsPerPage === action.itemsPerPage) return state;
      return calculateComputedStateProperties({
        ...state,
        itemsPerPage: action.itemsPerPage,
      });

    case 'SET_TOTAL_ITEMS':
      if (state.itemCount === action.itemCount) return state;
      return calculateComputedStateProperties({
        ...state,
        itemCount: action.itemCount,
      });
  }
};

export const usePagination = ({
                                itemCount,
                                initialPageIndex = 0,
                                itemsPerPage = 5,
                                pagesBeforeMargin = 0,
                                pagesAfterMargin = 0,
                              }: UsePaginationInput): StateWithNavigation => {
  const [state, dispatch] = useReducer(
    reducer,
    // Fudge the properties calculateComputedStateProperties will fill in for us to give a pseudo state
    calculateComputedStateProperties({
      itemCount,
      pageCount: -1,
      itemsPerPage,
      pagesBeforeMargin,
      pagesAfterMargin,
      currentPageIndex: initialPageIndex,
      currentPageNumber: -1,
      itemStart: -1,
      itemEnd: -1,
      beforeStartMarginPages: [],
      afterEndMarginPages: [],
      beforeCurrentPagePages: [],
      afterCurrentPagePages: [],
      hasMorePastPages: false,
      hasMoreFuturePages: false,
      hasPastPage: false,
      hasFuturePage: false,
    }),
  );

  const { beforeStartMarginPages, afterEndMarginPages, beforeCurrentPagePages, afterCurrentPagePages } = state;

  const addGotoPage = (page: Page): PageWithNavigation => ({
    ...page,
    gotoPage: () => dispatch({ type: 'GOTO_PAGE', page: page.index }),
  });

  return {
    ...state,
    beforeStartMarginPages: beforeStartMarginPages.map(addGotoPage),
    afterEndMarginPages: afterEndMarginPages.map(addGotoPage),
    beforeCurrentPagePages: beforeCurrentPagePages.map(addGotoPage),
    afterCurrentPagePages: afterCurrentPagePages.map(addGotoPage),
    gotoPast: () => {
      dispatch({ type: 'GOTO_PAGE', page: state.currentPageIndex - 1 });
    },
    gotoFuture: () => {
      dispatch({ type: 'GOTO_PAGE', page: state.currentPageIndex + 1 });
    },
    gotoPageIndex: (index) => {
      dispatch({ type: 'GOTO_PAGE', page: index });
    },
    gotoPageNumber: (number) => {
      dispatch({ type: 'GOTO_PAGE', page: number - 1 });
    },
    gotoFirst: () => {
      dispatch({ type: 'GOTO_PAGE', page: 0 });
    },
    gotoLast: () => {
      dispatch({ type: 'GOTO_PAGE', page: state.pageCount - 1 });
    },
    setItemCount: (count: number, reset = true) => {
      dispatch({ type: 'SET_TOTAL_ITEMS', itemCount: count, reset });
    },
    setItemsPerPage: (itemsPerPage: number, reset = true) => {
      dispatch({ type: 'SET_ITEMS_PER_PAGE', itemsPerPage, reset });
    },
  };
};