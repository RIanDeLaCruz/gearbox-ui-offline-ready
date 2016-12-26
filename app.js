var SubjectLoader = (function() {
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
      console.log(res)
      var departments = JSON.parse(res).files
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
        console.log(department)
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

  return {
    init: _loadSubjectList
  }
})();

SubjectLoader.init()
