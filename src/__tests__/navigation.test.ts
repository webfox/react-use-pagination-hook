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

describe('usePagination navigation tests', () => {

  it('can navigate pages by index', () => {
    const { result } = renderHook(() => usePagination(initialState));

    act(() => result.current.gotoPageIndex(3));
    expect(result.current).toMatchObject({
      currentPageIndex: 3,
      currentPageNumber: 4,
    });
  });

  it('can navigate pages by index with a callback', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    act(() => result.current.gotoPageIndex((state) => state.currentPageIndex + 2));
    expect(result.current).toMatchObject({
      currentPageIndex: initialState50PageIndex + 2,
      currentPageNumber: initialState50PageIndex + 3,
    });
  });

  it('can navigate pages by number', () => {
    const { result } = renderHook(() => usePagination(initialState));

    act(() => result.current.gotoPageNumber(3));
    expect(result.current).toMatchObject({
      currentPageIndex: 2,
      currentPageNumber: 3,
    });
  });

  it('can navigate pages by number with a callback', () => {
    const { result } = renderHook(() => usePagination({ ...initialState, initialPageIndex: initialState50PageIndex }));

    act(() => result.current.gotoPageNumber((state) => state.currentPageNumber + 2));
    expect(result.current).toMatchObject({
      currentPageIndex: initialState50PageIndex + 2,
      currentPageNumber: initialState50PageIndex + 3,
    });
  });

  it('can navigate to the first and last pages', () => {
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

});
