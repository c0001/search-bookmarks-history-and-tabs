import { getBrowserTabs } from '../helper/browserApi.js'

/**
 * If we don't have a search term yet (or not sufficiently long), display current tab related entries.
 *
 * Finds out if there are any bookmarks or history that match our current open URL.
 */
export async function addDefaultEntries() {
  let results = []

  if (ext.model.searchMode === 'history' && ext.model.history) {
    // Display recent history by default
    results = ext.model.history.map((el) => {
      return {
        searchScore: 1,
        ...el,
      }
    })
  } else if (ext.model.searchMode === 'tabs' && ext.model.tabs) {
    // Display last opened tabs by default
    results = ext.model.tabs
      .map((el) => {
        return {
          searchScore: 1,
          ...el,
        }
      })
      .sort((a, b) => {
        return a.lastVisitSecondsAgo - b.lastVisitSecondsAgo
      })
  } else if (ext.model.searchMode === 'bookmarks' && ext.model.bookmarks) {
    // Display all bookmarks by default
    results = ext.model.bookmarks.map((el) => {
      return {
        searchScore: 1,
        ...el,
      }
    })
  } else {
    // All other modes: Find bookmark / history that matches current page URL
    let currentUrl = window.location.href
    const [tab] = await getBrowserTabs({ active: true, currentWindow: true })

    // If we find no open tab, we're most likely not having a browser API
    // and work in local / test mode. Return nothing.
    if (!tab) {
      return []
    }

    currentUrl = tab.url
    // Remove trailing slash from URL, so the startsWith search works better
    currentUrl = currentUrl.replace(/\/$/, '')

    // Find if current URL has corresponding bookmark(s)
    //
    // TODO: we should add an option
    // const foundBookmarks = ext.model.bookmarks.filter((el) => el.originalUrl.startsWith(currentUrl))
    // results.push(...foundBookmarks)

    // Find if we have browser history that has the same URL
    //
    // TODO: we should add an option
    // let foundHistory = ext.model.history.filter((el) => currentUrl === el.originalUrl)
    // results.push(...foundHistory)

    // Optional: Add a given number of last visited tabs for quick navigation
    // This is similar to the `t ` special search behavior
    if (ext.opts.tabsDisplayLastVisited && ext.model.tabs) {
      const lastVisitedTabs = ext.model.tabs
        .filter((el) => {
          // FIXME(ehome): if `opts.enableHistory' not enabled this is
          // always undefined since it needs the history timestamp
          // attr merged to use, but we hacked `convertBrowserTabs' to
          // did so.
          return el.lastVisitSecondsAgo
        })
        .filter((el) => {
          return el.active === false
        })
        .sort((a, b) => {
          return a.lastVisitSecondsAgo - b.lastVisitSecondsAgo
        })
      results.push(...lastVisitedTabs.slice(0, ext.opts.tabsDisplayLastVisited))
    }
  }

  ext.model.result = results
  return results
}
