import { refs } from "./dom.js";
import { state } from "./state.js";
import {
  CATEGORIES,
  CONCEPTS,
  getCategoriesInOrder,
  getConceptsByCategory,
  getLiveConcepts,
} from "../concepts.js";

export function renderCategoryTabs() {
  if (!refs.categoryFilter) return;
  const cats = getCategoriesInOrder();
  const totalCount = CONCEPTS.length;

  let html = `<button class="cat-tab active" data-cat="all">All <span class="cat-count">${totalCount}</span></button>`;
  for (const cat of cats) {
    const count = getConceptsByCategory(cat.id).length;
    html += `<button class="cat-tab" data-cat="${cat.id}">${cat.icon} ${cat.label} <span class="cat-count">${count}</span></button>`;
  }
  refs.categoryFilter.innerHTML = html;
}

export function renderConceptCards() {
  if (!refs.conceptsGrid) return;

  const concepts =
    state.activeCategory === "all" ? CONCEPTS : getConceptsByCategory(state.activeCategory);

  let html = "";
  if (state.activeCategory === "all") {
    const cats = getCategoriesInOrder();
    for (const cat of cats) {
      const catConcepts = concepts.filter((c) => c.category === cat.id);
      if (catConcepts.length === 0) continue;
      html += `<div class="category-group" data-category="${cat.id}">`;
      html += `<h3 class="category-label">${cat.icon} ${cat.label}</h3>`;
      html += `<div class="category-cards">`;
      for (const c of catConcepts) {
        html += renderCard(c);
      }
      html += `</div></div>`;
    }
  } else {
    html += `<div class="category-cards">`;
    for (const c of concepts) {
      html += renderCard(c);
    }
    html += `</div>`;
  }

  refs.conceptsGrid.innerHTML = html;

  if (refs.conceptsCount) {
    const live = getLiveConcepts().length;
    refs.conceptsCount.innerHTML = `<span class="count-text">${live} live / ${CONCEPTS.length} total</span>`;
  }

  if (state.conceptsRevealed) {
    refs.conceptsGrid.querySelectorAll(".concept-card").forEach((card) => {
      card.style.transition = "none";
      card.style.animation = "none";
      card.classList.add("in-view");
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        refs.conceptsGrid.querySelectorAll(".concept-card").forEach((card) => {
          card.style.transition = "";
          card.style.animation = "";
        });
      });
    });
  }
}

function renderCard(c) {
  const isLive = c.status === "live";
  const statusClass = isLive ? "concept-available" : "concept-locked";
  const dotClass = isLive ? "dot-live" : "dot-soon";
  const tagText = isLive ? "Live" : "Locked";
  const arrowText = isLive ? "→" : "🔒";
  const href = c.path ? `data-href="${c.path}"` : "";

  const tabAttr = isLive ? 'tabindex="0" role="button"' : "";

  return `
    <div class="concept-card ${statusClass}" data-concept="${c.id}" ${href} ${tabAttr}>
      <div class="card-glitch-line"></div>
      <div class="card-status-dot ${dotClass}"></div>
      <div class="card-icon">${c.icon}</div>
      <h3 class="card-title">${c.title}</h3>
      <p class="card-hook">${c.hook}</p>
      <div class="card-footer">
        <span class="card-tag">${tagText}</span>
        <span class="card-arrow">${arrowText}</span>
      </div>
    </div>`;
}

export function isCategoryActive(category) {
  return state.activeCategory === category;
}

export function setActiveCategory(category) {
  state.activeCategory = category;
}

export function getCategoryMeta(category) {
  return CATEGORIES[category];
}
