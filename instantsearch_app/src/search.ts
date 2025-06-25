import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { singleIndex } from 'instantsearch.js/es/lib/stateMappings';

import 'instantsearch.css/themes/reset.css';

import {
  articles,
  createAuthors,
  createClearFilters,
  createDates,
  configuration,
  searchBox,
  createSelectedTopics,
  stats,
  topics,
  seeResults,
} from './widgets';

const searchClient = algoliasearch(
  'KHKP14DMQR',
  '4b496fdb0b0c8d368f8dd5bc08e12483'
);

const search = instantsearch({
  searchClient,
  indexName: 'bookmark_manager',
  routing: {
    stateMapping: singleIndex('bookmark_manager'),
  },
  insights: true,
});

const datesDesktop = createDates({
  container: '[data-widget="dates-desktop"]',
  header() {
    return 'Date';
  },
});
const datesMobile = createDates({
  container: '[data-widget="dates-mobile"]',
  header() {
    return 'Date';
  },
});
const selectedTopicsDesktop = createSelectedTopics({
  container: '[data-widget="selected-topics-desktop"]',
});
const selectedTopicsMobile = createSelectedTopics({
  container: '[data-widget="selected-topics-mobile"]',
});
const clearFiltersDesktop = createClearFilters({
  container: '[data-widget="clear-filters-desktop"]',
});
const clearFiltersMobile = createClearFilters({
  container: '[data-widget="clear-filters-mobile"]',
});
const authorsDesktop = createAuthors({
  container: '[data-widget="categories-desktop"]',
});
const authorsMobile = createAuthors({
  container: '[data-widget="categories-mobile"]',
});

search.addWidgets([
  articles,
  authorsDesktop,
  authorsMobile,
  clearFiltersMobile,
  clearFiltersDesktop,
  configuration,
  datesDesktop,
  datesMobile,
  searchBox,
  selectedTopicsMobile,
  selectedTopicsDesktop,
  stats,
  topics,
  seeResults,
]);

export default search;
