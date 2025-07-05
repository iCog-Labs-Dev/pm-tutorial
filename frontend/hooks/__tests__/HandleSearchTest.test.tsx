import { renderHook,waitFor } from "@testing-library/react";
import {act} from 'react'
import { useSearch, SearchResult } from "../HandleSearchTest";

describe("useSearch hook", () => {
  // mock out global.fetch
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("does nothing if searchQuery is empty", async () => {
    const { result } = renderHook(() => useSearch());

    // initial state
    expect(result.current.searchQuery).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);

    // calling handleSearch() with empty query should early‐return
    await act(async () => {
      await result.current.handleSearch();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isSearching).toBe(false);
  });

  it("fetches results and updates state on success", async () => {
const fakeData = [
  { url: "/1", title: "T1", relevance: 0.9, description: "d", category: "c", tags: [] },
];

    // mock fetch to return OK + our fake JSON
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => fakeData,
    } as any);
    
    

    const { result} = renderHook(() => useSearch());

    // set the query
    act(() => {
      result.current.setSearchQuery("hello");
    });
    expect(result.current.searchQuery).toBe("hello");

    // trigger the search
    act(() => {
      result.current.handleSearch();
    });

    // wait for the hook to re-render after the fetch
    await waitFor(() => {
  // Wait for the expected state change
  expect(result.current.isSearching).toBe(false);
  expect(global.fetch).toHaveBeenCalledWith("/api/search?q=hello");
  expect(result.current.results).toEqual(fakeData);
  expect(result.current.debugInfo).toMatch(/Found 1 results/);
  expect(result.current.error).toBeNull();
});

    // assertions

    
  });


});
