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

const pageCount = (itemCount: number = initialState.itemCount, itemsPerPage: number = initialState.itemsPerPage) => Math.ceil(itemCount / itemsPerPage);

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

    expect(result.current.currentPageIndex).toEqual(initialState50PageIndex);
    expect(result.current.currentPageNumber).toEqual(initialState50PageIndex + 1);
  });

  it('can go to the first and last pages', () => {
    const {itemsPerPage, itemCount} = initialState;

    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    act(() => result.current.gotoFirst());
    expect(result.current.currentPageIndex).toEqual(0);
    expect(result.current.currentPageNumber).toEqual(1);

    act(() => result.current.gotoLast());
    expect(result.current.currentPageIndex).toEqual(pageCount(itemCount, itemsPerPage) - 1);
    expect(result.current.currentPageNumber).toEqual(pageCount(itemCount, itemsPerPage));
  });

  it('clamps page navigation', () => {
    const {itemsPerPage, itemCount} = initialState;

    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: pageCount() + 10 }));

    expect(result.current.currentPageIndex).toEqual(pageCount() - 1);
    expect(result.current.currentPageNumber).toEqual(pageCount());

    act(() => result.current.gotoPageIndex(initialState50PageIndex));
    expect(result.current.currentPageIndex).toEqual(initialState50PageIndex);
    expect(result.current.currentPageNumber).toEqual(initialState50PageIndex + 1);

    act(() => result.current.gotoPageIndex(pageCount() + 10));
    expect(result.current.currentPageIndex).toEqual(pageCount() - 1);
    expect(result.current.currentPageNumber).toEqual(pageCount());

    act(() => result.current.gotoPageIndex(-100));
    expect(result.current.currentPageIndex).toEqual(0);
    expect(result.current.currentPageNumber).toEqual(1);
  });

  it('can calculate item ranges', () => {
    const {itemsPerPage, itemCount} = initialState;
    const { result } = renderHook(() => usePagination({ ...initialState, itemsPerPage, itemCount }));

    // Random Pages
    [0, initialState25PageIndex, initialState50PageIndex, initialState75PageIndex].forEach(pageIndex => {
      act(() => result.current.gotoPageIndex(pageIndex));
      expect(result.current.itemStart).toEqual(itemsPerPage * pageIndex);
      expect(result.current.itemEnd).toEqual((itemsPerPage * pageIndex) + itemsPerPage - 1);
    });

    // Partial Page
    act(() => result.current.gotoLast());
    expect(result.current.itemStart).toEqual(itemCount - (itemCount % itemsPerPage));
    expect(result.current.itemEnd).toEqual(itemCount - 1);
  });

  it('knows if there are future and past pages', () => {
    const { result } = renderHook(() => usePagination(initialState));

    expect(result.current.hasPastPage).toBe(false);
    expect(result.current.hasFuturePage).toBe(true);

    act(() => result.current.gotoPageIndex(initialState50PageIndex));
    expect(result.current.hasPastPage).toBe(true);
    expect(result.current.hasFuturePage).toBe(true);

    act(() => result.current.gotoLast());
    expect(result.current.hasPastPage).toBe(true);
    expect(result.current.hasFuturePage).toBe(false);
  });

  it('tracks old page positions', () => {
    const { result } = renderHook(() => usePagination(initialState));

    expect(result.current.oldPageIndex).toBeUndefined();
    expect(result.current.oldPageNumber).toBeUndefined();

    act(() => result.current.gotoPageIndex(initialState25PageIndex));
    expect(result.current.oldPageIndex).toEqual(0);
    expect(result.current.oldPageNumber).toEqual(1);

    act(() => result.current.gotoPageIndex(initialState50PageIndex));
    expect(result.current.oldPageIndex).toEqual(initialState25PageIndex);
    expect(result.current.oldPageNumber).toEqual(initialState25PageIndex + 1);

    act(() => result.current.gotoPageIndex(initialState75PageIndex));
    expect(result.current.oldPageIndex).toEqual(initialState50PageIndex);
    expect(result.current.oldPageNumber).toEqual(initialState50PageIndex + 1);
  });
});
