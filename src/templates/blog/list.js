// src/templates/blog/list.js - Fixed version
import { renderTemplate } from '../base.js';
import { renderMarkdown } from '../../utils/markdown.js';

function createExcerpt(content, maxLength = 300) {
  // Check for manual excerpt marker
  const moreIndex = content.indexOf('<!--more-->');
  if (moreIndex !== -1) {
    // Return content BEFORE the marker
    return content.substring(0, moreIndex).trim();
  }
  
  // Otherwise use automatic excerpt
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/$$(.+?)$$$.+?$/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/\n{2,}/g, ' ') // Replace multiple newlines with space
    .replace(/\n/g, ' ') // Replace single newlines with space
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Cut at last complete word
  const excerpt = plainText.substring(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(' ');
  return excerpt.substring(0, lastSpace) + '...';
}

export function renderPostList(posts = [], user = null, pagination = null) {
  const postsList = posts.length > 0 
    ? posts.map(post => {
        const excerpt = createExcerpt(post.content);
        const hasMore = post.content.includes('<!--more-->') || post.content.length > 300;
        
        return `
        <article class="post-preview">
          <h2><a href="/post/${post.id}">${post.title}</a></h2>
          <div class="post-meta">
            By ${post.author_username} | ${new Date(post.created_at).toLocaleDateString()}
          </div>
          <div class="post-excerpt">
            ${renderMarkdown(excerpt)}
          </div>
          <div class="post-footer">
            ${hasMore ? `<a href="/post/${post.id}" class="read-more">Read more →</a>` : ''}
            ${user ? `
              <div class="post-actions">
                <a href="/admin/edit/${post.id}" class="button edit-button">Edit</a>
                <form class="delete-link" action="/admin/delete/${post.id}" method="POST" style="display: inline;">
                  <button type="submit" class="button delete-button">Delete</button>
                </form>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('\n')
    : '<p>No posts yet.</p>';

  const paginationHtml = renderPagination(pagination);

  return renderTemplate(
    'Blog Posts',
    `<div class="container">
      ${postsList}
      ${paginationHtml}
    </div>`,
    user
  );
}

function renderPagination(pagination) {
  if (!pagination || pagination.totalPages <= 1) {
    return '';
  }

  const { currentPage, totalPages, hasPrevious, hasNext, previousPage, nextPage } = pagination;
  
  // Generate page numbers
  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return `
    <nav class="pagination" aria-label="Pagination Navigation">
      ${hasPrevious ? `
        <a href="/?page=1" class="pagination-link pagination-first" aria-label="First page">≪</a>
        <a href="/?page=${previousPage}" class="pagination-link pagination-prev" aria-label="Previous page">‹</a>
      ` : `
        <span class="pagination-link pagination-disabled">≪</span>
        <span class="pagination-link pagination-disabled">‹</span>
      `}
      
      ${startPage > 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
      
      ${pageNumbers.map(num => 
        num === currentPage 
          ? `<span class="pagination-link pagination-current" aria-current="page">${num}</span>`
          : `<a href="/?page=${num}" class="pagination-link">${num}</a>`
      ).join('')}
      
      ${endPage < totalPages ? '<span class="pagination-ellipsis">...</span>' : ''}
      
      ${hasNext ? `
        <a href="/?page=${nextPage}" class="pagination-link pagination-next" aria-label="Next page">›</a>
        <a href="/?page=${totalPages}" class="pagination-link pagination-last" aria-label="Last page">≫</a>
      ` : `
        <span class="pagination-link pagination-disabled">›</span>
        <span class="pagination-link pagination-disabled">≫</span>
      `}
      
      <div class="pagination-info">Page ${currentPage} of ${totalPages}</div>
    </nav>
  `;
}