const d = document;
const w = window;

const $site = d.querySelector('.site');
const $posts = d.querySelector('.posts');
const $template = d.querySelector('.post-template').content;
const $fragment = d.createDocumentFragment();

const $loader = d.querySelector('.loader');

const DOMAIN = 'https://malvestida.com';
const SITE = `${DOMAIN}/wp-json`;
const API_WP = `${SITE}/wp/v2`;
const POSTS = `${API_WP}/posts?_embed`;
const PAGES = `${API_WP}/pages`;
const CATEGORIES = `${API_WP}/categories`;

let page = 1;
let perPage = 5;

function getSiteData() {
  fetch(SITE)
    .then((res) => (res.ok ? res.json() : Promise.reject(res)))
    .then((json) => {
      // console.log(json);
      $site.innerHTML = `
        <h3>Sitio web</h3>
        <h2><a href="${json.url}" target="_blank">${json.name}</a></h2>
        <p>${json.description}</p>
        <p>${json.timezone_string}</p>
      `;
    })
    .catch((error) => {
      let message = error.statusText || 'Ocurrio un error';
      $site.innerHTML = `<p>${error.status}: ${message}</p>`;
    });
}

function getPosts() {
  $loader.style.display = 'block';

  fetch(`${POSTS}&page=${page}&per_page=${perPage}`)
    .then((res) => (res.ok ? res.json() : Promise.reject(res)))
    .then((json) => {
      // console.log(json);

      json.forEach((el) => {
        let categories = '';
        let tags = '';

        el._embedded['wp:term'][0].forEach((categorie) => {
          categories += `<li>${categorie.name}</li>`;
        });

        el._embedded['wp:term'][1].forEach(
          (tag) => (tags += `<li>${tag.name}</li>`)
        );

        $template.querySelector('.post__image').src =
          el._embedded['wp:featuredmedia'][0].source_url;
        $template.querySelector('.post__image').alt = el.title.rendered;
        $template.querySelector('.post__title').innerHTML = el.title.rendered;
        $template.querySelector('.post__author').innerHTML = `
          <img src="${el._embedded.author[0].avatar_urls[48]}" alt="${el._embedded.author[0].name}" />
          <figcaption>${el._embedded.author[0].name}</figcaption>
        `;
        $template.querySelector('.post__date').innerHTML = new Date(
          el.date
        ).toLocaleDateString('es-MX');
        $template.querySelector('.post__link').href = el.link;
        $template.querySelector('.post__excerp').innerHTML =
          el.excerpt.rendered.replace(' [&hellip;]', '&hellip;');

        $template.querySelector('.post__categories').innerHTML = `
          <p>Categorias:</p>
          <ul>${categories}</ul>
        `;

        $template.querySelector('.post__tags').innerHTML = `
          <p>Etiquetas:</p>
          <ul>${tags}</ul>
        `;

        $template.querySelector('.post__content > article').innerHTML =
          el.content.rendered;

        let $clone = d.importNode($template, true);
        $fragment.appendChild($clone);
      });

      $posts.appendChild($fragment);
      $loader.style.display = 'none';
    })
    .catch((error) => {
      let message = error.statusText || 'Ocurrio un error';
      $posts.innerHTML = `<p>${error.status}: ${message}</p>`;
      $loader.style.display = 'none';
    });
}

d.addEventListener('DOMContentLoaded', (e) => {
  getSiteData();
  getPosts();
});

w.addEventListener('scroll', (e) => {
  const { scrollTop, clientHeight, scrollHeight } = d.documentElement;

  if (scrollTop + clientHeight >= scrollHeight) {
    console.log('Cargar mas post');
    page++;
    getPosts();
  }
});
