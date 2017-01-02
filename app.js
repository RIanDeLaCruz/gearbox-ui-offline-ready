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
  const URL = 'https://gearboxdev.iandelacruz.me'
  var db = new PouchDB('gearbox_cache')

  /* Data Retrieval Methods */
  var _retrieveData = function(url) {
    return db.get(url)
    .then(doc => {
      console.log('From Cache')
      return Promise.resolve(doc.val)
    })
    .catch(err => {
      return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function() {
          if(this.status >= 200 && this.status < 300) {
            db.put({
              _id: url,
              val: xhr.response
            })
            .then(res => {console.log('Saved in DB')})
            .catch(err => {console.warn(err)})
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
    .catch(err => {
      return err
    })
  }

  var _attachDepartmentEventHandlers = function() {
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

  var _buildFolderView = function(folderObj, name) {
    var files = folderObj.files.sort(_sorter)
    let filesTemplate = `
      <div class="folders">
        <h1 class="foldername">${name}</h1>
        <ul class="items">
          ${files.map(file =>
            `<li class="item">
               <a href="https://drive.google.com/open?id=${file.id}" target="_blank">
                 <i class="fa fa-file-pdf-o fa-4x"></i>
                 <span class="item-name">
                     ${file.name}
                 </span>
               </a>
             </li>`).join('\n')}
        </ul>
      </div>
    `
    return filesTemplate
  }

  var _buildFolderSpinner = function() {
    var spinnerDiv = `
  <div class="sk-circle">
    <div class="sk-circle1 sk-child"></div>
    <div class="sk-circle2 sk-child"></div>
    <div class="sk-circle3 sk-child"></div>
    <div class="sk-circle4 sk-child"></div>
    <div class="sk-circle5 sk-child"></div>
    <div class="sk-circle6 sk-child"></div>
    <div class="sk-circle7 sk-child"></div>
    <div class="sk-circle8 sk-child"></div>
    <div class="sk-circle9 sk-child"></div>
    <div class="sk-circle10 sk-child"></div>
    <div class="sk-circle11 sk-child"></div>
    <div class="sk-circle12 sk-child"></div>
  </div>
    `
    document.querySelector('main').innerHTML = spinnerDiv
  }

  var _loadSubjectFiles = function(evt) {
    var id = this.dataset.id
    var subjName = this.dataset.name
    var folderPromises = []
    var folderNames = []

    _deselectAllSubjects()

    this.classList.add('open-subject')

    _removeModal()

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
        mainBody += `
        <div class="subjectTitleWrapper">
          <h2 class="subjectTitle">${subjName}</h2>
        </div>
        `
        var files = res.map((file, idx, arr) => {
          mainBody += _buildFolderView(
            JSON.parse(file),
            folderNames[idx]
          )
          document.querySelector('main').innerHTML = mainBody
        })
      })
  }

  var _buildSubjectList = function(res) {
    var departments = document.querySelectorAll('.department')
    var loader = document.querySelector('.spin_wrapper')
    loader.classList.toggle('hidden')

    var n = res.map((curr, idx, arr) => JSON.parse(curr))
    n.map((curr, idx, arr) => {
      var subjects = curr.files
      subjects.sort(_sorter)
      for(var subj of subjects) {
        var li = document.createElement('li')
        li.classList.add('subject')
        li.innerHTML = subj.name
        li.setAttribute('data-name', subj.name)
        li.setAttribute('data-id', subj.id)
        li.addEventListener('click', _loadSubjectFiles)
        departments[idx]
          .querySelector('.subjects')
          .appendChild(li)
      }
    })
  }

  var _removeModal = function() {
    if(document.querySelector('.modal')) {
      var modal = document.querySelector('.modal')
      var departments = document.querySelector('.departments')
      var sidebar = document.querySelector('.sidebar')

      sidebar.appendChild(departments)
      departments.classList.toggle('open')
      modal.parentNode.removeChild(modal)
    }
    window.scrollTo(0,0)
    _buildFolderSpinner()
  }

  var _deselectAllSubjects = function() {
    var subjects = document.querySelectorAll('.subject')
    for(var subject of subjects) {
      if(subject.classList.contains('open-subject')) {
        subject.classList.remove('open-subject')
      }
    }

  }

  return {
    init: _buildSubjectList,
    getSubjects: _getSubjects,
    dropDownInit: _attachDepartmentEventHandlers
  }
})();

var PouchCache = (function() {
  var db = new PouchDB('gearbox_cache')

  var init = function() {
  }

  return {
    init: init
  }
})()

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
  //if('serviceWorker' in navigator) {
    //navigator.serviceWorker.register(
      //'sw.js',
      //{scope: '/'})
      //.then(reg => {
        //console.log(`SUCCESS: ${reg.scope}`)
      //})
      //.catch(err => {
        //console.log(`ERR: ${err}`)
      //})
  //}
}
