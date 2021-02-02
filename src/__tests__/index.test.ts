import { act, renderHook } from '@testing-library/react-hooks';
import { usePagination } from '../index';

const initialState = {
  itemCount: 2475,
  itemsPerPage: 50,
  initialPageIndex: 0,
  pagesAfterMargin: 4,
  pagesBeforeMargin: 2,
};

const initialStateMiddlePageIndex = Math.ceil(initialState.itemCount / initialState.itemsPerPage / 2);

const pageCount = (itemCount: number, itemsPerPage: number) => Math.ceil(itemCount / itemsPerPage);

describe('usePagination tests', () => {
  it('should be defined', () => {
    expect(usePagination).toBeDefined();
  });

  it('can calculate total pages', () => {
    const { result } = renderHook(() => usePagination(initialState));

    expect(result.current.pageCount).toEqual(pageCount(initialState.itemCount, initialState.itemsPerPage));
  });

  it('can use an initial page index', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialStateMiddlePageIndex }));

    expect(result.current.currentPageIndex).toEqual(initialStateMiddlePageIndex);
    expect(result.current.currentPageNumber).toEqual(initialStateMiddlePageIndex + 1);
  });

  it('can go to the first and last pages', () => {
    const {itemsPerPage, itemCount} = initialState;

    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialStateMiddlePageIndex }));

    act(() => result.current.gotoFirst());
    expect(result.current.currentPageIndex).toEqual(0);
    expect(result.current.currentPageNumber).toEqual(1);

    act(() => result.current.gotoLast());
    expect(result.current.currentPageIndex).toEqual(pageCount(itemCount, itemsPerPage) - 1);
    expect(result.current.currentPageNumber).toEqual(pageCount(itemCount, itemsPerPage));
  });

  it('can calculate item ranges', () => {
    const {itemsPerPage, itemCount} = initialState;
    const { result } = renderHook(() => usePagination({ ...initialState, itemsPerPage, itemCount }));

    // Random Pages
    [0, 1, 10, 17, 30].forEach(pageIndex => {
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

    act(() => result.current.gotoPageIndex(5));
    expect(result.current.hasPastPage).toBe(true);
    expect(result.current.hasFuturePage).toBe(true);

    act(() => result.current.gotoLast());
    expect(result.current.hasPastPage).toBe(true);
    expect(result.current.hasFuturePage).toBe(false);
  });
});
