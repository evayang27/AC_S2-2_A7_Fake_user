// 1. API
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USER_PER_PAGE = 40

// 2.1 抓必要element
const dataPanel = document.querySelector('#data-panel')
const like = document.querySelector('#btn-like')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


// 2.2 變數 set arr for user data
const users = []
const localList = JSON.parse(localStorage.getItem('favorite-users')) || []
let filteredUsers = []


// 3.1 render user card 同時判斷是否已加入收藏 function
function renderUserList(data) {
  let rawHTML = ''
  data.forEach(function favoriteOrNot(item) {
    if (localList.some(localUser => localUser.id === item.id)) {
      rawHTML += `
      <div class="mb-3 px-2">
        <div class="card border-0 ">
          <div class="card-img-box rounded">
            <img src="${item.avatar}" class="card-img-top " alt="avatar">
            <div class="overlay" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
              ${item.name} ${item.surname}
            </div>
            <i class="far fa-heart like-style like-active fas" id='btn-like' data-id="${item.id}"></i>
          </div>
        </div>
      </div>
    `
    } else {
      rawHTML += `
      <div class="mb-3 px-2">
        <div class="card border-0 ">
          <div class="card-img-box rounded">
            <img src="${item.avatar}" class="card-img-top " alt="avatar">
            <div class="overlay" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
              ${item.name} ${item.surname}
            </div>
            <i class="far fa-heart like-style" id='btn-like' data-id="${item.id}"></i>
          </div>
        </div>
      </div>
    `
    }
  })
  dataPanel.innerHTML = rawHTML
}
// function renderUserList(data) {
//   let rawHTML = ''
//   data.forEach((item) => {
//     rawHTML += `
//       <div class="mb-3 px-2">
//         <div class="card border-0 ">
//           <div class="card-img-box rounded">
//             <img src="${item.avatar}" class="card-img-top " alt="avatar">
//             <div class="overlay" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
//               ${item.name} ${item.surname}
//             </div>
//             <i class="far fa-heart like-style" id='btn-like' data-id="${item.id}"></i>
//           </div>
//         </div>
//       </div>
//     `
//   })
//   dataPanel.innerHTML = rawHTML
// }


// 3.2 start 呼叫API 放入user cards
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderPaginator(users.length)
    renderUserList(getArrByPage(1))
  })
  .catch((err) => console.log(err))



// 4.1 show modal function
function showUserModal(id) {
  const userName = document.querySelector('#user-modal-name')
  const userImage = document.querySelector('#user-modal-img')
  const userProfile = document.querySelector('#user-modal-text')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const result = response.data
      userName.innerText = result.name + ' ' + result.surname
      userImage.innerHTML = `<img src="${result.avatar}" class="rounded-circle modal-img" alt="avatar">`
      userProfile.innerHTML = `
        Age : ${result.age}<br>
        Region : ${result.region}<br>
        Birthday : ${result.birthday}<br>
        Email : ${result.email}
      `
    })

}

// 4.2 監聽事件 點擊card出現modal

dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.overlay')) {
    // console.log(event.target.dataset.id)
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.like-active')) {
    event.target.classList.toggle('like-active')
    event.target.classList.toggle('fas')
    removeFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.like-style')) {
    event.target.classList.toggle('like-active')
    event.target.classList.toggle('fas')
    addToFavorite(Number(event.target.dataset.id))
  }

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

// 5.3 是否在收藏清單
// function favoriteOrNot(id) {
//   if (localList.some(localUser => localUser.id === id)) {
//     rawHTML += `
//       <div class="mb-3 px-2">
//         <div class="card border-0 ">
//           <div class="card-img-box rounded">
//             <img src="${item.avatar}" class="card-img-top " alt="avatar">
//             <div class="overlay" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
//               ${item.name} ${item.surname}
//             </div>
//             <i class="far fa-heart like-style like-active" id='btn-like' data-id="${item.id}"></i>
//           </div>
//         </div>
//       </div>
//     `
//   } else {
//     rawHTML += `
//       <div class="mb-3 px-2">
//         <div class="card border-0 ">
//           <div class="card-img-box rounded">
//             <img src="${item.avatar}" class="card-img-top " alt="avatar">
//             <div class="overlay" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
//               ${item.name} ${item.surname}
//             </div>
//             <i class="far fa-heart like-style" id='btn-like' data-id="${item.id}"></i>
//           </div>
//         </div>
//       </div>
//     `
//   }

// }

// 6.1 search 功能
searchForm.addEventListener('submit', function searchSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredUsers = users.filter((user) => {
    return user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  })
  console.log(filteredUsers)
  if (filteredUsers.length === 0) {
    return alert('未找到符合資料')
  }
  renderPaginator(filteredUsers.length)
  renderUserList(getArrByPage(1))

})


// 7.1 分頁功能 render 頁數 計算總共需要幾頁
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

// 7.2 分頁功能 得到每頁指定個數的arr 傳回renderUsers
function getArrByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const starIndex = (page - 1) * USER_PER_PAGE
  return data.slice(starIndex, starIndex + USER_PER_PAGE)
}

// 7.3 分頁功能 下一頁
paginator.addEventListener('click', function onClickPaginator(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  const pageList = document.querySelectorAll('.page-item')
  console.log(page)
  console.log('pageList', pageList)
  console.log(event.target.parentNode)
  pageList.forEach((pageItem) => {
    pageItem.classList.remove('active')
  })
  event.target.parentNode.classList.add('active')
  renderUserList(getArrByPage(page))
})
