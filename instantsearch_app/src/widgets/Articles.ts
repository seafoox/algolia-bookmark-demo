import { formatDistanceToNow } from 'date-fns';
import { html, render } from 'htm/preact';
import { Hit } from 'instantsearch.js';
import { connectInfiniteHits } from 'instantsearch.js/es/connectors';
import { Snippet, Highlight } from 'instantsearch.js/es/helpers/components';

type Result = Hit<{
  type: string;
  isRepost: boolean;
  author: {
    name: string;
    followers: number;
    profileUrl: string;
    imageUrl: string;
    isCompany: boolean;
  };
  content: {
    text: string;
    hashtags: string[];
    mentions: Array<{
      name: string;
      profileUrl: string;
    }>;
    externalLinks: string[];
    hasImage: boolean;
    image?: {
      url: string;
      width: number | null;
      height: number | null;
    };
  };
  engagement: {
    likes: number;
    reposts: number;
    comments: number;
  };
  metadata: {
    publishedAt: number;
    visibility: string;
    platform: string;
    extractedAt: number;
  };
  aiEnriched: {
    primaryTopic: string;
    contentType: string;
    themes: string[];
    language: {
      name: string;
      code: string;
    };
    aiGenerated: {
      isLikely: boolean;
      confidence: number;
    };
    confidence: number;
  };
  savedOn: number;
  objectID: string;
}>;

function createHit(
  hit: Result,
  {
    isHighlighted,
    refinedTopic,
  }: { isHighlighted: boolean; refinedTopic: string | undefined }
) {
  const date = formatDistanceToNow(hit.metadata.publishedAt * 1000, {
    addSuffix: true,
  }).replace('about ', '');

  const totalEngagement = hit.engagement.likes + hit.engagement.reposts + hit.engagement.comments;

  return html`
    <li
      class="${`ais-InfiniteHits-item${
        isHighlighted ? ' infinite-hits-item--highlighted' : ''
      }`}"
    >
      <a class="card-link" href="${hit.author.profileUrl}" target="_blank" rel="noopener">
        <article class="card">
          ${hit.content.hasImage && hit.content.image
            ? html`<div class="card-image">
                <img src="${hit.content.image.url}" alt="LinkedIn post image" />
              </div>`
            : ''}

          <div class="card-content" data-layout="desktop">
            <header>
              <span class="card-subject">
                ${refinedTopic || hit.aiEnriched?.primaryTopic}
              </span>
              • 
              <span class="card-timestamp">${date}</span>

            </header>

            <p class="card-description">
              <${Snippet} attribute="content.text" hit=${hit} />

              <div class="card-theme">
              ${hit.aiEnriched?.themes.slice(0, 3).map(theme => 
                html`<a class="badge">${theme}</a>`
              )}
              </div>
            </p>

            <footer>
              <div class="card-author">
                <img
                  class="card-author-avatar"
                  src="${hit.author.imageUrl}"
                  alt="${hit.author.name}"
                />
                <div class="card-author-info">
                  <span class="card-author-name">${hit.author.name}</span>
                  ${hit.author.followers && hit.author.followers > 0
                    ? html`<span class="card-author-job">
                        ${hit.author.followers.toLocaleString()} followers
                      </span>`
                    : ''
                  }
                </div>
              </div>
              
              <div class="card-engagement">
                <span class="card-engagement-stats">
                  ${hit.engagement.likes} likes • ${hit.engagement.reposts} reposts • ${hit.engagement.comments} comments
                </span>
              </div>
            </footer>
          </div>

          <div class="card-content" data-layout="mobile">
            <header>
              <h1 class="card-title">
                <${Highlight} attribute="content.text" hit=${hit} />
              </h1>
            </header>

            <p class="card-mobile-footer">
              <span class="card-subject">
                ${refinedTopic || hit.aiEnriched?.primaryTopic}
              </span>
              • 
              <span class="card-timestamp">${date}</span>
              • 
              <span class="card-engagement-mobile">${totalEngagement} interactions</span>
            </p>
          </div>
        </article>
      </a>
    </li>
  `;
}


function createPlaceholderHit({ isHighlighted }: { isHighlighted: boolean }) {
  return html`
    <li
      class="${`ais-InfiniteHits-item${
        isHighlighted ? ' infinite-hits-item--highlighted' : ''
      }`}"
    >
      <article class="card card--placeholder">
        <div class="card-image"></div>
        <div class="card-content">
          <div class="placeholder-author"></div>
          <div class="placeholder-content"></div>
          <div class="placeholder-engagement"></div>
        </div>
      </article>
    </li>
  `;
}

let globalIsLastPage = false;

const infiniteHits = connectInfiniteHits<{ container: string }>(
  (
    {
      results,
      items,
      showPrevious,
      showMore,
      isFirstPage,
      isLastPage,
      widgetParams,
    },
    isFirstRender
  ) => {
    const { container } = widgetParams;
    const containerNode = document.querySelector(container);

    if (!containerNode) {
      throw new Error(`Container not found`);
    }

    globalIsLastPage = isLastPage;

    if (isFirstRender) {
      const hitsWrapper = document.createElement('div');
      hitsWrapper.classList.add('ais-InfiniteHits');
      const loadMoreTrigger = document.createElement('div');

      containerNode.appendChild(hitsWrapper);
      containerNode.appendChild(loadMoreTrigger);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !globalIsLastPage) {
            showMore();
          }
        });
      });

      observer.observe(loadMoreTrigger);

      render(
        html`
          <ol class="ais-InfiniteHits-list">
            ${[...Array(7)].map((_, index) =>
              createPlaceholderHit({ isHighlighted: index === 0 })
            )}
          </ol>
        `,
        containerNode.querySelector('div')!
      );

      return;
    }

    results = results!;

    if (results.nbHits === 0) {
      render(
        html`
          <div class="infinite-hits-no-results-container">
            <svg
              role="img"
              aria-labelledby="no-results-title"
              viewBox="0 0 64 64"
              class="infinite-hits-no-results-illustration"
            >
              <title id="no-results-title">No results illustration</title>
              <g fill="none" fill-rule="evenodd">
                <g transform="translate(2 2)" stroke-width="2" stroke="currentColor">
                  <circle cx="20" cy="20" r="20"/>
                  <path d="m35.5 35.5 8.485 8.485"/>
                </g>
                <g fill="currentColor">
                  <circle cx="34" cy="50" r="2"/>
                  <circle cx="50" cy="50" r="2"/>
                  <circle cx="50" cy="34" r="2"/>
                </g>
              </g>
            </svg>
            <p class="infinite-hits-no-results-paragraph">
              Sorry, we can't find any LinkedIn posts
              ${results.query ? ` matching "${results.query}"` : ''}.
            </p>
          </div>
        `,
        containerNode.querySelector('div')!
      );
      return;
    }

    const hitsOffset = items.findIndex(
      ({ objectID }) => results.hits[0].objectID === objectID
    );
    const hitsWindow = {
      start: results.hitsPerPage * results.page - hitsOffset + 1,
      end: results.hitsPerPage * results.page + items.length - hitsOffset,
    };

    const refinedTopic = ((facet) => {
      const topic = facet && facet.data.find(({ isRefined }) => isRefined);
      return topic ? topic.name : undefined;
    })(results.hierarchicalFacets.find(({ name }) => name === 'aiEnriched.primaryTopic'));

    render(
      html`
        <div class="previous-hits">
          <p class="previous-hits-message">
            Showing ${hitsWindow.start} - ${hitsWindow.end} out of
            ${results.nbHits} LinkedIn posts
          </p>
          <button class="previous-hits-button">Show previous posts</button>
        </div>
        <ol class="ais-InfiniteHits-list">
          ${items.map((hit, index) =>
            createHit(hit as Result, {
              isHighlighted:
                results.nbHits !== 3 && (index === 0 || results.nbHits === 2),
              refinedTopic,
            })
          )}
        </ol>

        ${results.nbHits > 0 && isLastPage
          ? html`
              <div class="infinite-hits-end">
                <p>${results.nbHits} LinkedIn posts shown</p>
              </div>
            `
          : ''}
      `,
      containerNode.querySelector('div')!
    );

    containerNode
      .querySelector('.previous-hits')!
      .classList.toggle('previous-hits--visible', !isFirstPage);

    containerNode
      .querySelector('.previous-hits-button')!
      .addEventListener('click', () => showPrevious());
  }
);

export const articles = infiniteHits({
  container: '[data-widget="hits"]',
  showPrevious: true,
});
