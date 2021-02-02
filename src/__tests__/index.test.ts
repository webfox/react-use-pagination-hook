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

describe('usePagination tests', () => {
  it('should be defined', () => {
    expect(usePagination).toBeDefined();

  });

  it('can calculate total pages', () => {
    const { result } = renderHook(() => usePagination(initialState));

    expect(result.current.pageCount).toEqual(pageCount());

  });

  it('can use an initial page index', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    expect(result.current).toMatchObject({
      currentPageIndex: initialState50PageIndex,
      currentPageNumber: initialState50PageIndex + 1,
    });

  });

  it('can go to the first and last pages', () => {
    const { itemsPerPage, itemCount } = initialState;

    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    act(() => result.current.gotoFirst());
    expect(result.current).toMatchObject({
      currentPageIndex: 0,
      currentPageNumber: 1,
    });

    act(() => result.current.gotoLast());
    expect(result.current).toMatchObject({
      currentPageIndex: pageCount(itemCount, itemsPerPage) - 1,
      currentPageNumber: pageCount(itemCount, itemsPerPage),
    });

  });

  it('clamps page navigation', () => {
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

  it('knows if there are future and past pages', () => {
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

  it('tracks old page positions', () => {
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

  it('can calculate before start margin pages', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, pagesBeforeMargin: 2 }));

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

  it('can can handle before margin pages being greater than actual pages', () => {
    const { result } = renderHook(() =>
      usePagination({
        ...initialState,
        itemsPerPage: 25,
        itemCount: 75,
        pagesBeforeMargin: 10,
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

  });
});
