import { currentRefinements } from 'instantsearch.js/es/widgets';

export const createSelectedTopics = ({ container }: { container: string }) =>
  currentRefinements({
    container,
    includedAttributes: ['aiEnriched.themes'],
  });
