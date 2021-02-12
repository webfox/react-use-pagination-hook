import { act, renderHook } from '@testing-library/react-hooks';
import { usePagination } from '../index';

const initialState = {
  itemCount: 2475,
  itemsPerPage: 50,
  initialPageIndex: 0,
  pagesAfterMargin: 4,
  pagesBeforeMargin: 2,
};

const initialStateLastPageNumber = Math.ceil(initialState.itemCount / initialState.itemsPerPage);
const initialState100PageIndex = initialStateLastPageNumber - 1;
const initialState75PageIndex = Math.ceil(initialStateLastPageNumber * 0.75) - 1;
const initialState50PageIndex = Math.ceil(initialStateLastPageNumber * 0.5) - 1;
const initialState25PageIndex = Math.ceil(initialStateLastPageNumber * 0.25) - 1;

const pageCount = (itemCount: number = initialState.itemCount, itemsPerPage: number = initialState.itemsPerPage) =>
  Math.ceil(itemCount / itemsPerPage);

describe('usePagination calculation tests', () => {

  it('can calculate total pages', () => {
    const { result } = renderHook(() => usePagination(initialState));

    expect(result.current.pageCount).toEqual(pageCount());
  });

  it('can clamp page navigation', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: pageCount() + 10 }));

    expect(result.current).toMatchObject({
      currentPageIndex: pageCount() - 1,
      currentPageNumber: pageCount(),
    });

    act(() => result.current.gotoPageIndex(initialState50PageIndex));
    expect(result.current).toMatchObject({
      currentPageIndex: initialState50PageIndex,
      currentPageNumber: initialState50PageIndex + 1,
    });

    act(() => result.current.gotoPageIndex(pageCount() + 10));
    expect(result.current).toMatchObject({
      currentPageIndex: pageCount() - 1,
      currentPageNumber: pageCount(),
    });

    act(() => result.current.gotoPageIndex(-100));
    expect(result.current).toMatchObject({
      currentPageIndex: 0,
      currentPageNumber: 1,
    });
  });

  it('can calculate item ranges', () => {
    const { itemsPerPage, itemCount } = initialState;
    const { result } = renderHook(() => usePagination({ ...initialState, itemsPerPage, itemCount }));

    // Random Pages
    [0, initialState25PageIndex, initialState50PageIndex, initialState75PageIndex].forEach((pageIndex) => {
      act(() => result.current.gotoPageIndex(pageIndex));
      expect(result.current).toMatchObject({
        itemStart: itemsPerPage * pageIndex,
        itemEnd: itemsPerPage * pageIndex + itemsPerPage - 1,
      });
    });

    // Partial Page
    act(() => result.current.gotoLast());
    expect(result.current).toMatchObject({
      itemStart: itemCount - (itemCount % itemsPerPage),
      itemEnd: itemCount - 1,
    });
  });

  it('can calculate if there are past and future pages', () => {
    const { result } = renderHook(() => usePagination(initialState));

    expect(result.current).toMatchObject({
      hasPastPage: false,
      hasFuturePage: true,
    });

    act(() => result.current.gotoPageIndex(initialState50PageIndex));
    expect(result.current).toMatchObject({
      hasPastPage: true,
      hasFuturePage: true,
    });

    act(() => result.current.gotoLast());
    expect(result.current).toMatchObject({
      hasPastPage: true,
      hasFuturePage: false,
    });
  });

  it('can track old page positions', () => {
    const { result } = renderHook(() => usePagination(initialState));

    expect(result.current.oldPageIndex).toBeUndefined();
    expect(result.current.oldPageNumber).toBeUndefined();

    act(() => result.current.gotoPageIndex(initialState25PageIndex));
    expect(result.current).toMatchObject({
      oldPageIndex: 0,
      oldPageNumber: 1,
    });

    act(() => result.current.gotoPageIndex(initialState50PageIndex));
    expect(result.current).toMatchObject({
      oldPageIndex: initialState25PageIndex,
      oldPageNumber: initialState25PageIndex + 1,
    });

    act(() => result.current.gotoPageIndex(initialState75PageIndex));
    expect(result.current).toMatchObject({
      oldPageIndex: initialState50PageIndex,
      oldPageNumber: initialState50PageIndex + 1,
    });
  });

  it('can calculate before start margin pages', () => {
    const { result } = renderHook(() =>
      usePagination({
        ...initialState,
        itemsPerPage: 5,
        itemCount: 100,
        pagesBeforeMargin: 2,
      }),
    );

    expect(result.current.beforeStartMarginPages).toEqual([]);

    act(() => result.current.gotoPageIndex(1));
    expect(result.current.beforeStartMarginPages.length).toEqual(1);
    expect(result.current.beforeStartMarginPages).toEqual([expect.objectContaining({ index: 0, number: 1 })]);

    act(() => result.current.gotoPageIndex(2));
    expect(result.current.beforeStartMarginPages.length).toEqual(2);
    expect(result.current.beforeStartMarginPages).toEqual([
      expect.objectContaining({ index: 0, number: 1 }),
      expect.objectContaining({ index: 1, number: 2 }),
    ]);

    act(() => result.current.gotoPageIndex(3));
    expect(result.current.beforeStartMarginPages.length).toEqual(2);
    expect(result.current.beforeStartMarginPages).toEqual([
      expect.objectContaining({ index: 0, number: 1 }),
      expect.objectContaining({ index: 1, number: 2 }),
    ]);
  });

  it('can calculate after end margin pages', () => {
    const { result } = renderHook(() =>
      usePagination({
        ...initialState,
        itemsPerPage: 5,
        itemCount: 100,
        pagesBeforeMargin: 2,
      }),
    );

    expect(result.current.afterEndMarginPages.length).toEqual(2);
    expect(result.current.afterEndMarginPages).toEqual([
      expect.objectContaining({ index: 18, number: 19 }),
      expect.objectContaining({ index: 19, number: 20 }),
    ]);

    act(() => result.current.gotoPageIndex(5));
    expect(result.current.afterEndMarginPages.length).toEqual(2);
    expect(result.current.afterEndMarginPages).toEqual([
      expect.objectContaining({ index: 18, number: 19 }),
      expect.objectContaining({ index: 19, number: 20 }),
    ]);

    act(() => result.current.gotoPageIndex(17));
    expect(result.current.afterEndMarginPages.length).toEqual(2);
    expect(result.current.afterEndMarginPages).toEqual([
      expect.objectContaining({ index: 18, number: 19 }),
      expect.objectContaining({ index: 19, number: 20 }),
    ]);

    act(() => result.current.gotoPageIndex(18));
    expect(result.current.afterEndMarginPages.length).toEqual(1);
    expect(result.current.afterEndMarginPages).toEqual([expect.objectContaining({ index: 19, number: 20 })]);

    act(() => result.current.gotoPageIndex(19));
    expect(result.current.afterEndMarginPages.length).toEqual(0);
    expect(result.current.afterEndMarginPages).toEqual([]);
  });

  it('can handle before margin pages being greater than actual pages', () => {
    const { result } = renderHook(() =>
      usePagination({
        ...initialState,
        itemsPerPage: 25,
        itemCount: 125,
        pagesBeforeMargin: 8,
      }),
    );

    expect(result.current.beforeStartMarginPages).toEqual([]);
    expect(result.current.afterEndMarginPages.length).toEqual(4);
    expect(result.current.afterEndMarginPages).toEqual([
      expect.objectContaining({ index: 1, number: 2 }),
      expect.objectContaining({ index: 2, number: 3 }),
      expect.objectContaining({ index: 3, number: 4 }),
      expect.objectContaining({ index: 4, number: 5 }),
    ]);

    act(() => result.current.gotoPageIndex(1));
    expect(result.current.beforeStartMarginPages.length).toEqual(1);
    expect(result.current.beforeStartMarginPages).toEqual([expect.objectContaining({ index: 0, number: 1 })]);
    expect(result.current.afterEndMarginPages.length).toEqual(3);
    expect(result.current.afterEndMarginPages).toEqual([
      expect.objectContaining({ index: 2, number: 3 }),
      expect.objectContaining({ index: 3, number: 4 }),
      expect.objectContaining({ index: 4, number: 5 }),
    ]);

    act(() => result.current.gotoPageIndex(2));
    expect(result.current.beforeStartMarginPages.length).toEqual(2);
    expect(result.current.beforeStartMarginPages).toEqual([
      expect.objectContaining({ index: 0, number: 1 }),
      expect.objectContaining({ index: 1, number: 2 }),
    ]);
    expect(result.current.afterEndMarginPages.length).toEqual(2);
    expect(result.current.afterEndMarginPages).toEqual([
      expect.objectContaining({ index: 3, number: 4 }),
      expect.objectContaining({ index: 4, number: 5 }),
    ]);

    act(() => result.current.gotoPageIndex(3));
    expect(result.current.beforeStartMarginPages.length).toEqual(3);
    expect(result.current.beforeStartMarginPages).toEqual([
      expect.objectContaining({ index: 0, number: 1 }),
      expect.objectContaining({ index: 1, number: 2 }),
      expect.objectContaining({ index: 2, number: 3 }),
    ]);
    expect(result.current.afterEndMarginPages.length).toEqual(1);
    expect(result.current.afterEndMarginPages).toEqual([expect.objectContaining({ index: 4, number: 5 })]);

    act(() => result.current.gotoPageIndex(4));
    expect(result.current.beforeStartMarginPages.length).toEqual(4);
    expect(result.current.beforeStartMarginPages).toEqual([
      expect.objectContaining({ index: 0, number: 1 }),
      expect.objectContaining({ index: 1, number: 2 }),
      expect.objectContaining({ index: 2, number: 3 }),
      expect.objectContaining({ index: 3, number: 4 }),
    ]);
    expect(result.current.afterEndMarginPages).toEqual([]);
  });

});
