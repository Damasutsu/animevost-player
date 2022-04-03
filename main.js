const searchInput = document.querySelector('.search__input')

const results = document.querySelector('.results')

const resultsAnime = results.querySelector('.results__anime')

const resultsNotFound = results.querySelector('.results__404')

const cache = new Map()

const shownAnime = new Map()

searchInput.value = ''

searchInput.addEventListener('keyup', (e) =>
{
  if (e.code === 'Enter') {
    searchTitles()
  }
})

const controller = new AbortController();
const signal = controller.signal;

async function searchTitles()
{
  let searchTitle = searchInput.value.trim()
  if (searchTitle === '')
  {
    return
  }
  resultsAnime.innerHTML = ''
  let resultsTitles
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
        poster: resultsTitles[i].urlImagePreview,
        id: resultsTitles[i].id
      }))
  }
  resultsAnime.classList.toggle('hidden', false)
  resultsNotFound.classList.toggle('hidden', true)
}

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
  animePosterLink.href = `${location.pathname.replace('/index.html', '/')}anime/?id=${id}`
  let animePoster = document.createElement('img')
  animePoster.classList.add('anime__poster')
  animePoster.src = poster
  animePoster.alt = title
  let animeTitle = document.createElement('a')
  animeTitle.classList.add('anime__title')
  animeTitle.textContent = title
  animeTitle.href = `${location.pathname.replace('/index.html', '/')}anime/?id=${id}`
  animePosterLink.appendChild(animePoster)
  animeElement.appendChild(animePosterLink)
  animeElement.appendChild(animeTitle)
  return animeElement
}
