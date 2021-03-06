const searchInput = document.querySelector('.search__input')

const results = document.querySelector('.results')

const resultsAnime = results.querySelector('.results__anime')

const resultsNotFound = results.querySelector('.results__404')

const cache = new Map()

const shownAnime = new Map()

searchInput.value = ''

const controller = new AbortController();
const signal = controller.signal;

let query

if (query = new URLSearchParams(location.search).get('q'))
{
  searchInput.value = query
  searchTitles()
}

searchInput.addEventListener('search', (e) =>
{
  searchInput.blur()
  searchTitles()
})

async function searchTitles(push = true)
{
  let searchTitle = searchInput.value.trim()
  if (searchTitle === '')
  {
    return
  }
  resultsAnime.innerHTML = ''
  let resultsTitles
  push && history.pushState(null, '', `?q=${searchTitle}`)
  if (cache.has(searchTitle))
  {
    resultsTitles = cache.get(searchTitle)
  }
  else
  {
    let response
    try
    {
      response = await fetch('https://api.animetop.info/v1/search',
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers:
        {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: `name=${searchTitle}`,
        signal
      })
    }
    catch (e)
    {
      console.log(e)
      return notFound()
    }
    resultsTitles = await response.json()
    if (resultsTitles.status === 'fail') return notFound()
    resultsTitles = resultsTitles.data
    cache.set(searchTitle, resultsTitles)
  }
  for (let i = 0; i < resultsTitles.length; i++)
  {
    if ([...resultsAnime.childNodes].find(anime => anime.dataset.id == resultsTitles[i].id)) continue
    resultsAnime.appendChild(createAnimeElement(
    {
      title: resultsTitles[i].title,
      poster: resultsTitles[i].urlImagePreview.replace('https://', 'http://'),
      id: resultsTitles[i].id
    }))
  }
  resultsAnime.classList.toggle('hidden', false)
  resultsNotFound.classList.toggle('hidden', true)
}

addEventListener('popstate', () =>
{
  if (query = new URLSearchParams(location.search).get('q'))
  {
    searchInput.value = query
    searchTitles(false)
  }
})

function notFound()
{
  resultsAnime.classList.toggle('hidden', true)
  resultsNotFound.classList.toggle('hidden', false)
}

function createAnimeElement(
{
  title,
  poster,
  id
})
{
  let animeElement = document.createElement('div')
  animeElement.classList.add('anime')
  animeElement.dataset.id = id
  let animePosterLink = document.createElement('a')
  animePosterLink.href = `../anime/?id=${id}`
  let animePoster = document.createElement('img')
  animePoster.classList.add('anime__poster')
  animePoster.src = poster
  animePoster.alt = title
  let animeTitle = document.createElement('a')
  animeTitle.classList.add('anime__title')
  animeTitle.textContent = title
  animeTitle.href = `../anime/?id=${id}`
  animePosterLink.appendChild(animePoster)
  animeElement.appendChild(animePosterLink)
  animeElement.appendChild(animeTitle)
  return animeElement
}
