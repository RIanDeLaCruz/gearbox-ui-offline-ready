'use strict'

var _sorter = function(a, b) {
  if(typeof a === 'string') {
    a = JSON.parse(a)
  }
  if(typeof b === 'string') {
    b = JSON.parse(b)
  }
  var nameA = a.name.toUpperCase()
  var nameB = b.name.toUpperCase()
  if(nameA > nameB) return 1
  if(nameA < nameB) return -1
  return 0
}

var SubjectLoader = (function() {
  const URL = 'http://gearboxdev.iandelacruz.me'

  var _buildFolderView = function(folderObj, name) {
    var files = folderObj.files.sort(_sorter)
    let filesTemplate = `
      <div class="folders">
        <h1 class="foldername">${name}</h1>
        <ul class="items">
          ${files.map(file =>
            `<li class="item">
               <i class="fa fa-file-pdf-o fa-4x"></i>
               <span class="item-name">
                 ${file.name}
               </span>
             </li>`).join('\n')}
        </ul>
      </div>
    `
    return filesTemplate
  }

  var _retrieveData = function(url) {
    return new Promise(function(resolve, reject){
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function() {
        if(this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          })
        }
      }
      xhr.send();
    })
  }

  var _getSubjects = function() {
    var subjectsPromises = []
    return _retrieveData('http://gearboxdev.iandelacruz.me')
    .then(res => {
      var departments = JSON.parse(res).files
      departments.sort(_sorter)
      departments.map((curr, index, arr) => {
        subjectsPromises.push(
          _retrieveData(`http://gearboxdev.iandelacruz.me/files/${curr.id}/children`)
        )
      })
      return Promise.all(subjectsPromises)
    })
  }

  var _loadSubjectList = function() {
    var subjectsList = document.querySelector('.subjects')
    _getSubjects()
    .then(res => {
      for(var department of res) {
        var subjects = JSON.parse(department).files
        for(var subject of subjects) {
          var li = document.createElement('li')
          li.classList.add('subject')
          li.innerHTML = subject.name
          var a = document.createElement('a')
          a.setAttribute('href', subject.id)
          li.appendChild(a)
          subjectsList.appendChild(li)
        }
      }
    })
  }

  var dropDown = function() {
    var departmentItems = document.querySelectorAll('.department')
    for(var item of departmentItems) {
      var btn = item.querySelector('.department_link')
      btn.addEventListener('click', function(evt) {
        evt.preventDefault()
        var drop = this.nextElementSibling
        drop.classList.toggle('open')
        this.classList.toggle('active')
        var id = this.dataset.id
      })
    }
  }

  var _loadFiles = function(evt) {
    var id = this.dataset.id
    var folderPromises = []
    var folderNames = []
    _retrieveData(`${URL}/files/${id}/children`)
      .then(res => {
        var folders = JSON.parse(res).files
        folders.sort(_sorter)
        folders.map(folder => {
          folderPromises.push(_retrieveData(`${URL}/files/${folder.id}/children`))
          folderNames.push(folder.name)
        })
        return Promise.all(folderPromises)
      })
      .then(res => {
        var mainBody = ''
        var files = res.map((file, idx, arr) => {
          mainBody += _buildFolderView(
            JSON.parse(file),
            folderNames[idx]
          )
          document.querySelector('main').innerHTML = mainBody
        })
      })
  }

  var _buildMenu = function(res) {
    var departments = document.querySelectorAll('.department')
    var loader = document.querySelector('.spin_wrapper')
    loader.classList.toggle('hidden')

    /**
     *
     * n => Array of subjects grouped by department
     */
    var n = res.map((curr, idx, arr) => JSON.parse(curr))
    n.map((curr, idx, arr) => {
      var subjects = curr.files
      subjects.sort(_sorter)
      for(var subj of subjects) {
        var li = document.createElement('li')
        li.classList.add('subject')
        li.innerHTML = subj.name
        li.setAttribute('data-id', subj.id)
        li.addEventListener('click', _loadFiles)
        departments[idx]
          .querySelector('.subjects')
          .appendChild(li)
      }
    })
  }

  return {
    init: _buildMenu,
    getSubjects: _getSubjects,
    dropDownInit: dropDown
  }
})();

var viewSubj = document.querySelector('.toggleModal')
viewSubj.addEventListener('click', function(evt) {
  evt.preventDefault()
  createModal()
})

var createModal = function() {
  var m = document.createElement('div')
  var x = document.createElement('button')
  var departments = document.querySelector('.departments')

  x.innerHTML = 'X'
  x.addEventListener('click', function(evt) {
    evt.preventDefault()
    var sidebar = document.querySelector('.sidebar')
    sidebar.appendChild(departments)
    departments.classList.toggle('open')
    document.querySelector('body').removeChild(document.querySelector('body').lastElementChild)
  })

  m.classList.add('modal')
  m.appendChild(x)
  m.appendChild(departments)

  departments.classList.toggle('open')

  document.querySelector('body').appendChild(m)
}

window.onload = function() {
  SubjectLoader.getSubjects()
  .then(res => {
    SubjectLoader.init(res)
    SubjectLoader.dropDownInit()
  })
  .catch(err => {
    console.log(err)
    alert('err')
  })
}
