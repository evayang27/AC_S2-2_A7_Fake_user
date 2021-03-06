// 1. API
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USER_PER_PAGE = 30

// 2.1 抓必要element
const dataPanel = document.querySelector('#data-panel')
const like = document.querySelector('#btn-like')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeBox = document.querySelector('#btn-mode-box')
const btnCard = document.querySelector('#btn-mode-card')
const btnList = document.querySelector('#btn-mode-list')
const userModal = document.querySelector('#user-modal')
const genderBtnBox = document.querySelector('#btn-gender-box')

// 2.2 變數 set arr for user data
const users = []
const localList = JSON.parse(localStorage.getItem('favorite-users')) || []
let filteredUsers = []
let mode = 'card'
let currentPage = 1
let heartList
let filteredGender = []

// 3.1 function render user 同時判斷是否已加入收藏
function renderUsers(data, modeVar) {
  let rawHTML = ''
  if (modeVar === 'card') {
    dataPanel.className = 'row row-cols-xl-5  row-cols-lg-4 row-cols-md-3 row-cols-2 no-gutters'
    data.forEach((item) => {
      rawHTML += `
      <div class="mb-3 px-2">
        <div class="card border-0 ">
          <div class="card-img-box rounded">
            <img src="${item.avatar}" class="card-img-top " alt="avatar">
            <div class="overlay modal-trigger" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
              ${item.name} ${item.surname}
            </div>
            <i class="far fa-heart card-heart btn-heart" data-id="${item.id}"></i>
          </div>
        </div>
      </div>
      `
      btnCard.classList.add('btn-mode-on')//btn變色
    })
  } else if (modeVar === 'list') {
    dataPanel.className = 'row no-gutters'
    data.forEach((item) => {
      rawHTML += `
        <div class="col-xl-4 col-md-6 mb-2">
          <div class="px-3 mx-1  list-box">
            <div class="list-frame modal-trigger" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
              <img src="${item.avatar}" alt="avatar" class="rounded-circle list-img modal-trigger" data-id="${item.id}">
              <span class="list-name modal-trigger" data-id="${item.id}">${item.name} ${item.surname}</span>
            </div>
            <i class="far fa-heart list-heart btn-heart" data-id="${item.id}"></i>
          </div>
        </div>
      `
      btnList.classList.add('btn-mode-on')//btn變色
    })
  }
  dataPanel.innerHTML = rawHTML // render data panel
  // detect favorite list render heart icon
  heartList = document.querySelectorAll('.btn-heart')
  heartList.forEach(function favoriteOrNot(item) {
    if (localList.some(favoriteUser => favoriteUser.id === Number(item.dataset.id))) {
      item.classList.add('active-heart', 'fas')
    }
  })
}
// 3.2 start 呼叫API 放入user cards
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderPaginator(users.length)
    renderUsers(getArrByPage(currentPage), mode)
  })
  .catch((err) => console.log(err))

// 4.1 function show modal 
function showUserModal(id) {
  const userImage = document.querySelector('#user-modal-img')
  const userProfile = document.querySelector('#user-modal-text')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const result = response.data
      userImage.innerHTML = `<img src="${result.avatar}" class="rounded-circle modal-img" alt="avatar">`
      userProfile.innerHTML = `
        <h4 class="modal-title">${result.name} ${result.surname}</h4>
          <span class="email">${result.email}</span>
          <span> <i class="fas fa-map-marker-alt mr-1"></i></i>
            ${result.region}</span>
          <span> <i class="fa fa-birthday-cake mr-1" aria-hidden="true"></i>
            ${result.birthday}</span> 
      `
      // 判斷target是否在收藏清單 heart 要變外觀
      if (localList.some(favoriteUser => favoriteUser.id === Number(id))) {
        userProfile.innerHTML += `
        <i class="far fa-heart modal-heart active-heart fas btn-heart" data-id='${id}'></i>
        `
      } else {
        userProfile.innerHTML += `
          <i class="far fa-heart modal-heart btn-heart" data-id='${id}'></i>
        `
      }
    })
}

// 4.2 event click card or list show modal
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.modal-trigger')) {
    showUserModal(event.target.dataset.id)
  } else heartDetect(event.target)
})

// 5.1 新增收藏清單 function
function addToFavorite(id) {

  const goalUser = users.find(userFromAPI => userFromAPI.id === id)
  localList.push(goalUser)
  localStorage.setItem('favorite-users', JSON.stringify(localList))
  // console.log(localStorage.getItem('favorite-users'))
}
// 5.2 移除收藏清單 function
function removeFavorite(id) {
  const removeIndex = localList.findIndex(localUser => localUser.id === id)
  localList.splice(removeIndex, 1)
  localStorage.setItem('favorite-users', JSON.stringify(localList))
}

// 6.1 event search 功能
searchForm.addEventListener('submit', function searchSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredUsers = users.filter((user) => {
    return user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  })
  if (filteredUsers.length === 0) {
    return alert('未找到符合資料')
  }
  filteredGender = []

  currentPage = 1
  renderPaginator(filteredUsers.length)
  renderUsers(getArrByPage(currentPage), mode)
  renderGenderBtn(document.querySelector('.btn-gender-all'))
})

// 7.1 function 分頁功能 render 頁數 計算總共需要幾頁
function renderPaginator(amount) {
  const numbersOfPages = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numbersOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML
  paginator.firstElementChild.classList.add('active')
}
// 7.2 function 分頁功能 得到每頁指定個數的arr 傳回renderUsers
function getArrByPage(page) {
  let data
  if (filteredGender.length !== 0) {
    data = filteredGender
  } else {
    data = filteredUsers.length ? filteredUsers : users
  }
  const starIndex = (page - 1) * USER_PER_PAGE
  return data.slice(starIndex, starIndex + USER_PER_PAGE)
}
// 7.3 event 分頁功能 下一頁 
paginator.addEventListener('click', function onClickPaginator(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)

  const pageList = document.querySelectorAll('.page-item')
  pageList.forEach((pageItem) => {
    pageItem.classList.remove('active')
  })
  event.target.parentNode.classList.add('active')

  renderUsers(getArrByPage(currentPage), mode)
})

// 8.1 event 切換顯示模式
modeBox.addEventListener('click', function changeMode(event) {
  if (event.target.tagName !== 'I') return
  const data = filteredUsers.length ? filteredUsers : users
  mode = event.target === btnCard ? 'card' : 'list'
  btnCard.classList.remove('btn-mode-on')
  btnList.classList.remove('btn-mode-on')
  renderUsers(getArrByPage(currentPage), mode)
})

// 9.1 event click modal-heart sync with btn-heart
userModal.addEventListener('click', function onModalClick(event) {
  const target = event.target
  if (!target.matches('.modal-heart')) return
  // nodelist不能用find 先轉arr
  const heartArray = Array.apply(null, heartList)
  const user = heartArray.find(function (item) {
    return item.dataset.id === target.dataset.id
  })
  user.classList.toggle('active-heart')
  user.classList.toggle('fas')

  heartDetect(target)
})

// 9.2 function 判斷heart
function heartDetect(target) {
  if (target.matches('.active-heart')) {
    target.classList.toggle('active-heart')
    target.classList.toggle('fas')
    removeFavorite(Number(target.dataset.id))
  } else if (target.matches('.btn-heart')) {
    target.classList.toggle('active-heart')
    target.classList.toggle('fas')
    addToFavorite(Number(target.dataset.id))
  }
}

// 10.1 event click btn-gender-filter
genderBtnBox.addEventListener('click', function genderFilter(event) {
  const data = filteredUsers.length ? filteredUsers : users
  if (event.target.matches('.btn-gender-male')) {
    filteredGender = data.filter(item => item.gender === 'male')
  } else if (event.target.matches('.btn-gender-female')) {
    filteredGender = data.filter(item => item.gender === 'female')
  } else {
    filteredGender = data
  }
  if (filteredGender.length === 0) {
    return alert('未找到符合條件對象')
  }
  renderGenderBtn(event.target)
  renderPaginator(filteredGender.length)
  currentPage = 1
  renderUsers(getArrByPage(currentPage), mode)
})

// 10.2 function render btn-gender-filter
function renderGenderBtn(btn) {
  const genderBtnList = document.querySelectorAll('.btn-gender')
  genderBtnList.forEach((item) => { item.classList.remove('btn-gender-on') })
  btn.classList.add('btn-gender-on')
}