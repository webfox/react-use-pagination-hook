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

describe('usePagination option update tests', () => {

  it('can update item count', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    const newItemCount = initialState.itemCount / 2;
    act(() => result.current.setItemCount(newItemCount));
    expect(result.current).toMatchObject({
      itemCount: newItemCount,
      pageCount: pageCount(newItemCount),
      currentPageIndex: 0, // Ensure page is reset with "reset = false"
    });

    // Ensure we can stay on the same page by passing false for reset
    act(() => result.current.gotoLast());
    act(() => result.current.setItemCount(initialState.itemCount, false));
    expect(result.current).toMatchObject({
      itemCount: initialState.itemCount,
      pageCount: pageCount(),
      currentPageIndex: initialState50PageIndex, // Ensure page is not reset with "reset = true"
    });
  });

  it('can update item count with a callback', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    const newItemCount = initialState.itemCount / 2;
    act(() => result.current.setItemCount((state) => state.itemCount / 2));
    expect(result.current).toMatchObject({
      itemCount: newItemCount,
      pageCount: pageCount(newItemCount),
    });
  });

  it('can update items per page', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    const newItemsPerPage = initialState.itemsPerPage / 2;
    act(() => result.current.setItemsPerPage(newItemsPerPage));
    expect(result.current).toMatchObject({
      itemsPerPage: newItemsPerPage,
      pageCount: pageCount(initialState.itemCount, newItemsPerPage),
      currentPageIndex: 0, // Ensure page is reset with "reset = false"
    });

    // Ensure we can stay on the same page by passing false for reset
    act(() => result.current.gotoLast());
    act(() => result.current.setItemsPerPage(initialState.itemsPerPage, false));
    expect(result.current).toMatchObject({
      itemsPerPage: initialState.itemsPerPage,
      pageCount: pageCount(),
      currentPageIndex: initialState100PageIndex, // Ensure page is not reset with "reset = true"
    });
  });

  it('can update items per page with a callback', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    const newItemsPerPage = initialState.itemsPerPage / 2;
    act(() => result.current.setItemsPerPage((state) => state.itemsPerPage / 2));
    expect(result.current).toMatchObject({
      itemsPerPage: newItemsPerPage,
      pageCount: pageCount(initialState.itemCount, newItemsPerPage),
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

  it('can update pages before margin', () => {
    const { result } = renderHook(() => usePagination(initialState));

    act(() => result.current.setPagesBeforeMargin(initialState.pagesBeforeMargin + 1));
    expect(result.current).toMatchObject({
      pagesBeforeMargin: initialState.pagesBeforeMargin + 1,
    });
  });

  it('can update pages before margin with a callback', () => {
    const { result } = renderHook(() => usePagination(initialState));

    act(() => result.current.setPagesBeforeMargin(state => state.pagesBeforeMargin + 1));
    expect(result.current).toMatchObject({
      pagesBeforeMargin: initialState.pagesBeforeMargin + 1,
    });
  });

  it('can update pages after margin', () => {
    const { result } = renderHook(() => usePagination(initialState));

    act(() => result.current.setPagesAfterMargin(initialState.pagesAfterMargin + 1));
    expect(result.current).toMatchObject({
      pagesAfterMargin: initialState.pagesAfterMargin + 1,
    });
  });

  it('can update pages after margin with a callback', () => {
    const { result } = renderHook(() => usePagination(initialState));

    act(() => result.current.setPagesAfterMargin(state => state.pagesAfterMargin + 1));
    expect(result.current).toMatchObject({
      pagesAfterMargin: initialState.pagesAfterMargin + 1,
    });
  });
});
