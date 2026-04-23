import { formatDate, isoWeek } from "./format.js";

export function defaultSchedule(dashboardData) {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);

  const main = new Date(monday);
  main.setDate(monday.getDate() + 2);

  const article = new Date(monday);
  article.setDate(monday.getDate() + 4);

  const brandPost = new Date(monday);
  brandPost.setDate(monday.getDate() + 3);

  return {
    aiTopic: dashboardData.meta?.defaultPairing?.aiTopic || "T01",
    brandTopic: dashboardData.meta?.defaultPairing?.brandTopic || "T07",
    weekId: isoWeek(today),
    dateMain: formatDate(main),
    dateArticle: formatDate(article),
    dateBrandPost: formatDate(brandPost),
  };
}

export function loadStoredSchedule(storageKey, dashboardData) {
  const fallback = defaultSchedule(dashboardData);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function saveStoredSchedule(storageKey, values) {
  localStorage.setItem(storageKey, JSON.stringify(values));
}
