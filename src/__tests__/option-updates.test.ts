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
